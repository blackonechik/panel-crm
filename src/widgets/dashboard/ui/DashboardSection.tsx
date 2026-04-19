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
              <Card key={metric.label} className={`border ${metric.accent ? 'border-cyan-400/20 bg-cyan-400/10' : 'border-white/10 bg-white/5'} backdrop-blur-sm`}>
                <Card.Content className="gap-3 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">{metric.label}</span>
                    <Icon className="h-5 w-5 text-slate-200/80" />
                  </div>
                  <div className="text-3xl font-semibold text-white">{metric.value}</div>
                </Card.Content>
              </Card>
            );
          })}
        </div>

        <Card className="border border-white/10 bg-white/5">
          <Card.Header className="flex items-center justify-between px-5 pt-5">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/70">Очередь</p>
              <h2 className="text-xl font-semibold text-white">Последние чаты</h2>
            </div>
            <Chip variant="soft" color="accent">
              {chats.length} активных
            </Chip>
          </Card.Header>
          <Card.Content className="gap-3 px-5 pb-5">
            {chats.slice(0, 6).map((chat) => (
              <div key={chat.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-400/15 text-sm font-semibold text-cyan-100">
                  {chat.client.fullName?.slice(0, 2).toUpperCase() ?? '??'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-white">{chat.client.fullName ?? 'Без имени'}</p>
                    <Chip size="sm" variant="soft" color={chat.channel === 'TELEGRAM' ? 'accent' : 'default'}>
                      {chat.channel}
                    </Chip>
                    <Chip size="sm" variant="soft" color={statusChipColor(chat.status)}>
                      {chat.status}
                    </Chip>
                  </div>
                  <p className="truncate text-sm text-slate-400">
                    {chat.client.phone ?? chat.client.email ?? chat.externalChatId} · {chat._count.messages} сообщений
                  </p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>{formatDateTime(chat.updatedAt)}</p>
                </div>
              </div>
            ))}
          </Card.Content>
        </Card>

        <Card className="border border-white/10 bg-white/5">
          <Card.Header className="px-5 pt-5">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/70">Лиды</p>
              <h2 className="text-xl font-semibold text-white">Последние заявки</h2>
            </div>
          </Card.Header>
          <Card.Content className="gap-3 px-5 pb-5">
            {leads.slice(0, 5).map((lead) => (
              <div key={lead.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <div>
                  <p className="font-medium text-white">{lead.fullName ?? 'Без имени'}</p>
                  <p className="text-sm text-slate-400">{lead.interest ?? lead.comment ?? 'Без комментария'}</p>
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
        <Card className="border border-white/10 bg-white/5">
          <Card.Header className="px-5 pt-5">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/70">События</p>
              <h2 className="text-xl font-semibold text-white">Уведомления</h2>
            </div>
          </Card.Header>
          <Card.Content className="gap-3 px-5 pb-5">
            {notifications.slice(0, 6).map((notification) => (
              <div key={notification.id} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-white">{notification.title}</p>
                  <Chip size="sm" variant="soft" color={notification.isRead ? 'default' : 'warning'}>
                    {notification.isRead ? 'прочитано' : 'новое'}
                  </Chip>
                </div>
                <p className="mt-2 text-sm text-slate-400">{notification.body}</p>
                <p className="mt-3 text-xs text-slate-500">{formatDateTime(notification.createdAt)}</p>
              </div>
            ))}
          </Card.Content>
        </Card>

        <Card className="border border-white/10 bg-white/5">
          <Card.Header className="px-5 pt-5">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/70">Статистика</p>
              <h2 className="text-xl font-semibold text-white">SLA и качество</h2>
            </div>
          </Card.Header>
          <Card.Content className="gap-3 px-5 pb-5">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <span className="text-slate-300">Среднее первое время ответа</span>
              <span className="font-semibold text-white">{overview?.sla.averageFirstResponseMinutes ?? 0} мин</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <span className="text-slate-300">Завершённые чаты</span>
              <span className="font-semibold text-white">{overview?.chats.completed ?? 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <span className="text-slate-300">Успешная база знаний</span>
              <span className="font-semibold text-white">{overview?.faq.usageCount ?? 0}</span>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
