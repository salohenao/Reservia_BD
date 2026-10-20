import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Check } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white pt-10 pb-16 lg:pt-14 lg:pb-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-6 space-y-6">
            {/* Tag / Badge */}
            <div className="inline-flex items-center rounded-full bg-[#eafaf5] px-3.5 py-1 text-xs font-semibold text-[#025a4e]">
              Disponibilidad en tiempo real
            </div>

            {/* Main Headline with Serif and italic highlight */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold text-[#111827] tracking-tight leading-[1.14] font-serif">
              Reserva tu cita{' '}
              <span className="text-[#027a6a] italic font-serif">en segundos</span>
              , no en llamadas
            </h1>

            {/* Subheading */}
            <p className="text-base text-slate-600 leading-relaxed max-w-xl">
              Conectamos clientes con clínicas, salones de belleza y centros deportivos. Agenda, reprograma o cancela desde cualquier lugar.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#025a4e] px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[#03483e] active:scale-[0.98] transition-all"
              >
                <span>Explorar servicios</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/register/provider"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 active:scale-[0.98] transition-all"
              >
                Soy proveedor de servicios
              </Link>
            </div>

            {/* Social Proof / Users Confirmed */}
            <div className="pt-2 flex items-center gap-3">
              <div className="flex -space-x-2 overflow-hidden">
                {/* eslint-disable @next/next/no-img-element */}
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face"
                  alt="Usuario"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
                  alt="Usuario"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face"
                  alt="Usuario"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face"
                  alt="Usuario"
                />
                {/* eslint-enable @next/next/no-img-element */}
              </div>
              <p className="text-xs text-slate-600">
                <strong className="font-bold text-slate-900">+24.000</strong> usuarios confían en Reservia
              </p>
            </div>
          </div>

          {/* Right Column: Hero Visual with Doctor and Floating Cards */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none rounded-[28px] overflow-hidden shadow-2xl shadow-slate-200 border border-slate-100 aspect-[4/3] bg-slate-100">
              <Image
                src="/images/doctor_hero.jpg"
                alt="Doctor utilizando la aplicación Reservia en consultorio médico"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                className="object-cover object-center"
              />

              {/* Floating Badge Top Right */}
              <div className="absolute top-4 right-4 rounded-xl bg-[#025a4e] px-3.5 py-2 text-white shadow-lg backdrop-blur-sm">
                <p className="text-[10px] text-teal-100 font-medium">Próxima disponibilidad</p>
                <p className="text-xs font-bold mt-0.5">Hoy mismo</p>
              </div>

              {/* Floating Card Bottom Left */}
              <div className="absolute bottom-4 left-4 rounded-2xl bg-white/95 backdrop-blur-md p-3.5 px-4 shadow-xl border border-slate-100/80 flex items-center gap-3 animate-in fade-in">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eafaf5] text-[#025a4e]">
                  <Check className="h-4 w-4 stroke-[3]" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium leading-none">Reserva confirmada</p>
                  <p className="text-xs font-bold text-slate-900 mt-1 flex items-center gap-1">
                    <span>Hoy, 3:30 PM</span>
                    <span className="text-[#025a4e]">✓</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
