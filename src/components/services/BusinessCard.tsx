'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Service } from '@/types/service';
import { categoryEmoji, categoryLabel } from '@/lib/categories';
import { Star, MapPin, Clock, ArrowRight } from 'lucide-react';

interface BusinessCardProps {
  service: Service;
  onBook: (service: Service) => void;
}

export default function BusinessCard({ service, onBook }: BusinessCardProps) {
  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300">
      <Link href={`/services/${service.id}`} className="block">
        <div className="relative w-full aspect-[16/10] bg-slate-100 overflow-hidden">
          {service.imageUrl ? (
            <Image
              src={service.imageUrl}
              alt={service.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#eafaf5] to-teal-100 text-6xl">
              {categoryEmoji(service.category)}
            </div>
          )}

          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-900 shadow-sm border border-slate-100">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{service.rating.toFixed(1)}</span>
            <span className="text-[10px] text-slate-500 font-normal">({service.reviewsCount})</span>
          </div>

          {service.providerLocation && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white shadow-xs">
              <MapPin className="h-3 w-3 text-teal-300 shrink-0" />
              <span className="truncate">{service.providerLocation}</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/services/${service.id}`}>
            <h3 className="text-lg font-bold font-serif text-slate-900 group-hover:text-[#025a4e] transition-colors">
              {service.name}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 mt-0.5">{service.providerName}</p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-lg bg-[#eafaf5] px-2.5 py-1 text-[11px] font-medium text-[#025a4e]">
              {categoryLabel(service.category)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
              <Clock className="h-3 w-3" />
              {service.durationMinutes} min
            </span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
              Costo referencial
            </span>
            <span className="text-sm font-bold text-[#025a4e]">
              ${service.price.toLocaleString('es-CO')}
            </span>
          </div>

          <button
            onClick={() => onBook(service)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#025a4e] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#03483e] active:scale-[0.98] transition-all"
          >
            <span>Reservar</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
