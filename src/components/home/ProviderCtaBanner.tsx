import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function ProviderCtaBanner() {
  return (
    <section id="para-negocios" className="py-14 sm:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="rounded-[28px] bg-[#025a4e] p-8 sm:p-12 lg:p-14 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          
          {/* Left copy */}
          <div className="max-w-2xl space-y-3">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif tracking-tight text-white">
              ¿Eres proveedor de servicios?
            </h2>
            <p className="text-sm sm:text-base text-teal-100/90 leading-relaxed max-w-xl">
              Digitaliza tu agenda, gestiona tu catálogo y atrae más clientes. Sin complicaciones, sin comisiones en la primera fase.
            </p>
          </div>

          {/* Action button */}
          <div className="shrink-0">
            <Link
              href="/register/provider"
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-white px-7 py-3.5 sm:py-4 text-sm font-bold text-[#025a4e] shadow-md hover:bg-slate-100 active:scale-[0.98] transition-all text-center"
            >
              <span>Registrar mi negocio</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}

