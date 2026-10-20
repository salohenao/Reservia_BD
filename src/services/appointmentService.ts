import { Appointment, DayAvailability } from '@/types/appointment';
import { Service } from '@/types/service';
import { User } from '@/types/auth';
import { supabase } from '@/lib/supabaseClient';
import { BusySlot, buildSlots, hoursUntil, nextDays, parseISODate } from '@/lib/agenda';
import { scheduleService } from './scheduleService';
import { serviceService } from './serviceService';

interface AppointmentRow {
  id: string;
  service_id: string;
  service_name: string;
  provider_id: string;
  provider_name: string;
  client_id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  date: string;
  time: string;
  duration_minutes: number;
  price: number;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';
  image_url: string | null;
  notes: string | null;
  created_at: string;
}

interface BusyRow {
  date: string;
  time: string;
  duration_minutes: number;
}

type BusyOnDate = BusySlot & { date: string };

function fromAppointmentRow(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    serviceId: row.service_id,
    serviceName: row.service_name,
    providerId: row.provider_id,
    providerName: row.provider_name,
    clientId: row.client_id,
    clientName: row.client_name,
    clientEmail: row.client_email,
    clientPhone: row.client_phone ?? undefined,
    date: row.date,
    time: row.time.slice(0, 5),
    durationMinutes: row.duration_minutes,
    price: Number(row.price),
    status: row.status,
    imageUrl: row.image_url ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

function saveError(error: { code?: string; message: string } | null): Error {
  if (error?.code === '23P01') return new Error('Ese horario acaba de ser reservado. Elige otro.');
  return new Error(error?.message || 'No se pudo guardar la cita.');
}

class AppointmentService {
  async getClientAppointments(clientId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('client_id', clientId)
      .order('date', { ascending: true })
      .order('time', { ascending: true });
    if (error) throw new Error(error.message);
    return (data || []).map((row) => fromAppointmentRow(row as AppointmentRow));
  }

  async getProviderAppointments(providerId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('provider_id', providerId)
      .order('date', { ascending: true })
      .order('time', { ascending: true });
    if (error) throw new Error(error.message);
    return (data || []).map((row) => fromAppointmentRow(row as AppointmentRow));
  }

  private async getBusy(providerId: string, from: string, to: string): Promise<BusyOnDate[]> {
    const { data, error } = await supabase
      .from('busy_slots')
      .select('*')
      .eq('provider_id', providerId)
      .gte('date', from)
      .lte('date', to);
    if (error) throw new Error(error.message);
    return (data || []).map((row) => {
      const busy = row as BusyRow;
      return { date: busy.date, time: busy.time.slice(0, 5), durationMinutes: busy.duration_minutes };
    });
  }

  async getAvailability(
    providerId: string,
    duration: number,
    ignore?: { date: string; time: string }
  ): Promise<DayAvailability[]> {
    const dates = nextDays(14);
    const [schedule, busy] = await Promise.all([
      scheduleService.getSchedule(providerId),
      this.getBusy(providerId, dates[0], dates[dates.length - 1]),
    ]);

    return dates.map((date) => {
      const dayOfWeek = parseISODate(date).getDay();
      const blocks = schedule.filter((s) => s.dayOfWeek === dayOfWeek);
      const busyThatDay = busy.filter((b) => b.date === date);
      const ignoreTime = ignore && ignore.date === date ? ignore.time : undefined;
      return { date, slots: buildSlots(blocks, busyThatDay, duration, date, ignoreTime) };
    });
  }

  private async checkSlotIsFree(
    providerId: string,
    duration: number,
    date: string,
    time: string,
    ignore?: { date: string; time: string }
  ) {
    const days = await this.getAvailability(providerId, duration, ignore);
    const day = days.find((d) => d.date === date);
    if (!day || !day.slots.includes(time)) {
      throw new Error('Ese horario ya no está disponible. Elige otro.');
    }
  }

  async getCancellationHours(providerId: string): Promise<number> {
    const { data } = await supabase
      .from('profiles')
      .select('cancellation_policy')
      .eq('id', providerId)
      .maybeSingle();
    const policy = (data as { cancellation_policy: string | null } | null)?.cancellation_policy;
    return parseInt(policy ?? '', 10) || 24;
  }

  private async checkCancellationPolicy(appointment: Appointment, action: string) {
    const hours = await this.getCancellationHours(appointment.providerId);

    if (hoursUntil(appointment.date, appointment.time) < hours) {
      throw new Error(`Solo puedes ${action} la cita hasta ${hours} horas antes (política del negocio).`);
    }
  }

  async createAppointment(
    service: Service,
    client: User,
    date: string,
    time: string,
    notes?: string
  ): Promise<Appointment> {
    const current = await serviceService.getServiceById(service.id);
    if (!current || !current.isActive) throw new Error('Este servicio ya no está disponible.');

    await this.checkSlotIsFree(current.providerId, current.durationMinutes, date, time);

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        service_id: current.id,
        service_name: current.name,
        provider_id: current.providerId,
        provider_name: current.providerName,
        client_id: client.id,
        client_name: client.name,
        client_email: client.email,
        client_phone: client.phone || null,
        date,
        time,
        duration_minutes: current.durationMinutes,
        price: current.price,
        status: 'CONFIRMED',
        image_url: current.imageUrl || null,
        notes: notes?.trim() || null,
      })
      .select()
      .single();
    if (error || !data) throw saveError(error);
    return fromAppointmentRow(data as AppointmentRow);
  }

  async cancelAppointment(appointment: Appointment, by: 'CLIENT' | 'PROVIDER'): Promise<Appointment> {
    if (by === 'CLIENT') await this.checkCancellationPolicy(appointment, 'cancelar');

    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'CANCELLED' })
      .eq('id', appointment.id)
      .in('status', ['PENDING', 'CONFIRMED'])
      .select()
      .single();
    if (error || !data) throw new Error('No se pudo cancelar la cita.');
    return fromAppointmentRow(data as AppointmentRow);
  }

  async rescheduleAppointment(appointment: Appointment, date: string, time: string): Promise<Appointment> {
    if (date === appointment.date && time === appointment.time) {
      throw new Error('Elige una fecha u hora distinta a la actual.');
    }

    await this.checkCancellationPolicy(appointment, 'reprogramar');
    await this.checkSlotIsFree(appointment.providerId, appointment.durationMinutes, date, time, {
      date: appointment.date,
      time: appointment.time,
    });

    const { data, error } = await supabase
      .from('appointments')
      .update({ date, time, status: 'CONFIRMED' })
      .eq('id', appointment.id)
      .in('status', ['PENDING', 'CONFIRMED'])
      .select()
      .single();
    if (error || !data) throw saveError(error);
    return fromAppointmentRow(data as AppointmentRow);
  }
}

export const appointmentService = new AppointmentService();
