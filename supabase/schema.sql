-- Reservia - esquema completo para Supabase.
-- Borra y vuelve a crear las tablas. Si ya tienes datos que quieres conservar,
-- corre supabase/migracion_hu.sql en lugar de este archivo.

create extension if not exists btree_gist;

drop view if exists public.busy_slots;
drop table if exists public.appointments cascade;
drop table if exists public.schedules cascade;
drop table if exists public.services cascade;
drop table if exists public.profiles cascade;
drop table if exists public.users cascade;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null check (role in ('CLIENT', 'PROVIDER')),
  phone text,
  avatar_url text,
  birth_date text,
  gender text,
  business_name text,
  business_category text,
  address text,
  city text,
  document_number text,
  description text,
  website text,
  cancellation_policy text,
  created_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.profiles(id) on delete cascade,
  provider_name text not null,
  name text not null,
  description text not null default 'Servicio profesional certificado.',
  category text not null check (
    category in ('SALUD', 'BELLEZA', 'DEPORTES', 'BIENESTAR', 'ODONTOLOGIA', 'FISIOTERAPIA', 'OTRO')
  ),
  price numeric(12, 2) not null check (price >= 0),
  duration_minutes int not null check (duration_minutes > 0),
  rating numeric(2, 1) not null default 5.0,
  review_count int not null default 0,
  image_url text,
  location text,
  tags text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.schedules (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.profiles(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  check (start_time < end_time)
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  service_name text not null,
  provider_id uuid not null references public.profiles(id) on delete cascade,
  provider_name text not null,
  client_id uuid not null references public.profiles(id) on delete cascade,
  client_name text not null,
  client_email text not null,
  client_phone text,
  date date not null,
  time time not null,
  status text not null default 'PENDING' check (
    status in ('CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED')
  ),
  price numeric(12, 2) not null,
  duration_minutes int not null,
  image_url text,
  notes text,
  created_at timestamptz not null default now(),
  constraint appointments_no_overlap exclude using gist (
    provider_id with =,
    tsrange(date + time, date + time + duration_minutes * interval '1 minute') with &&
  ) where (status in ('PENDING', 'CONFIRMED'))
);

create index idx_services_provider on public.services(provider_id);
create index idx_schedules_provider on public.schedules(provider_id);
create index idx_appointments_provider_date on public.appointments(provider_id, date);
create index idx_appointments_client on public.appointments(client_id);
create index idx_appointments_service on public.appointments(service_id);

create view public.busy_slots as
  select provider_id, date, time, duration_minutes
  from public.appointments
  where status in ('PENDING', 'CONFIRMED');

grant select on public.busy_slots to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.schedules enable row level security;
alter table public.appointments enable row level security;

create policy "Ver mi perfil o el de un proveedor" on public.profiles
  for select using (auth.uid() = id or role = 'PROVIDER');

create policy "Un usuario solo edita su propio perfil" on public.profiles
  for update using (auth.uid() = id);

create policy "Cualquiera puede ver servicios activos" on public.services
  for select using (is_active = true or auth.uid() = provider_id);

create policy "Un proveedor solo crea servicios para sí mismo" on public.services
  for insert with check (auth.uid() = provider_id);

create policy "Un proveedor solo edita sus propios servicios" on public.services
  for update using (auth.uid() = provider_id);

create policy "Un proveedor solo elimina sus propios servicios" on public.services
  for delete using (auth.uid() = provider_id);

create policy "Cualquiera puede ver los horarios" on public.schedules
  for select using (true);

create policy "Un proveedor crea sus horarios" on public.schedules
  for insert with check (auth.uid() = provider_id);

create policy "Un proveedor edita sus horarios" on public.schedules
  for update using (auth.uid() = provider_id);

create policy "Un proveedor borra sus horarios" on public.schedules
  for delete using (auth.uid() = provider_id);

create policy "Cliente o proveedor ven sus propias citas" on public.appointments
  for select using (auth.uid() = client_id or auth.uid() = provider_id);

create policy "Un cliente autenticado puede reservar" on public.appointments
  for insert with check (
    auth.uid() = client_id
    and exists (
      select 1 from public.services s
      where s.id = appointments.service_id
        and s.provider_id = appointments.provider_id
        and s.is_active = true
    )
  );

create policy "Cliente o proveedor pueden actualizar sus citas" on public.appointments
  for update using (auth.uid() = client_id or auth.uid() = provider_id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role, phone, city, business_name, business_category)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Usuario'),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'role', 'CLIENT'),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'city',
    new.raw_user_meta_data->>'business_name',
    new.raw_user_meta_data->>'business_category'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Perfiles para las cuentas que ya existían en auth.users antes de volver a crear las tablas
insert into public.profiles (id, name, email, role, phone, city, business_name, business_category)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'name', 'Usuario'),
  coalesce(u.email, ''),
  coalesce(u.raw_user_meta_data->>'role', 'CLIENT'),
  u.raw_user_meta_data->>'phone',
  u.raw_user_meta_data->>'city',
  u.raw_user_meta_data->>'business_name',
  u.raw_user_meta_data->>'business_category'
from auth.users u
on conflict (id) do nothing;

notify pgrst, 'reload schema';
