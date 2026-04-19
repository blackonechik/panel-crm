import type { SectionKey } from '../model/types';

export type NavigationItem = {
  key: SectionKey;
  label: string;
  path: string;
};

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { key: 'dashboard', label: 'Дашборд', path: '/dashboard' },
  { key: 'chats', label: 'Чаты', path: '/chats' },
  { key: 'leads', label: 'Лиды', path: '/leads' },
  { key: 'appointments', label: 'Записи', path: '/appointments' },
  { key: 'clients', label: 'Клиенты', path: '/clients' },
  { key: 'knowledge', label: 'База знаний', path: '/knowledge' },
  { key: 'users', label: 'Пользователи', path: '/users' },
  { key: 'integrations', label: 'Интеграции', path: '/integrations' },
  { key: 'reports', label: 'Отчёты', path: '/reports' },
  { key: 'settings', label: 'Настройки', path: '/settings' }
];

export const SECTION_TITLES: Record<SectionKey, string> = {
  dashboard: 'Дашборд',
  chats: 'Чаты',
  leads: 'Лиды',
  appointments: 'Записи',
  clients: 'Клиенты',
  knowledge: 'База знаний',
  users: 'Пользователи и роли',
  integrations: 'Интеграции',
  reports: 'Отчёты',
  settings: 'Настройки'
};

export function getSectionPath(section: SectionKey) {
  return NAVIGATION_ITEMS.find((item) => item.key === section)?.path ?? '/dashboard';
}

export function getSectionFromPath(pathname: string): SectionKey {
  const cleanedPath = pathname.replace(/\/+$/, '') || '/';

  const item = NAVIGATION_ITEMS.find((entry) => cleanedPath === entry.path || cleanedPath.startsWith(`${entry.path}/`));
  return item?.key ?? 'dashboard';
}
