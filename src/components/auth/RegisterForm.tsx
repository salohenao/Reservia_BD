'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { User as UserIcon, Building2, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RegisterFormProps {
  initialRole?: 'CLIENT' | 'PROVIDER';
}

export default function RegisterForm({ initialRole = 'CLIENT' }: RegisterFormProps) {
  const [role, setRole] = useState<'CLIENT' | 'PROVIDER'>(initialRole);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    businessName: '',
    password: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { registerClient, registerProvider } = useAuth();
  const router = useRouter();

  const handleRoleChange = (newRole: 'CLIENT' | 'PROVIDER') => {
    setRole(newRole);
    setErrors({});
    setSubmitError(null);
    setEmailSent(false);
    if (newRole === 'CLIENT') {
      window.history.replaceState(null, '', '/register/client');
    } else {
      window.history.replaceState(null, '', '/register/provider');
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.name.trim()) {
      errs.name = 'El nombre completo es obligatorio.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errs.email = 'El correo electrónico es obligatorio.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = 'Ingresa un correo electrónico válido.';
    }

    if (role === 'PROVIDER' && !formData.businessName.trim()) {
      errs.businessName = 'El nombre del negocio es obligatorio.';
    }

    if (!formData.password) {
      errs.password = 'La contraseña es obligatoria.';
    } else if (formData.password.length < 8) {
      errs.password = 'La contraseña debe tener mínimo 8 caracteres.';
    }

    if (!formData.acceptTerms) {
      errs.acceptTerms = 'Debes aceptar los Términos de uso y la Política de privacidad.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (role === 'CLIENT') {
        const created = await registerClient({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        if (created) router.push('/dashboard/client');
        else setEmailSent(true);
      } else {
        const created = await registerProvider({
          name: formData.name,
          email: formData.email,
          businessName: formData.businessName,
          password: formData.password,
        });
        if (created) router.push('/dashboard/provider');
        else setEmailSent(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ocurrió un error durante el registro.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto py-10 sm:py-16 px-4">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 tracking-tight">
          Crea tu cuenta
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          ¿Ya tienes cuenta?{' '}
          <Link
            href="/login"
            className="font-semibold text-[#025a4e] hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </div>

      <div className="mt-8 mb-8 flex justify-center">
        <div className="inline-flex rounded-2xl bg-[#f1f5f9] p-1.5 w-full max-w-md">
          <button
            type="button"
            onClick={() => handleRoleChange('CLIENT')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              role === 'CLIENT'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserIcon className="h-4 w-4 text-indigo-600" />
            <span>Soy cliente</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('PROVIDER')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              role === 'PROVIDER'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="h-4 w-4 text-teal-600" />
            <span>Soy proveedor</span>
          </button>
        </div>
      </div>

      {submitError && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-rose-50 p-3.5 text-xs text-rose-700 border border-rose-200 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{submitError}</span>
        </div>
      )}

      {emailSent && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-[#eafaf5] p-3.5 text-xs text-[#034d43] border border-teal-100">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#025a4e]" />
          <span>
            Cuenta creada. Revisa tu correo para confirmarla y luego{' '}
            <Link href="/login" className="font-semibold underline">
              inicia sesión
            </Link>
            .
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nombre completo
            </label>
            <input
              type="text"
              placeholder="Ana García"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              className={`w-full rounded-xl border bg-[#f9fafb] px-3.5 py-2.5 sm:py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.name
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                  : 'border-slate-200 focus:border-[#025a4e] focus:ring-teal-100'
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="tu@correo.com"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              className={`w-full rounded-xl border bg-[#f9fafb] px-3.5 py-2.5 sm:py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.email
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                  : 'border-slate-200 focus:border-[#025a4e] focus:ring-teal-100'
              }`}
            />
            {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
          </div>
        </div>

        {role === 'PROVIDER' && (
          <div className="animate-in fade-in duration-200">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nombre del negocio
            </label>
            <input
              type="text"
              placeholder="Clínica San Rafael / Salón Elara"
              value={formData.businessName}
              onChange={(e) => {
                setFormData({ ...formData, businessName: e.target.value });
                if (errors.businessName) setErrors({ ...errors, businessName: '' });
              }}
              className={`w-full rounded-xl border bg-[#f9fafb] px-3.5 py-2.5 sm:py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.businessName
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                  : 'border-slate-200 focus:border-[#025a4e] focus:ring-teal-100'
              }`}
            />
            {errors.businessName && (
              <p className="mt-1 text-xs text-rose-600">{errors.businessName}</p>
            )}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Contraseña
          </label>
          <input
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
              if (errors.password) setErrors({ ...errors, password: '' });
            }}
            className={`w-full rounded-xl border bg-[#f9fafb] px-3.5 py-2.5 sm:py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
              errors.password
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                : 'border-slate-200 focus:border-[#025a4e] focus:ring-teal-100'
            }`}
          />
          {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password}</p>}
        </div>

        {role === 'PROVIDER' && (
          <div className="rounded-xl bg-[#eafaf5] border border-teal-100 p-3.5 text-xs text-[#034d43] leading-relaxed animate-in fade-in duration-200">
            <strong className="font-bold text-[#025a4e]">Cuenta de proveedor:</strong>{' '}
            podrás configurar tu catálogo, horarios y gestionar reservas desde tu panel.
          </div>
        )}

        <div className="pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={(e) => {
                setFormData({ ...formData, acceptTerms: e.target.checked });
                if (errors.acceptTerms) setErrors({ ...errors, acceptTerms: '' });
              }}
              className="h-4 w-4 rounded border-slate-300 text-[#025a4e] focus:ring-[#025a4e] cursor-pointer"
            />
            <span className="text-xs text-slate-600">
              Acepto los{' '}
              <a
                href="#terminos"
                onClick={(e) => e.preventDefault()}
                className="text-[#025a4e] underline hover:text-[#03483e]"
              >
                Términos de uso
              </a>{' '}
              y la{' '}
              <a
                href="#privacidad"
                onClick={(e) => e.preventDefault()}
                className="text-[#025a4e] underline hover:text-[#03483e]"
              >
                Política de privacidad
              </a>
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="mt-1 text-xs text-rose-600">{errors.acceptTerms}</p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#025a4e] py-3.5 px-4 text-sm font-bold text-white shadow-sm hover:bg-[#03483e] active:scale-[0.99] transition-all disabled:opacity-75"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Procesando cuenta...</span>
              </>
            ) : role === 'CLIENT' ? (
              <span>Crear cuenta gratuita</span>
            ) : (
              <span>Crear cuenta de proveedor</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
