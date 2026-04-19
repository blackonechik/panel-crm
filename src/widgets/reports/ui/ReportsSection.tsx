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
      <Card>
        <Card.Header>
          <div>
            <p className="text-sm uppercase tracking-[0.22em]">Отчёты</p>
            <h2 className="text-xl font-semibold">Аналитика и экспорт</h2>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="grid gap-3 md:grid-cols-2">
            <Input aria-label="Период от" type="date" value={from} onChange={(event) => void onPeriodChange(event.target.value, to)} />
            <Input aria-label="Период до" type="date" value={to} onChange={(event) => void onPeriodChange(from, event.target.value)} />
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <Card.Content>
                <p className="text-sm">Обращения</p>
                <p className="text-3xl font-semibold">{overview?.chats.total ?? 0}</p>
              </Card.Content>
            </Card>
            <Card>
              <Card.Content>
                <p className="text-sm">Новые лиды</p>
                <p className="text-3xl font-semibold">{overview?.leads.total ?? 0}</p>
              </Card.Content>
            </Card>
            <Card>
              <Card.Content>
                <p className="text-sm">Конверсия</p>
                <p className="text-3xl font-semibold">{overview?.leads.conversionToLeadPercent ?? 0}%</p>
              </Card.Content>
            </Card>
            <Card>
              <Card.Content>
                <p className="text-sm">Срочные</p>
                <p className="text-3xl font-semibold">{overview?.chats.urgent ?? 0}</p>
              </Card.Content>
            </Card>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-3xl border p-4">
              <p className="text-sm uppercase tracking-[0.2em]">Каналы</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip size="sm" variant="soft" color="accent">Telegram: {overview?.chats.byChannel.telegram ?? 0}</Chip>
                <Chip size="sm" variant="soft" color="default">MAX: {overview?.chats.byChannel.max ?? 0}</Chip>
              </div>
            </div>
            <div className="rounded-3xl border p-4">
              <p className="text-sm uppercase tracking-[0.2em]">SLA</p>
              <p className="mt-2">Первый ответ: {overview?.sla.averageFirstResponseMinutes ?? 0} мин</p>
              <p className="text-sm">Завершённых чатов: {overview?.chats.completed ?? 0}</p>
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
        <Card>
          <Card.Header>
            <div>
              <p className="text-sm uppercase tracking-[0.22em]">Нагрузка</p>
              <h2 className="text-xl font-semibold">По сотрудникам</h2>
            </div>
          </Card.Header>
          <Card.Content>
            {loadByUser.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-3xl border p-4">
                <span>{item.name}</span>
                <Chip size="sm" variant="soft" color="accent">{item.count}</Chip>
              </div>
            ))}
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <div>
              <p className="text-sm uppercase tracking-[0.22em]">История</p>
              <h2 className="text-xl font-semibold">Последние обращения</h2>
            </div>
          </Card.Header>
          <Card.Content>
            {chats.slice(0, 6).map((chat) => (
              <div key={chat.id} className="rounded-3xl border p-4">
                <p className="font-medium">{chat.client.fullName ?? 'Без имени'}</p>
                <p className="text-sm">{chat.channel} · {chat.status} · {formatDateTime(chat.updatedAt)}</p>
              </div>
            ))}
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <div>
              <p className="text-sm uppercase tracking-[0.22em]">Лиды</p>
              <h2 className="text-xl font-semibold">Статистика</h2>
            </div>
          </Card.Header>
          <Card.Content>
            <p className="text-sm">Всего лидов: {leads.length}</p>
            <p className="text-sm">Назначенных чатов: {assignedChats.length}</p>
            <p className="text-sm">С последним обновлением: {overview ? formatDateTime(overview.period.to) : '—'}</p>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
