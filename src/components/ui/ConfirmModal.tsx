'use client';

import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export default function ConfirmModal({ title, message, confirmLabel, onConfirm, onClose }: ConfirmModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la acción.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100">
        <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-5 h-5" />
        </div>
        <h3 className="font-serif text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <div className="text-xs text-slate-500 mb-5 leading-relaxed">{message}</div>

        {error && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-100 p-3 text-xs text-rose-700">{error}</div>
        )}

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Volver
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white shadow-sm transition-colors"
          >
            {isLoading ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
