import type { Client } from '../../client/model/types';

export type AppointmentStatus = 'REQUESTED' | 'WAITING_CONFIRMATION' | 'CONFIRMED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED';

export type Appointment = {
  id: string;
  client: Client | null;
  chat: { id: string; status: string } | null;
  lead: { id: string; status: string } | null;
  assignedUser: { id: string; name: string; email: string } | null;
  service: string;
  doctor: string | null;
  scheduledAt: string;
  status: AppointmentStatus;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AppointmentSlot = {
  scheduledAt: string;
  label: string;
  doctor: string | null;
  specialization: string | null;
};
