import React from 'react';
import { Star } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      id: '1',
      rating: 5,
      quote:
        'Antes llamaba 3 veces para conseguir una cita. Ahora reservo en 2 minutos desde mi teléfono, a cualquier hora del día.',
      name: 'María González',
      role: 'Paciente — Clínica Dental Del Valle',
      avatarUrl:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    },
    {
      id: '2',
      rating: 5,
      quote:
        'Eliminamos el 90% de las cancelaciones de último minuto. Los recordatorios automáticos cambiaron todo para nuestro negocio.',
      name: 'Carlos Mendoza',
      role: 'Propietario — FitZone Gym',
      avatarUrl:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face',
    },
    {
      id: '3',
      rating: 5,
      quote:
        'Agendo mi turno viendo la disponibilidad real. Sin esperas, sin llamadas, sin incertidumbre. Perfecto.',
      name: 'Andrea Ríos',
      role: 'Cliente — Salón Elara',
      avatarUrl:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face',
    },
  ];

  return (
    <section id="testimonios" className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="mb-12 text-left">
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 tracking-tight">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Miles de clientes y negocios ya confían en Reservia.
          </p>
        </div>

        {/* 3 Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-7 shadow-sm hover:shadow-md transition-all"
            >
              <div>
                {/* 5 Yellow Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              {/* Author */}
              <div className="mt-8 flex items-center gap-3 pt-4 border-t border-slate-100/80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.avatarUrl}
                  alt={item.name}
                  className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {item.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
