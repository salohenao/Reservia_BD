export type UserRole = 'PROVIDER' | 'CLIENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  birthDate?: string;
  gender?: string;
  // Campos específicos de proveedor
  businessName?: string;
  businessCategory?: string;
  address?: string;
  city?: string;
  documentNumber?: string;
  description?: string;
  website?: string;
  cancellationPolicy?: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterClientDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
}

export interface RegisterProviderDto {
  name: string;
  email: string;
  password: string;
  businessName: string;
  phone?: string;
  businessCategory?: string;
  address?: string;
  city?: string;
  documentNumber?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
