import React from 'react';
import { Search, CalendarDays, CheckCircle2 } from 'lucide-react';

export default function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      icon: Search,
      iconBg: 'bg-sky-50',
      iconColor: 'text-sky-600',
      title: 'Busca y elige',
      description:
        'Explora por categoría, ciudad o nombre. Revisa el catálogo, precios y horarios de cada proveedor.',
    },
    {
      step: '02',
      icon: CalendarDays,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      title: 'Elige tu horario',
      description:
        'Consulta disponibilidad en tiempo real y selecciona la fecha y hora que más te conviene.',
    },
    {
      step: '03',
      icon: CheckCircle2,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      title: 'Confirmación inmediata',
      description:
        'Recibe tu confirmación al instante. Cancela o reprograma fácilmente desde tu panel personal.',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 tracking-tight">
            ¿Cómo funciona?
          </h2>
          <p className="text-sm text-slate-500 mt-2.5">
            Tres pasos y tu cita queda confirmada al instante.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative rounded-2xl border border-slate-100 bg-[#fafafa] p-8 transition-all hover:bg-white hover:shadow-md hover:border-slate-200"
              >
                {/* Top row with icon and big faint number */}
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.iconBg} ${item.iconColor}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-4xl font-bold font-serif text-slate-200 select-none">
                    {item.step}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-slate-900 mt-6 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-2.5 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
