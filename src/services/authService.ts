import {
  AuthResponse,
  LoginCredentials,
  RegisterClientDto,
  RegisterProviderDto,
  User,
} from '@/types/auth';
import { supabase } from '@/lib/supabaseClient';

interface ProfileRow {
  id: string;
  name: string;
  email: string;
  role: 'CLIENT' | 'PROVIDER';
  phone: string | null;
  avatar_url: string | null;
  birth_date: string | null;
  gender: string | null;
  business_name: string | null;
  business_category: string | null;
  address: string | null;
  city: string | null;
  document_number: string | null;
  description: string | null;
  website: string | null;
  cancellation_policy: string | null;
  created_at: string;
}

function fromProfileRow(row: ProfileRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    phone: row.phone ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
    birthDate: row.birth_date ?? undefined,
    gender: row.gender ?? undefined,
    businessName: row.business_name ?? undefined,
    businessCategory: row.business_category ?? undefined,
    address: row.address ?? undefined,
    city: row.city ?? undefined,
    documentNumber: row.document_number ?? undefined,
    description: row.description ?? undefined,
    website: row.website ?? undefined,
    cancellationPolicy: row.cancellation_policy ?? undefined,
    createdAt: row.created_at,
  };
}

function toProfileUpdate(updates: Partial<User>): Record<string, string | null> {
  const row: Record<string, string | null> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.phone !== undefined) row.phone = updates.phone || null;
  if (updates.avatarUrl !== undefined) row.avatar_url = updates.avatarUrl || null;
  if (updates.birthDate !== undefined) row.birth_date = updates.birthDate || null;
  if (updates.gender !== undefined) row.gender = updates.gender || null;
  if (updates.businessName !== undefined) row.business_name = updates.businessName || null;
  if (updates.businessCategory !== undefined) row.business_category = updates.businessCategory || null;
  if (updates.address !== undefined) row.address = updates.address || null;
  if (updates.city !== undefined) row.city = updates.city || null;
  if (updates.documentNumber !== undefined) row.document_number = updates.documentNumber || null;
  if (updates.description !== undefined) row.description = updates.description || null;
  if (updates.website !== undefined) row.website = updates.website || null;
  if (updates.cancellationPolicy !== undefined) row.cancellation_policy = updates.cancellationPolicy || null;
  return row;
}

function authMessage(message: string): string {
  if (message.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (message.includes('Email not confirmed')) return 'Debes confirmar tu correo antes de iniciar sesión.';
  if (message.includes('User already registered')) return 'Ya existe una cuenta con este correo electrónico.';
  if (message.includes('Database error saving new user')) {
    return 'No se pudo guardar el perfil. Revisa que el SQL de Supabase esté actualizado.';
  }
  if (message.includes('Failed to fetch')) {
    return 'No se pudo conectar con Supabase. Revisa la URL en .env.local y tu conexión.';
  }
  return message;
}

class AuthService {
  private async fetchProfile(userId: string): Promise<User> {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) throw new Error(`No se pudo cargar el perfil: ${error.message}`);
    if (!data) throw new Error('Tu cuenta no tiene perfil. Corre supabase/migracion_hu.sql en Supabase.');
    return fromProfileRow(data as ProfileRow);
  }

  private async signUp(
    email: string,
    password: string,
    metadata: Record<string, string | null>
  ): Promise<AuthResponse | null> {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: metadata },
    });
    if (error) throw new Error(authMessage(error.message));
    if (!data.user) throw new Error('No se pudo crear la cuenta.');
    if (data.user.identities && data.user.identities.length === 0) {
      throw new Error('Ya existe una cuenta con este correo electrónico.');
    }
    if (!data.session) return null;

    const user = await this.fetchProfile(data.user.id);
    return { token: data.session.access_token, user };
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email.trim(),
      password: credentials.password,
    });
    if (error || !data.user || !data.session) {
      throw new Error(error ? authMessage(error.message) : 'No se pudo iniciar sesión.');
    }

    const user = await this.fetchProfile(data.user.id);
    return { token: data.session.access_token, user };
  }

  registerClient(data: RegisterClientDto): Promise<AuthResponse | null> {
    return this.signUp(data.email, data.password, {
      name: data.name.trim(),
      role: 'CLIENT',
      phone: data.phone?.trim() || null,
      city: data.city?.trim() || null,
    });
  }

  registerProvider(data: RegisterProviderDto): Promise<AuthResponse | null> {
    return this.signUp(data.email, data.password, {
      name: data.name.trim(),
      role: 'PROVIDER',
      phone: data.phone?.trim() || null,
      city: data.city?.trim() || null,
      business_name: data.businessName.trim(),
      business_category: data.businessCategory?.trim() || 'SALUD',
    });
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .update(toProfileUpdate(updates))
      .eq('id', userId)
      .select()
      .single();
    if (error || !data) throw new Error('No se pudo actualizar el perfil.');

    const user = fromProfileRow(data as ProfileRow);

    if (user.role === 'PROVIDER') {
      const { error: servicesError } = await supabase
        .from('services')
        .update({
          provider_name: user.businessName || user.name,
          location: user.city ?? null,
        })
        .eq('provider_id', userId);
      if (servicesError) throw new Error('El perfil se guardó, pero no se pudieron actualizar tus servicios.');
    }

    return user;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (newPassword.length < 8) throw new Error('La nueva contraseña debe tener mínimo 8 caracteres.');

    const { data } = await supabase.auth.getSession();
    const email = data.session?.user.email;
    if (!email) throw new Error('No hay una sesión activa.');

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });
    if (verifyError) throw new Error('La contraseña actual no es correcta.');

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  }

  async getCurrentSession(): Promise<{ user: User | null; token: string | null }> {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return { user: null, token: null };

    try {
      const user = await this.fetchProfile(data.session.user.id);
      return { user, token: data.session.access_token };
    } catch {
      return { user: null, token: null };
    }
  }

  logout(): void {
    void supabase.auth.signOut();
  }
}

export const authService = new AuthService();
