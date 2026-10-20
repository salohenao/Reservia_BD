'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, Star, MapPin, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/auth/AuthGuard';
import { appointmentService } from '@/services/appointmentService';
import { serviceService } from '@/services/serviceService';
import { Service } from '@/types/service';
import { DayAvailability } from '@/types/appointment';
import { categoryEmoji } from '@/lib/categories';
import { formatDate, formatTime, parseISODate } from '@/lib/agenda';

const DAY_NAMES_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const STEPS = ['Servicio', 'Horario', 'Confirmar'];

function BookingWizardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const serviceId = searchParams.get('serviceId') || searchParams.get('id') || '';

  const [business, setBusiness] = useState<Service | null>(null);
  const [days, setDays] = useState<DayAvailability[]>([]);
  const [cancellationHours, setCancellationHours] = useState(24);
  const [isLoading, setIsLoading] = useState(serviceId !== '');
  const [loadError, setLoadError] = useState<string | null>(null);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId) return;

    serviceService
      .getServiceById(serviceId)
      .then(async (found) => {
        if (!found || !found.isActive) return;
        const [availability, hours] = await Promise.all([
          appointmentService.getAvailability(found.providerId, found.durationMinutes),
          appointmentService.getCancellationHours(found.providerId),
        ]);
        setBusiness(found);
        setDays(availability);
        setCancellationHours(hours);
        setSelectedDate(availability.find((d) => d.slots.length > 0)?.date ?? availability[0].date);
      })
      .catch((err: Error) => setLoadError(err.message))
      .finally(() => setIsLoading(false));
  }, [serviceId]);

  const slotsOfSelectedDay = days.find((d) => d.date === selectedDate)?.slots ?? [];
  const hasAnySlot = days.some((d) => d.slots.length > 0);

  const chooseDate = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleConfirm = async () => {
    if (!business || !user) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await appointmentService.createAppointment(business, user, selectedDate, selectedTime, notes);
      setStep(4);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo confirmar la reserva.');
      setSelectedTime('');
      setStep(2);
      appointmentService
        .getAvailability(business.providerId, business.durationMinutes)
        .then(setDays)
        .catch(() => {});
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#025a4e] border-t-transparent" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-8 gap-4 text-center">
        <p className="text-sm font-semibold text-slate-700">
          {loadError
            ? `No se pudo cargar el servicio: ${loadError}`
            : 'No encontramos ese servicio. Puede que ya no esté disponible.'}
        </p>
        <Link href="/services" className="text-sm font-semibold text-[#025a4e] hover:underline">
          Volver al catálogo →
        </Link>
      </div>
    );
  }

  const price = `$${business.price.toLocaleString('es-CO')}`;

  return (
    <div className="min-h-screen bg-[#fafafa] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {step === 4 ? (
          <div className="mx-auto max-w-lg animate-in zoom-in-95 duration-300">
            <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.04)] text-center">
              <div className="w-16 h-16 rounded-full bg-[#eafaf5] text-[#025a4e] flex items-center justify-center mx-auto mb-5 shadow-xs">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <h1 className="font-serif text-3xl font-bold text-slate-900 mb-2">¡Reserva confirmada!</h1>
              <p className="text-xs text-slate-500 mb-8 max-w-sm mx-auto">
                Tu cita en <strong className="text-slate-800 font-semibold">{business.providerName}</strong> quedó
                confirmada.
              </p>

              <div className="bg-[#fafafa] rounded-2xl p-5 mb-8 text-xs text-left divide-y divide-slate-100/80 border border-slate-100">
                <div className="flex justify-between py-2.5">
                  <span className="text-slate-400">Servicio</span>
                  <span className="font-bold text-slate-900">{business.name}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-slate-400">Duración</span>
                  <span className="font-bold text-slate-900">{business.durationMinutes} min</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-slate-400">Fecha</span>
                  <span className="font-bold text-slate-900">{formatDate(selectedDate)}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-slate-400">Hora</span>
                  <span className="font-bold text-slate-900">{formatTime(selectedTime)}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-slate-400">Valor estimado</span>
                  <span className="font-bold text-slate-900">{price}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-slate-400">Estado</span>
                  <span className="font-bold text-[#025a4e]">Confirmada</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/dashboard/client?tab=citas"
                  className="w-full inline-block bg-[#025a4e] hover:bg-[#03483e] text-white font-semibold text-xs sm:text-sm py-3 rounded-xl shadow-sm transition-all text-center"
                >
                  Ver mis citas
                </Link>
                <Link
                  href="/services"
                  className="w-full inline-block border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm py-3 rounded-xl transition-colors text-center"
                >
                  Explorar más servicios
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <button
                onClick={() => router.push('/services')}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a resultados</span>
              </button>
            </div>

            <div className="flex items-center gap-4 mb-8">
              {STEPS.map((label, index) => {
                const number = index + 1;
                const isDone = step > number;
                const isCurrent = step === number;
                return (
                  <React.Fragment key={label}>
                    {index > 0 && (
                      <div className={`h-[2px] w-12 sm:w-16 ${step >= number ? 'bg-[#025a4e]' : 'bg-slate-200'}`} />
                    )}
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isDone
                            ? 'bg-[#025a4e] text-white'
                            : isCurrent
                            ? 'border-2 border-[#025a4e] text-[#025a4e]'
                            : 'border-2 border-slate-200 text-slate-400'
                        }`}
                      >
                        {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : number}
                      </div>
                      <span className={`text-xs font-semibold ${step >= number ? 'text-[#025a4e]' : 'text-slate-400'}`}>
                        {label}
                      </span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                {submitError && (
                  <div className="mb-5 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                    <span>{submitError}</span>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
                        Confirma el servicio
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">Vas a reservar en {business.providerName}</p>
                    </div>

                    <div className="rounded-2xl p-5 border-2 border-[#025a4e] bg-[#f0faf7]">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 leading-snug">{business.name}</h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">{business.durationMinutes} min</p>
                        </div>
                        <span className="text-lg font-bold text-[#025a4e]">{price}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-3">{business.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full bg-[#025a4e] hover:bg-[#03483e] text-white font-semibold text-xs sm:text-sm py-3.5 rounded-xl shadow-sm transition-all"
                    >
                      Continuar →
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
                        Elige la fecha y hora
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Solo se muestran los horarios que están libres en la agenda del proveedor.
                      </p>
                    </div>

                    {!hasAnySlot ? (
                      <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 text-xs text-amber-700">
                        Este proveedor no tiene horarios disponibles en los próximos 14 días.
                      </div>
                    ) : (
                      <>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2.5">
                            Fecha
                          </span>
                          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                            {days.map((day) => {
                              const date = parseISODate(day.date);
                              const isSelected = selectedDate === day.date;
                              const isFull = day.slots.length === 0;
                              return (
                                <button
                                  key={day.date}
                                  type="button"
                                  disabled={isFull}
                                  onClick={() => chooseDate(day.date)}
                                  className={`py-3 rounded-xl text-xs font-bold text-center transition-all ${
                                    isFull
                                      ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                                      : isSelected
                                      ? 'bg-[#025a4e] text-white shadow-sm'
                                      : 'bg-white border border-slate-200 text-slate-800 hover:border-[#025a4e]'
                                  }`}
                                >
                                  <span className="block text-[9px] font-semibold opacity-70">
                                    {DAY_NAMES_SHORT[date.getDay()]}
                                  </span>
                                  {date.getDate()}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-3">
                            Horas disponibles — {formatDate(selectedDate)}
                          </span>

                          <div className="grid grid-cols-3 gap-2.5">
                            {slotsOfSelectedDay.map((slot) => (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => setSelectedTime(slot)}
                                className={`py-2.5 rounded-xl text-xs font-semibold text-center transition-all ${
                                  selectedTime === slot
                                    ? 'bg-[#025a4e] text-white shadow-sm border border-[#025a4e]'
                                    : 'bg-white border border-slate-200 text-slate-800 hover:border-[#025a4e]'
                                }`}
                              >
                                {formatTime(slot)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm py-3 rounded-xl transition-colors text-center"
                      >
                        ← Atrás
                      </button>
                      <button
                        type="button"
                        disabled={!selectedTime}
                        onClick={() => setStep(3)}
                        className="flex-1 bg-[#025a4e] hover:bg-[#03483e] disabled:opacity-50 text-white font-semibold text-xs sm:text-sm py-3 rounded-xl shadow-sm transition-all text-center"
                      >
                        Continuar →
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
                        Confirma tu reserva
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">Revisa los detalles antes de confirmar</p>
                    </div>

                    <div className="bg-[#fafafa] rounded-2xl p-4 sm:p-5 text-xs divide-y divide-slate-100/80 border border-slate-100">
                      <div className="flex justify-between py-2">
                        <span className="text-slate-400">Proveedor</span>
                        <span className="font-bold text-slate-900">{business.providerName}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-400">Servicio</span>
                        <span className="font-bold text-slate-900">{business.name}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-400">Duración</span>
                        <span className="font-bold text-slate-900">{business.durationMinutes} min</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-400">Fecha</span>
                        <span className="font-bold text-slate-900">{formatDate(selectedDate)}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-400">Hora</span>
                        <span className="font-bold text-slate-900">{formatTime(selectedTime)}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-400">Valor estimado</span>
                        <span className="font-bold text-slate-900">{price}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Notas para el proveedor (opcional)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Alergias, indicaciones especiales, preferencias..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full bg-[#fafafa] border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#025a4e]"
                      />
                    </div>

                    <div className="bg-[#fffbeb] border border-[#fef3c7] text-[#b45309] text-[11px] font-medium p-3.5 rounded-xl">
                      Política de cancelación: puedes cancelar o reprogramar hasta {cancellationHours} horas antes de la
                      cita.
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="flex-1 border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm py-3 rounded-xl transition-colors text-center"
                      >
                        ← Atrás
                      </button>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleConfirm}
                        className="flex-1 bg-[#025a4e] hover:bg-[#03483e] disabled:opacity-50 text-white font-semibold text-xs sm:text-sm py-3 rounded-xl shadow-sm transition-all text-center"
                      >
                        {isSubmitting ? 'Confirmando...' : 'Confirmar reserva'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] lg:sticky lg:top-28">
                <div className="w-full h-44 bg-gradient-to-br from-[#eafaf5] to-teal-100 flex items-center justify-center text-6xl">
                  {categoryEmoji(business.category)}
                </div>

                <div className="p-6">
                  <h3 className="font-serif text-lg font-bold text-slate-900 leading-snug">{business.providerName}</h3>

                  {business.providerLocation && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{business.providerLocation}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 mt-2">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{business.rating.toFixed(1)}</span>
                    <span className="text-slate-400 font-normal">calificación</span>
                  </div>

                  <div className="bg-[#eafaf5] rounded-2xl p-4 mt-5">
                    <p className="text-xs font-bold text-[#025a4e] leading-tight">{business.name}</p>
                    <p className="text-[11px] text-[#025a4e]/80 font-medium mt-1">
                      {business.durationMinutes} min · {price}
                    </p>
                    {selectedTime && (
                      <p className="text-[11px] text-[#025a4e] font-semibold mt-2">
                        {formatDate(selectedDate)} · {formatTime(selectedTime)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <AuthGuard allowedRoles={['CLIENT']}>
      <React.Suspense
        fallback={
          <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#025a4e] border-t-transparent" />
          </div>
        }
      >
        <BookingWizardContent />
      </React.Suspense>
    </AuthGuard>
  );
}
