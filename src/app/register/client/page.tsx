import React from 'react';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Crear cuenta - Reservia',
  description: 'Regístrate en Reservia para agendar citas en clínicas, salones de belleza y centros deportivos.',
};

export default function RegisterClientPage() {
  return (
    <div className="min-h-[85vh] bg-white flex items-center justify-center">
      <RegisterForm initialRole="CLIENT" />
    </div>
  );
}
