const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];

export const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export interface TimeBlock {
  startTime: string;
  endTime: string;
}

export interface BusySlot {
  time: string;
  durationMinutes: number;
}

export function toISODate(d: Date): string {
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDate(iso: string): string {
  const d = parseISODate(iso);
  return `${DAYS_SHORT[d.getDay()]}, ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hours12}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function toTime(totalMinutes: number): string {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const minutes = String(totalMinutes % 60).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function nextDays(count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return toISODate(d);
  });
}

export function hoursUntil(date: string, time: string): number {
  const start = new Date(`${date}T${time}:00`);
  return (start.getTime() - Date.now()) / 3600000;
}

export function isPast(date: string, time: string, durationMinutes: number): boolean {
  const end = new Date(`${date}T${time}:00`).getTime() + durationMinutes * 60000;
  return end < Date.now();
}

export function buildSlots(
  blocks: TimeBlock[],
  busy: BusySlot[],
  duration: number,
  date: string,
  ignoreTime?: string
): string[] {
  const now = new Date();
  const today = toISODate(now);
  if (date < today) return [];

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const slots: string[] = [];

  for (const block of blocks) {
    const end = toMinutes(block.endTime);
    for (let start = toMinutes(block.startTime); start + duration <= end; start += duration) {
      if (date === today && start <= nowMinutes) continue;

      const taken = busy.some((b) => {
        if (b.time === ignoreTime) return false;
        const busyStart = toMinutes(b.time);
        return start < busyStart + b.durationMinutes && busyStart < start + duration;
      });

      if (!taken) slots.push(toTime(start));
    }
  }

  return slots.sort();
}
