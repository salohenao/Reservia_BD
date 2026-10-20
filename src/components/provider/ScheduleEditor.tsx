'use client';

import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Schedule } from '@/types/schedule';
import { DayConfig } from '@/services/scheduleService';
import { DAY_NAMES, TimeBlock } from '@/lib/agenda';

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
const MAX_BLOCKS = 3;

function buildWeek(schedule: Schedule[]): DayConfig[] {
  return WEEK_ORDER.map((dayOfWeek) => ({
    dayOfWeek,
    blocks: schedule
      .filter((s) => s.dayOfWeek === dayOfWeek)
      .map((s) => ({ startTime: s.startTime, endTime: s.endTime })),
  }));
}

interface ScheduleEditorProps {
  schedule: Schedule[];
  onSave: (days: DayConfig[]) => Promise<void>;
}

export default function ScheduleEditor({ schedule, onSave }: ScheduleEditorProps) {
  const [week, setWeek] = useState<DayConfig[]>(() => buildWeek(schedule));
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const updateDay = (dayOfWeek: number, change: (blocks: TimeBlock[]) => TimeBlock[]) => {
    setWeek((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, blocks: change(d.blocks) } : d))
    );
  };

  const toggleDay = (day: DayConfig) => {
    updateDay(day.dayOfWeek, (blocks) =>
      blocks.length > 0 ? [] : [{ startTime: '08:00', endTime: '12:00' }]
    );
  };

  const addBlock = (dayOfWeek: number) => {
    updateDay(dayOfWeek, (blocks) => [...blocks, { startTime: '14:00', endTime: '18:00' }]);
  };

  const removeBlock = (dayOfWeek: number, index: number) => {
    updateDay(dayOfWeek, (blocks) => blocks.filter((_, i) => i !== index));
  };

  const changeBlock = (dayOfWeek: number, index: number, field: keyof TimeBlock, value: string) => {
    updateDay(dayOfWeek, (blocks) => blocks.map((b, i) => (i === index ? { ...b, [field]: value } : b)));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await onSave(week);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron guardar los horarios.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div>
        <h2 className="font-serif text-base font-bold text-slate-900">Bloques de disponibilidad semanal</h2>
        <p className="text-xs text-slate-400 font-normal mt-0.5">
          Define hasta {MAX_BLOCKS} bloques de atención por día. Los clientes verán como turnos disponibles los
          que entren en estos bloques, según la duración de cada servicio.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3.5 text-xs text-rose-700 border border-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-6">
        {week.map((day) => {
          const isEnabled = day.blocks.length > 0;
          return (
            <div
              key={day.dayOfWeek}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 last:border-b-0 last:pb-0"
            >
              <div className="flex items-center gap-3 w-36 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                    isEnabled ? 'bg-[#025a4e]' : 'bg-slate-200'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                      isEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className={`text-xs font-bold ${isEnabled ? 'text-slate-900' : 'text-slate-400'}`}>
                  {DAY_NAMES[day.dayOfWeek]}
                </span>
              </div>

              {isEnabled ? (
                <div className="flex-1 flex flex-wrap items-center gap-x-5 gap-y-3">
                  {day.blocks.map((block, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          index === 0 ? 'bg-sky-50 text-sky-700' : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        Bloque {index + 1}
                      </span>

                      <input
                        type="time"
                        value={block.startTime}
                        onChange={(e) => changeBlock(day.dayOfWeek, index, 'startTime', e.target.value)}
                        className="bg-[#fafafa] border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#025a4e]"
                      />
                      <span className="text-slate-300 text-xs">→</span>
                      <input
                        type="time"
                        value={block.endTime}
                        onChange={(e) => changeBlock(day.dayOfWeek, index, 'endTime', e.target.value)}
                        className="bg-[#fafafa] border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#025a4e]"
                      />

                      <button
                        type="button"
                        title="Quitar bloque"
                        onClick={() => removeBlock(day.dayOfWeek, index)}
                        className="text-slate-300 hover:text-rose-500 text-sm px-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {day.blocks.length < MAX_BLOCKS && (
                    <button
                      type="button"
                      onClick={() => addBlock(day.dayOfWeek)}
                      className="text-[11px] font-semibold text-[#025a4e] hover:underline cursor-pointer"
                    >
                      + Agregar bloque
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex-1 text-xs text-slate-400 italic">Cerrado todo el día</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={isSaving}
          onClick={handleSave}
          className="bg-[#025a4e] hover:bg-[#03483e] disabled:opacity-50 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-sm transition-all"
        >
          {isSaving ? 'Guardando...' : 'Guardar horarios'}
        </button>
      </div>
    </div>
  );
}
