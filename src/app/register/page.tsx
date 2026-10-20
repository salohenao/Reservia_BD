import React from 'react';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Crear cuenta - Reservia',
  description: 'Crea tu cuenta en Reservia.',
};

export default function RegisterPage() {
  return (
    <div className="min-h-[85vh] bg-white flex items-center justify-center">
      <RegisterForm initialRole="CLIENT" />
    </div>
  );
}
