import { Card, Chip } from '@heroui/react';
import { ArrowRight, Flame, MessageSquare, Users } from 'lucide-react';
import type { AnalyticsOverview, Lead, NotificationItem } from '../../../shared/model/types';
import { formatDateTime } from '../../../shared/lib/format';
import { statusChipColor } from '../../../shared/lib/status';

type DashboardSectionProps = {
  overview: AnalyticsOverview | null;
  chats: Array<{
    id: string;
    channel: 'TELEGRAM' | 'MAX';
    externalChatId: string;
    status: string;
    client: { fullName: string | null; phone: string | null; email: string | null };
    updatedAt: string;
    _count: { messages: number };
  }>;
  leads: Lead[];
  notifications: NotificationItem[];
};

export function DashboardSection({ overview, chats, leads, notifications }: DashboardSectionProps) {
  const metrics = [
    { label: 'Всего чатов', value: overview?.chats.total ?? 0, icon: MessageSquare, accent: true },
    { label: 'Лиды', value: overview?.leads.total ?? 0, icon: Users },
    { label: 'Конверсия', value: `${overview?.leads.conversionToLeadPercent ?? 0}%`, icon: ArrowRight },
    { label: 'Срочные', value: overview?.chats.urgent ?? 0, icon: Flame }
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.95fr]">
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.label}>
                <Card.Content>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{metric.label}</span>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-3xl font-semibold">{metric.value}</div>
                </Card.Content>
              </Card>
            );
          })}
        </div>

        <Card>
          <Card.Header>
            <div>
              <p className="text-sm uppercase tracking-[0.22em]">Очередь</p>
              <h2 className="text-xl font-semibold">Последние чаты</h2>
            </div>
            <Chip variant="soft" color="accent">
              {chats.length} активных
            </Chip>
          </Card.Header>
          <Card.Content>
            {chats.slice(0, 6).map((chat) => (
              <div key={chat.id} className="flex items-center gap-3 rounded-2xl border p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold">
                  {chat.client.fullName?.slice(0, 2).toUpperCase() ?? '??'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{chat.client.fullName ?? 'Без имени'}</p>
                    <Chip size="sm" variant="soft" color={chat.channel === 'TELEGRAM' ? 'accent' : 'default'}>
                      {chat.channel}
                    </Chip>
                    <Chip size="sm" variant="soft" color={statusChipColor(chat.status)}>
                      {chat.status}
                    </Chip>
                  </div>
                  <p className="truncate text-sm">
                    {chat.client.phone ?? chat.client.email ?? chat.externalChatId} · {chat._count.messages} сообщений
                  </p>
                </div>
                <div className="text-right text-xs">
                  <p>{formatDateTime(chat.updatedAt)}</p>
                </div>
              </div>
            ))}
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <div>
              <p className="text-sm uppercase tracking-[0.22em]">Лиды</p>
              <h2 className="text-xl font-semibold">Последние заявки</h2>
            </div>
          </Card.Header>
          <Card.Content>
            {leads.slice(0, 5).map((lead) => (
              <div key={lead.id} className="flex items-center justify-between gap-3 rounded-2xl border p-4">
                <div>
                  <p className="font-medium">{lead.fullName ?? 'Без имени'}</p>
                  <p className="text-sm">{lead.interest ?? lead.comment ?? 'Без комментария'}</p>
                </div>
                <Chip variant="soft" color={statusChipColor(lead.status)}>
                  {lead.status}
                </Chip>
              </div>
            ))}
          </Card.Content>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card>
          <Card.Header>
            <div>
              <p className="text-sm uppercase tracking-[0.22em]">События</p>
              <h2 className="text-xl font-semibold">Уведомления</h2>
            </div>
          </Card.Header>
          <Card.Content>
            {notifications.slice(0, 6).map((notification) => (
              <div key={notification.id} className="rounded-2xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{notification.title}</p>
                  <Chip size="sm" variant="soft" color={notification.isRead ? 'default' : 'warning'}>
                    {notification.isRead ? 'прочитано' : 'новое'}
                  </Chip>
                </div>
                <p className="mt-2 text-sm">{notification.body}</p>
                <p className="mt-3 text-xs">{formatDateTime(notification.createdAt)}</p>
              </div>
            ))}
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <div>
              <p className="text-sm uppercase tracking-[0.22em]">Статистика</p>
              <h2 className="text-xl font-semibold">SLA и качество</h2>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="flex items-center justify-between rounded-2xl border p-4">
              <span>Среднее первое время ответа</span>
              <span className="font-semibold">{overview?.sla.averageFirstResponseMinutes ?? 0} мин</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border p-4">
              <span>Завершённые чаты</span>
              <span className="font-semibold">{overview?.chats.completed ?? 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border p-4">
              <span>Успешная база знаний</span>
              <span className="font-semibold">{overview?.faq.usageCount ?? 0}</span>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
