export type { Client } from '../../entities/client/model/types';
export type { Lead } from '../../entities/lead/model/types';
export type { ChatListItem, ChatMessage, ChatDetail } from '../../entities/chat/model/types';
export type { SessionUser, UserListItem, RoleItem } from '../../entities/user/model/types';
export type { Appointment, AppointmentSlot, AppointmentStatus } from '../../entities/appointment/model/types';

export type SectionKey = 'dashboard' | 'chats' | 'leads' | 'appointments' | 'clients' | 'knowledge' | 'users' | 'integrations' | 'reports' | 'settings';

export type AnalyticsOverview = {
  period: { from: string; to: string };
  chats: {
    total: number;
    byChannel: { telegram: number; max: number };
    completed: number;
    waitingManager: number;
    urgent: number;
  };
  leads: {
    total: number;
    conversionToLeadPercent: number;
  };
  appointments: {
    total: number;
  };
  faq: {
    usageCount: number;
  };
  sla: {
    averageFirstResponseMinutes: number;
  };
};

export type FaqCategory = {
  id: string;
  title: string;
  _count: { items: number };
};

export type FaqItem = {
  id: string;
  categoryId: string | null;
  category: { id: string; title: string } | null;
  question: string;
  aliases: string[];
  answer: string;
  keywords: string[];
  isActive: boolean;
  usageCount: number;
};

export type Scenario = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  isActive: boolean;
  triggerPhrases: string[];
  fallbackText: string | null;
  steps: Array<{ id: string; title: string; type: string; order: number }>;
};

export type ClinicProfile = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  site: string | null;
  workingHours: Record<string, string> | null;
  welcomeText: string | null;
  mainMenuText: string | null;
  fallbackText: string | null;
  afterHoursText: string | null;
  urgentText: string | null;
  handoffText: string | null;
  disclaimerText: string | null;
  appointmentButtons: string[] | null;
  doctors: Array<Record<string, unknown>> | null;
  services: Array<Record<string, unknown>> | null;
  triggerWords: string[] | null;
};

export type IntegrationSetting = {
  id: string;
  key: string;
  isEnabled: boolean;
  payload: unknown;
};

export type NotificationItem = {
  id: string;
  userId: string | null;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};
