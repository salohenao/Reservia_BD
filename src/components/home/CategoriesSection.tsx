'use client';

import React, { useEffect, useState } from 'react';
import {
  Building2,
  Scissors,
  Dumbbell,
  Sparkles,
} from 'lucide-react';
import { serviceService } from '@/services/serviceService';

interface CategoriesSectionProps {
  onSelectCategory?: (category: string) => void;
  selectedCategory?: string;
}

export default function CategoriesSection({ onSelectCategory, selectedCategory }: CategoriesSectionProps) {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    serviceService
      .getAllServices()
      .then((services) => {
        const result: Record<string, number> = {};
        services.forEach((s) => {
          result[s.category] = (result[s.category] ?? 0) + 1;
        });
        setCounts(result);
      })
      .catch(() => setCounts({}));
  }, []);

  const categories = [
    {
      id: 'SALUD',
      name: 'Clínicas y Salud',
      bgColor: 'bg-[#f0f9ff]',
      borderColor: 'border-[#e0f2fe]',
      hoverBorder: 'hover:border-sky-300',
      iconBg: 'bg-white',
      iconColor: 'text-sky-600',
      icon: Building2,
    },
    {
      id: 'BELLEZA',
      name: 'Belleza y Estética',
      bgColor: 'bg-[#fdf2f8]',
      borderColor: 'border-[#fce7f3]',
      hoverBorder: 'hover:border-pink-300',
      iconBg: 'bg-white',
      iconColor: 'text-pink-600',
      icon: Scissors,
    },
    {
      id: 'DEPORTES',
      name: 'Deportes y Fitness',
      bgColor: 'bg-[#f0fdf4]',
      borderColor: 'border-[#dcfce7]',
      hoverBorder: 'hover:border-emerald-300',
      iconBg: 'bg-white',
      iconColor: 'text-emerald-600',
      icon: Dumbbell,
    },
    {
      id: 'BIENESTAR',
      name: 'Bienestar y Spa',
      bgColor: 'bg-[#fefce8]',
      borderColor: 'border-[#fef9c3]',
      hoverBorder: 'hover:border-amber-300',
      iconBg: 'bg-white',
      iconColor: 'text-amber-600',
      icon: Sparkles,
    },
  ];

  return (
    <section id="categorias" className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="mb-10 text-left">
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 tracking-tight">
            Explora por categoría
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Cientos de proveedores verificados listos para atenderte.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            const total = counts ? (counts[cat.id] ?? 0) : null;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory?.(isSelected ? 'ALL' : cat.id)}
                className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 flex items-center gap-4 ${cat.bgColor} ${cat.borderColor} ${cat.hoverBorder} ${
                  isSelected ? 'ring-2 ring-[#025a4e] shadow-md' : 'hover:shadow-sm'
                }`}
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${cat.iconBg} ${cat.iconColor} shadow-xs`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {total === null ? 'Cargando...' : `${total} ${total === 1 ? 'servicio' : 'servicios'}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
