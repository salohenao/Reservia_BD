'use client';

import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Service, ServiceForm } from '@/types/service';
import { CATEGORIES } from '@/lib/categories';

interface ServiceFormModalProps {
  service: Service | null;
  defaultCategory: string;
  onSave: (form: ServiceForm) => Promise<void>;
  onClose: () => void;
}

const inputClass =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#025a4e]';

export default function ServiceFormModal({ service, defaultCategory, onSave, onClose }: ServiceFormModalProps) {
  const [name, setName] = useState(service?.name ?? '');
  const [category, setCategory] = useState(service?.category ?? defaultCategory);
  const [duration, setDuration] = useState(service?.durationMinutes ?? 45);
  const [price, setPrice] = useState(service?.price ?? 75000);
  const [description, setDescription] = useState(service?.description ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await onSave({ name, description, category, durationMinutes: duration, price });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el servicio.');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg font-bold text-slate-900">
            {service ? 'Editar servicio' : 'Agregar nuevo servicio'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-100 p-3 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre del servicio</label>
            <input
              type="text"
              placeholder="Ej. Limpieza dental profunda"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Categoría</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duración (min)</label>
              <input
                type="number"
                min={5}
                step={5}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Costo referencial (COP)</label>
              <input
                type="number"
                min={0}
                step={1000}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Descripción (opcional)</label>
            <textarea
              rows={3}
              placeholder="Cuéntales a tus clientes en qué consiste el servicio"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#025a4e] hover:bg-[#03483e] disabled:opacity-50 text-white shadow-sm transition-colors"
            >
              {isSaving ? 'Guardando...' : service ? 'Guardar cambios' : 'Guardar servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
