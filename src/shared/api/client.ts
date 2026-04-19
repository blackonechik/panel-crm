import type {
  AnalyticsOverview,
  ClinicProfile,
  FaqCategory,
  FaqItem,
  IntegrationSetting,
  NotificationItem,
  Scenario,
} from '../model/types';
import type { ChatDetail, ChatListItem } from '../../entities/chat/model/types';
import type { Appointment, AppointmentSlot } from '../../entities/appointment/model/types';
import type { Client } from '../../entities/client/model/types';
import type { Lead } from '../../entities/lead/model/types';
import type { RoleItem, SessionUser, UserListItem } from '../../entities/user/model/types';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

const ACCESS_TOKEN_KEY = 'bot-crm-access-token';
const REFRESH_TOKEN_KEY = 'bot-crm-refresh-token';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
  }
}

export type Session = {
  user: SessionUser;
  accessToken: string;
  refreshToken: string;
};

export function getStoredSession(): Session | null {
  if (typeof window === 'undefined') return null;
  const accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY);
  const userRaw = window.localStorage.getItem('bot-crm-user');

  if (!accessToken || !refreshToken || !userRaw) return null;

  try {
    return {
      accessToken,
      refreshToken,
      user: JSON.parse(userRaw) as SessionUser
    };
  } catch {
    return null;
  }
}

export function saveSession(session: Session): void {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  window.localStorage.setItem('bot-crm-user', JSON.stringify(session.user));
}

export function clearSession(): void {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem('bot-crm-user');
}

function getTokens() {
  return {
    accessToken: window.localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: window.localStorage.getItem(REFRESH_TOKEN_KEY)
  };
}

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = getTokens();
  if (!refreshToken) return null;

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  if (!response.ok) return null;

  const data = (await response.json()) as { accessToken: string };
  window.localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
  return data.accessToken;
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const { accessToken } = getTokens();
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers
  });

  if (response.status === 401 && retry) {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      return request<T>(path, init, false);
    }
  }

  if (!response.ok) {
    let details: unknown = null;
    try {
      details = await response.json();
    } catch {
      details = await response.text();
    }
    throw new ApiError(`Request failed: ${response.status}`, response.status, details);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function login(email: string, password: string): Promise<Session> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const details = await response.json().catch(() => null);
    throw new ApiError('Не удалось войти', response.status, details);
  }

  return (await response.json()) as Session;
}

