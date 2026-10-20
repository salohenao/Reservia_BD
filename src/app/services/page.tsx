'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, AlertCircle } from 'lucide-react';
import { Service } from '@/types/service';
import { serviceService } from '@/services/serviceService';
import { CATEGORIES, categoryLabel } from '@/lib/categories';
import BusinessCard from '@/components/services/BusinessCard';

function ServicesPageContent() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get('category') ?? '';
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(
    CATEGORIES.some((c) => c.id === categoryFromUrl) ? categoryFromUrl : 'TODAS'
  );
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    serviceService
      .getAllServices()
      .then(setServices)
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const categories = [{ id: 'TODAS', label: 'Todas', emoji: '' }, ...CATEGORIES];

  const countOf = (categoryId: string) =>
    categoryId === 'TODAS' ? services.length : services.filter((s) => s.category === categoryId).length;

  const query = searchQuery.toLowerCase().trim();
  const filtered = services.filter((s) => {
    const matchesCategory = selectedCategory === 'TODAS' || s.category === selectedCategory;
    const matchesSearch =
      !query ||
      s.name.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query) ||
      s.providerName.toLowerCase().includes(query) ||
      (s.providerLocation ?? '').toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const handleBook = (service: Service) => {
    router.push(`/book?serviceId=${service.id}`);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('TODAS');
  };

  let emptyTitle = 'No encontramos servicios para tu búsqueda';
  let emptyText = 'Intenta con otro término o selecciona la categoría "Todas".';
  if (services.length === 0) {
    emptyTitle = 'Todavía no hay servicios registrados';
    emptyText = 'Cuando los proveedores publiquen sus servicios, aparecerán aquí.';
  } else if (!query && selectedCategory !== 'TODAS') {
    emptyTitle = `No hay servicios disponibles en ${categoryLabel(selectedCategory)}`;
    emptyText = 'Puedes elegir otra categoría en cualquier momento.';
  }

  return (
    <div className="min-h-[85vh] bg-white pb-20 pt-8">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Busca por servicio o nombre de negocio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-[#f9fafb] pl-11 pr-10 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#025a4e] focus:outline-none focus:ring-2 focus:ring-teal-100 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#025a4e] text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {cat.emoji && <span>{cat.emoji}</span>}
                  <span>{cat.label}</span>
                  <span className={isActive ? 'text-teal-100' : 'text-slate-400'}>({countOf(cat.id)})</span>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-rose-50 p-3.5 text-xs text-rose-700 border border-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>No se pudieron cargar los servicios: {error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#025a4e] border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="mb-6 text-xs sm:text-sm font-medium text-slate-500">
              {filtered.length} {filtered.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((service) => (
                  <BusinessCard key={service.id} service={service} onBook={handleBook} />
                ))}
              </div>
            ) : (
              !error && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center">
                  <Search className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-800">{emptyTitle}</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">{emptyText}</p>
                  {services.length > 0 && (
                    <button
                      onClick={resetFilters}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#eafaf5] px-4 py-2 text-xs font-semibold text-[#025a4e] hover:bg-teal-100"
                    >
                      Ver todos los servicios
                    </button>
                  )}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#025a4e] border-t-transparent" />
        </div>
      }
    >
      <ServicesPageContent />
    </React.Suspense>
  );
}
