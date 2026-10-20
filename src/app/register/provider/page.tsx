import React from 'react';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Crear cuenta de proveedor - Reservia',
  description: 'Regístrate como proveedor en Reservia y gestiona tu catálogo, horarios y reservas desde tu panel.',
};

export default function RegisterProviderPage() {
  return (
    <div className="min-h-[85vh] bg-white flex items-center justify-center">
      <RegisterForm initialRole="PROVIDER" />
    </div>
  );
}
