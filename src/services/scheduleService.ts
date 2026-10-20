import { Schedule } from '@/types/schedule';
import { DAY_NAMES, TimeBlock } from '@/lib/agenda';
import { supabase } from '@/lib/supabaseClient';

interface ScheduleRow {
  id: string;
  provider_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface DayConfig {
  dayOfWeek: number;
  blocks: TimeBlock[];
}

function fromScheduleRow(row: ScheduleRow): Schedule {
  return {
    id: row.id,
    providerId: row.provider_id,
    dayOfWeek: row.day_of_week,
    startTime: row.start_time.slice(0, 5),
    endTime: row.end_time.slice(0, 5),
  };
}

function validateDay(day: DayConfig) {
  const name = DAY_NAMES[day.dayOfWeek];
  const blocks = [...day.blocks].sort((a, b) => a.startTime.localeCompare(b.startTime));

  blocks.forEach((block, i) => {
    if (!block.startTime || !block.endTime) {
      throw new Error(`${name}: completa la hora de inicio y la hora final.`);
    }
    if (block.startTime >= block.endTime) {
      throw new Error(`${name}: la hora de inicio debe ser anterior a la hora final.`);
    }
    if (i > 0 && block.startTime < blocks[i - 1].endTime) {
      throw new Error(`${name}: los bloques no pueden cruzarse.`);
    }
  });
}

class ScheduleService {
  async getSchedule(providerId: string): Promise<Schedule[]> {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('provider_id', providerId)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });
    if (error) throw new Error(error.message);
    return (data || []).map((row) => fromScheduleRow(row as ScheduleRow));
  }

  async saveSchedule(providerId: string, days: DayConfig[]): Promise<Schedule[]> {
    days.forEach(validateDay);

    const rows = days.flatMap((day) =>
      day.blocks.map((block) => ({
        provider_id: providerId,
        day_of_week: day.dayOfWeek,
        start_time: block.startTime,
        end_time: block.endTime,
      }))
    );

    const { error: deleteError } = await supabase
      .from('schedules')
      .delete()
      .eq('provider_id', providerId);
    if (deleteError) throw new Error(deleteError.message);

    if (rows.length > 0) {
      const { error } = await supabase.from('schedules').insert(rows);
      if (error) throw new Error(error.message);
    }

    return this.getSchedule(providerId);
  }
}

export const scheduleService = new ScheduleService();
