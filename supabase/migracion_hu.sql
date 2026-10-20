-- Reservia - migración para las historias HU-06 a HU-17.
-- No borra tablas ni datos y se puede correr más de una vez.

begin;

create extension if not exists btree_gist;

-- Columnas que usa la app. Si ya existen no pasa nada.
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists description text;
alter table public.profiles add column if not exists website text;
alter table public.profiles add column if not exists cancellation_policy text;

alter table public.services add column if not exists provider_name text;
alter table public.services add column if not exists location text;
alter table public.services add column if not exists image_url text;
alter table public.services add column if not exists tags text[] not null default '{}';

alter table public.appointments add column if not exists service_name text;
alter table public.appointments add column if not exists provider_name text;
alter table public.appointments add column if not exists client_name text;
alter table public.appointments add column if not exists client_email text;
alter table public.appointments add column if not exists client_phone text;
alter table public.appointments add column if not exists image_url text;

update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id and p.email is null;

update public.services s
set provider_name = coalesce(nullif(p.business_name, ''), p.name)
from public.profiles p
where p.id = s.provider_id and s.provider_name is null;

update public.appointments a
set service_name = coalesce(a.service_name, s.name),
    provider_name = coalesce(a.provider_name, s.provider_name)
from public.services s
where s.id = a.service_id;

update public.appointments a
set client_name = coalesce(a.client_name, p.name),
    client_email = coalesce(a.client_email, p.email),
    client_phone = coalesce(a.client_phone, p.phone)
from public.profiles p
where p.id = a.client_id;

create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.profiles(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  check (start_time < end_time)
);

create index if not exists idx_schedules_provider on public.schedules(provider_id);

drop view if exists public.busy_slots;

alter table public.appointments alter column time type time using time::time;

-- Si dos citas activas de un mismo proveedor se cruzan, se cancela la más nueva
update public.appointments a
set status = 'CANCELLED'
where a.status in ('PENDING', 'CONFIRMED')
  and exists (
    select 1
    from public.appointments b
    where b.id <> a.id
      and b.provider_id = a.provider_id
      and b.status in ('PENDING', 'CONFIRMED')
      and tsrange(b.date + b.time, b.date + b.time + b.duration_minutes * interval '1 minute')
          && tsrange(a.date + a.time, a.date + a.time + a.duration_minutes * interval '1 minute')
      and (b.created_at, b.id) < (a.created_at, a.id)
  );

alter table public.appointments drop constraint if exists appointments_no_overlap;
alter table public.appointments add constraint appointments_no_overlap exclude using gist (
  provider_id with =,
  tsrange(date + time, date + time + duration_minutes * interval '1 minute') with &&
) where (status in ('PENDING', 'CONFIRMED'));

create index if not exists idx_appointments_provider_date on public.appointments(provider_id, date);

create view public.busy_slots as
  select provider_id, date, time, duration_minutes
  from public.appointments
  where status in ('PENDING', 'CONFIRMED');

grant select on public.busy_slots to anon, authenticated;

alter table public.schedules enable row level security;

drop policy if exists "Cualquiera puede ver los horarios" on public.schedules;
drop policy if exists "Un proveedor crea sus horarios" on public.schedules;
drop policy if exists "Un proveedor edita sus horarios" on public.schedules;
drop policy if exists "Un proveedor borra sus horarios" on public.schedules;

create policy "Cualquiera puede ver los horarios" on public.schedules
  for select using (true);

create policy "Un proveedor crea sus horarios" on public.schedules
  for insert with check (auth.uid() = provider_id);

create policy "Un proveedor edita sus horarios" on public.schedules
  for update using (auth.uid() = provider_id);

create policy "Un proveedor borra sus horarios" on public.schedules
  for delete using (auth.uid() = provider_id);

drop policy if exists "Un cliente autenticado puede reservar" on public.appointments;

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

drop policy if exists "Cualquiera puede ver los perfiles" on public.profiles;
drop policy if exists "Ver mi perfil o el de un proveedor" on public.profiles;

create policy "Ver mi perfil o el de un proveedor" on public.profiles
  for select using (auth.uid() = id or role = 'PROVIDER');

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

-- Perfil para las cuentas que existen en auth.users pero se quedaron sin fila en profiles
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

commit;
