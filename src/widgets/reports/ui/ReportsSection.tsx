import { Button, Card, Chip, Input } from '@heroui/react';
import type { AnalyticsOverview, ChatListItem, Lead, UserListItem } from '../../../shared/model/types';
import { formatDateTime } from '../../../shared/lib/format';

type ReportsSectionProps = {
  overview: AnalyticsOverview | null;
  chats: ChatListItem[];
  leads: Lead[];
  users: UserListItem[];
  from: string;
  to: string;
  onPeriodChange: (from: string, to: string) => Promise<void>;
  leadsCsvUrl: string;
};

export function ReportsSection({ overview, chats, leads, users, from, to, onPeriodChange, leadsCsvUrl }: ReportsSectionProps) {
  const assignedChats = chats.filter((chat) => chat.assignedUser);
  const loadByUser = users.map((user) => ({
    name: user.name,
    count: chats.filter((chat) => chat.assignedUser?.name === user.name).length
  }));

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <Card className="border border-white/10 bg-white/5">
        <Card.Header className="px-5 pt-5">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/70">Отчёты</p>
            <h2 className="text-xl font-semibold text-white">Аналитика и экспорт</h2>
          </div>
        </Card.Header>
        <Card.Content className="grid gap-4 px-5 pb-5">
          <div className="grid gap-3 md:grid-cols-2">
            <Input aria-label="Период от" type="date" value={from} onChange={(event) => void onPeriodChange(event.target.value, to)} />
            <Input aria-label="Период до" type="date" value={to} onChange={(event) => void onPeriodChange(from, event.target.value)} />
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="border border-white/10 bg-slate-950/50"><Card.Content className="p-4"><p className="text-sm text-slate-300">Обращения</p><p className="text-3xl font-semibold text-white">{overview?.chats.total ?? 0}</p></Card.Content></Card>
            <Card className="border border-white/10 bg-slate-950/50"><Card.Content className="p-4"><p className="text-sm text-slate-300">Новые лиды</p><p className="text-3xl font-semibold text-white">{overview?.leads.total ?? 0}</p></Card.Content></Card>
            <Card className="border border-white/10 bg-slate-950/50"><Card.Content className="p-4"><p className="text-sm text-slate-300">Конверсия</p><p className="text-3xl font-semibold text-white">{overview?.leads.conversionToLeadPercent ?? 0}%</p></Card.Content></Card>
            <Card className="border border-white/10 bg-slate-950/50"><Card.Content className="p-4"><p className="text-sm text-slate-300">Срочные</p><p className="text-3xl font-semibold text-white">{overview?.chats.urgent ?? 0}</p></Card.Content></Card>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Каналы</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip size="sm" variant="soft" color="accent">Telegram: {overview?.chats.byChannel.telegram ?? 0}</Chip>
                <Chip size="sm" variant="soft" color="default">MAX: {overview?.chats.byChannel.max ?? 0}</Chip>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">SLA</p>
              <p className="mt-2 text-white">Первый ответ: {overview?.sla.averageFirstResponseMinutes ?? 0} мин</p>
              <p className="text-sm text-slate-400">Завершённых чатов: {overview?.chats.completed ?? 0}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onPress={() => window.open(leadsCsvUrl, '_blank', 'noopener,noreferrer')}>
              Экспорт лидов CSV
            </Button>
            <Button variant="secondary" onPress={() => void onPeriodChange(from, to)}>
              Обновить отчёт
            </Button>
          </div>
        </Card.Content>
      </Card>

      <div className="grid gap-6">
        <Card className="border border-white/10 bg-white/5">
          <Card.Header className="px-5 pt-5">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/70">Нагрузка</p>
              <h2 className="text-xl font-semibold text-white">По сотрудникам</h2>
            </div>
          </Card.Header>
          <Card.Content className="grid gap-3 px-5 pb-5">
            {loadByUser.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-950/50 p-4">
                <span className="text-slate-200">{item.name}</span>
                <Chip size="sm" variant="soft" color="accent">{item.count}</Chip>
              </div>
            ))}
          </Card.Content>
        </Card>

        <Card className="border border-white/10 bg-white/5">
          <Card.Header className="px-5 pt-5">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/70">История</p>
              <h2 className="text-xl font-semibold text-white">Последние обращения</h2>
            </div>
          </Card.Header>
          <Card.Content className="grid gap-3 px-5 pb-5">
            {chats.slice(0, 6).map((chat) => (
              <div key={chat.id} className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
                <p className="font-medium text-white">{chat.client.fullName ?? 'Без имени'}</p>
                <p className="text-sm text-slate-400">{chat.channel} · {chat.status} · {formatDateTime(chat.updatedAt)}</p>
              </div>
            ))}
          </Card.Content>
        </Card>

        <Card className="border border-white/10 bg-white/5">
          <Card.Header className="px-5 pt-5">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/70">Лиды</p>
              <h2 className="text-xl font-semibold text-white">Статистика</h2>
            </div>
          </Card.Header>
          <Card.Content className="grid gap-3 px-5 pb-5">
            <p className="text-sm text-slate-300">Всего лидов: {leads.length}</p>
            <p className="text-sm text-slate-300">Назначенных чатов: {assignedChats.length}</p>
            <p className="text-sm text-slate-300">С последним обновлением: {overview ? formatDateTime(overview.period.to) : '—'}</p>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
