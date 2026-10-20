export type AppointmentStatus = 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';

export interface Appointment {
  id: string;
  serviceId: string;
  serviceName: string;
  providerId: string;
  providerName: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  date: string;
  time: string;
  durationMinutes: number;
  price: number;
  status: AppointmentStatus;
  imageUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface DayAvailability {
  date: string;
  slots: string[];
}
