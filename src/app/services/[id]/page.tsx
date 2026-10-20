'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Clock, MapPin, Star, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Service } from '@/types/service';
import { Schedule } from '@/types/schedule';
import { DayAvailability } from '@/types/appointment';
import { serviceService } from '@/services/serviceService';
import { scheduleService } from '@/services/scheduleService';
import { appointmentService } from '@/services/appointmentService';
import { categoryEmoji, categoryLabel } from '@/lib/categories';
import { DAY_NAMES, formatDate, formatTime } from '@/lib/agenda';

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [service, setService] = useState<Service | null>(null);
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [days, setDays] = useState<DayAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    serviceService
      .getServiceById(id)
      .then(async (found) => {
        if (!found) return;
        const [providerSchedule, availability] = await Promise.all([
          scheduleService.getSchedule(found.providerId),
          appointmentService.getAvailability(found.providerId, found.durationMinutes),
        ]);
        setService(found);
        setSchedule(providerSchedule);
        setDays(availability);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#025a4e] border-t-transparent" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 gap-4 text-center">
        <p className="text-sm font-semibold text-slate-700">
          {error ? `No se pudo cargar el servicio: ${error}` : 'No encontramos ese servicio. Puede que ya no esté disponible.'}
        </p>
        <Link href="/services" className="text-sm font-semibold text-[#025a4e] hover:underline">
          Volver a los servicios
        </Link>
      </div>
    );
  }

  const nextDaysWithSlots = days.filter((d) => d.slots.length > 0).slice(0, 3);
  const isProvider = user?.role === 'PROVIDER';

  return (
    <div className="min-h-screen bg-[#fafafa] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a los servicios</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="relative w-full h-52 bg-slate-100">
              {service.imageUrl ? (
                <Image src={service.imageUrl} alt={service.name} fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#eafaf5] to-teal-100 text-7xl">
                  {categoryEmoji(service.category)}
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <span className="inline-block rounded-lg bg-[#eafaf5] px-2.5 py-1 text-[11px] font-semibold text-[#025a4e]">
                  {categoryLabel(service.category)}
                </span>
                <h1 className="font-serif text-3xl font-bold text-slate-900 tracking-tight mt-3">{service.name}</h1>
                <p className="text-sm text-slate-500 mt-1">{service.providerName}</p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-slate-500">
                  {service.providerLocation && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {service.providerLocation}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {service.rating.toFixed(1)} ({service.reviewsCount})
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {service.durationMinutes} min
                  </span>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900 mb-1.5">Descripción</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{service.description}</p>
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900 mb-3">Próximos horarios disponibles</h2>
                {nextDaysWithSlots.length === 0 ? (
                  <p className="text-xs text-slate-500 rounded-xl bg-slate-50 border border-slate-100 p-3.5">
                    No hay horarios disponibles en los próximos 14 días.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {nextDaysWithSlots.map((day) => (
                      <div key={day.date}>
                        <p className="text-xs font-semibold text-slate-700 mb-1.5">{formatDate(day.date)}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {day.slots.slice(0, 8).map((slot) => (
                            <span
                              key={slot}
                              className="rounded-lg border border-[#025a4e]/20 bg-[#f0faf7] px-2.5 py-1 text-[11px] font-semibold text-[#025a4e]"
                            >
                              {formatTime(slot)}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Costo referencial</p>
              <p className="text-3xl font-bold text-[#025a4e] mt-1">${service.price.toLocaleString('es-CO')}</p>
              <p className="text-xs text-slate-500 mt-1">Duración: {service.durationMinutes} min</p>

              {!service.isActive ? (
                <p className="mt-5 rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-700 flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Este servicio está desactivado y no se puede reservar.
                </p>
              ) : isProvider ? (
                <p className="mt-5 rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs text-slate-500">
                  Las cuentas de proveedor no pueden reservar citas.
                </p>
              ) : (
                <Link
                  href={`/book?serviceId=${service.id}`}
                  className="mt-5 block w-full rounded-xl bg-[#025a4e] hover:bg-[#03483e] py-3.5 text-center text-sm font-semibold text-white shadow-sm transition-all"
                >
                  Reservar cita
                </Link>
              )}
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <h2 className="text-sm font-bold text-slate-900 mb-3">Horario de atención</h2>
              {schedule.length === 0 ? (
                <p className="text-xs text-slate-500">El proveedor aún no ha configurado su horario.</p>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {WEEK_ORDER.map((day) => {
                    const blocks = schedule.filter((s) => s.dayOfWeek === day);
                    return (
                      <div key={day} className="flex justify-between gap-4 py-2">
                        <span className="font-semibold text-slate-700">{DAY_NAMES[day]}</span>
                        <span className="text-right text-slate-500">
                          {blocks.length > 0
                            ? blocks.map((b) => `${formatTime(b.startTime)} - ${formatTime(b.endTime)}`).join(' · ')
                            : 'Cerrado'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
