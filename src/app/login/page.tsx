'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Star, Loader2, AlertCircle, User, Building2 } from 'lucide-react';

export default function LoginPage() {
  const [role, setRole] = useState<'CLIENT' | 'PROVIDER'>('CLIENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleRoleToggle = (selectedRole: 'CLIENT' | 'PROVIDER') => {
    setRole(selectedRole);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Por favor ingresa tu correo electrónico.');
      return;
    }

    if (!password) {
      setError('Por favor ingresa tu contraseña.');
      return;
    }

    setIsSubmitting(true);
    try {
      const loggedUser = await login({ email, password });

      if (loggedUser.role === 'PROVIDER') {
        router.push('/dashboard/provider');
      } else {
        router.push('/dashboard/client');
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Credenciales inválidas. Por favor verifica tus datos.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col lg:flex-row bg-white">
      <div className="relative hidden lg:block lg:w-1/2 min-h-[680px] xl:min-h-[760px] bg-slate-900">
        <Image
          src="/images/clinic_reception.jpg"
          alt="Recepción de clínica médica moderna"
          fill
          priority
          sizes="50vw"
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

        <div className="absolute bottom-10 left-10 right-10 z-10 space-y-2.5 max-w-xl">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="h-4 w-4 fill-amber-400 text-amber-400"
              />
            ))}
          </div>

          <p className="text-2xl xl:text-[26px] font-bold font-serif text-white leading-snug tracking-tight">
            &ldquo;Nuestra ocupación aumentó un 40% desde que adoptamos Reservia.&rdquo;
          </p>

          <p className="text-xs sm:text-sm text-teal-200/90 font-medium">
            — Dr. Andrés Villa, Clínica Santa Lucía
          </p>
        </div>
      </div>

      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-[420px] space-y-6">
          <div className="text-left space-y-1.5">
            <h1 className="text-3xl sm:text-[34px] font-bold font-serif text-slate-900 tracking-tight">
              Bienvenido de vuelta
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-500">
              ¿No tienes cuenta?{' '}
              <Link
                href={role === 'PROVIDER' ? '/register/provider' : '/register/client'}
                className="font-semibold text-[#025a4e] hover:underline"
              >
                Regístrate gratis
              </Link>
            </p>
          </div>

          <div className="bg-[#f3f4f6] p-1 rounded-xl grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => handleRoleToggle('CLIENT')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                role === 'CLIENT'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="h-3.5 w-3.5 text-[#025a4e]" />
              <span>Soy cliente</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleToggle('PROVIDER')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                role === 'PROVIDER'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="h-3.5 w-3.5 text-[#025a4e]" />
              <span>Soy proveedor</span>
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-[#f9fafb] px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#025a4e] focus:outline-none focus:ring-2 focus:ring-teal-100 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Contraseña
                </label>
                <a
                  href="#olvide-contrasena"
                  onClick={(e) => {
                    e.preventDefault();
                    setError('La recuperación de contraseña aún no está disponible.');
                  }}
                  className="text-xs font-medium text-[#027a6a] hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-[#f9fafb] px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#025a4e] focus:outline-none focus:ring-2 focus:ring-teal-100 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#025a4e] py-3.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#03483e] active:scale-[0.99] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <span>Iniciar sesión</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