export const api = {
  me: () => request<SessionUser>('/auth/me'),
  overview: (from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const query = params.toString();
    return request<AnalyticsOverview>(`/analytics/overview${query ? `?${query}` : ''}`);
  },
  chats: (filters?: { status?: string; channel?: string; assignedUserId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.channel) params.set('channel', filters.channel);
    if (filters?.assignedUserId) params.set('assignedUserId', filters.assignedUserId);
    const query = params.toString();
    return request<ChatListItem[]>(`/chats${query ? `?${query}` : ''}`);
  },
  chat: (id: string) => request<ChatDetail>(`/chats/${id}`),
  sendChatMessage: (id: string, text: string) =>
    request(`/chats/${id}/messages`, { method: 'POST', body: JSON.stringify({ text }) }),
  addChatNote: (id: string, content: string) =>
    request(`/chats/${id}/internal-notes`, { method: 'POST', body: JSON.stringify({ content }) }),
  updateChatStatus: (id: string, status: string, reason?: string) =>
    request(`/chats/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, reason }) }),
  updateChatMode: (id: string, mode: string) =>
    request(`/chats/${id}/mode`, { method: 'PATCH', body: JSON.stringify({ mode }) }),
  assignChat: (id: string, assignedUserId: string | null) =>
    request(`/chats/${id}/assign`, { method: 'PATCH', body: JSON.stringify({ assignedUserId }) }),
  leads: () => request<Lead[]>('/leads'),
  appointments: () => request<Appointment[]>('/appointments'),
  appointmentAvailability: (params?: { from?: string; days?: number; limit?: number; specialization?: string; doctorName?: string }) => {
    const paramsObj = new URLSearchParams();
    if (params?.from) paramsObj.set('from', params.from);
    if (params?.days !== undefined) paramsObj.set('days', String(params.days));
    if (params?.limit !== undefined) paramsObj.set('limit', String(params.limit));
    if (params?.specialization) paramsObj.set('specialization', params.specialization);
    if (params?.doctorName) paramsObj.set('doctorName', params.doctorName);
    const query = paramsObj.toString();
    return request<AppointmentSlot[]>(`/appointments/availability${query ? `?${query}` : ''}`);
  },
  createAppointment: (payload: {
    clientId?: string;
    chatId?: string;
    leadId?: string;
    assignedUserId?: string;
    service: string;
    doctor?: string;
    scheduledAt: string;
    comment?: string;
    createLead?: boolean;
    fullName?: string;
    phone?: string;
    email?: string;
    username?: string;
    source?: string;
  }) =>
    request<Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  confirmAppointment: (id: string) => request<Appointment>(`/appointments/${id}/confirm`, { method: 'POST' }),
  cancelAppointment: (id: string) => request<Appointment>(`/appointments/${id}/cancel`, { method: 'POST' }),
  rescheduleAppointment: (id: string, scheduledAt: string) =>
    request<Appointment>(`/appointments/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify({ scheduledAt })
    }),
  clients: (q?: string) => request<Client[]>(`/clients${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  faqCategories: () => request<FaqCategory[]>('/faq/categories'),
  faqItems: () => request<FaqItem[]>('/faq/items'),
  clinicProfile: () => request<ClinicProfile>('/clinic/profile'),
  scenarios: () => request<Scenario[]>('/scenarios'),
  notifications: () => request<NotificationItem[]>('/notifications'),
  integrations: () => request<IntegrationSetting[]>('/integrations'),
  users: () => request<UserListItem[]>('/users'),
  roles: () => request<RoleItem[]>('/roles'),
  rolePermissions: () => request<Array<{ id: string; code: string; description: string | null }>>('/roles/permissions'),
  updateClinicProfile: (payload: Partial<ClinicProfile>) =>
    request<ClinicProfile>('/clinic/profile', { method: 'PUT', body: JSON.stringify(payload) }),
  createFaqItem: (payload: {
    question: string;
    answer: string;
    aliases?: string[];
    keywords?: string[];
    isActive?: boolean;
    categoryId?: string | null;
  }) =>
    request('/faq/items', {
      method: 'POST',
      body: JSON.stringify({
        aliases: [],
        keywords: [],
        isActive: true,
        ...payload
      })
    }),
  createScenario: (payload: {
    code: string;
    title: string;
    description?: string | null;
    isActive?: boolean;
    triggerPhrases?: string[];
    fallbackText?: string | null;
  }) =>
    request('/scenarios', {
      method: 'POST',
      body: JSON.stringify({
        isActive: true,
        triggerPhrases: [],
        fallbackText: null,
        ...payload
      })
    }),
  updateIntegration: (key: string, payload: { isEnabled: boolean; payload?: unknown }) =>
    request<IntegrationSetting>(`/integrations/${key}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
  updateRole: async (id: string, payload: { name?: string; description?: string | null; permissions?: string[] }) => {
    if (payload.name !== undefined || payload.description !== undefined) {
      await request(`/roles/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          ...(payload.name !== undefined ? { name: payload.name } : {}),
          ...(payload.description !== undefined ? { description: payload.description } : {})
        })
      });
    }

    if (payload.permissions) {
      await request(`/roles/${id}/permissions`, { method: 'PUT', body: JSON.stringify({ permissions: payload.permissions }) });
    }
  },
  updateClient: (id: string, payload: Partial<Client>) =>
    request<Client>(`/clients/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  updateLeadStatus: (id: string, status: string, reason?: string) =>
    request(`/leads/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, reason }) }),
  exportLeadsCsv: () => `${API_URL}/leads/export/csv`
};
