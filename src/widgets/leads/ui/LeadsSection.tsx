import { Card, Chip } from '@heroui/react';
import type { Lead } from '../../../shared/model/types';
import { formatDateTime } from '../../../shared/lib/format';
import { statusChipColor } from '../../../shared/lib/status';

type LeadsSectionProps = {
  leads: Lead[];
};

const STATUS_LABELS: Record<string, string> = {
  NEW: 'Новый',
  QUALIFICATION: 'Квалификация',
  IN_PROGRESS: 'В работе',
  CONSULTATION_SCHEDULED: 'Консультация',
  PROPOSAL_SENT: 'Отправлено предложение',
  SUCCESSFUL: 'Успешный',
  LOST: 'Потерян',
  NOT_TARGET: 'Нецелевой'
};

export function LeadsSection({ leads }: LeadsSectionProps) {
  const stats = [
    { label: 'Всего', value: leads.length },
    { label: 'Успешные', value: leads.filter((lead) => lead.status === 'SUCCESSFUL').length },
    { label: 'В работе', value: leads.filter((lead) => lead.status === 'IN_PROGRESS').length },
    { label: 'Потерянные', value: leads.filter((lead) => lead.status === 'LOST').length }
  ];

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border border-white/10 bg-white/5">
            <Card.Content className="gap-2 p-5">
              <p className="text-sm text-slate-300">{stat.label}</p>
              <p className="text-3xl font-semibold text-white">{stat.value}</p>
            </Card.Content>
          </Card>
        ))}
      </div>

      <Card className="border border-white/10 bg-white/5">
        <Card.Header className="px-5 pt-5">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/70">Лиды</p>
            <h2 className="text-xl font-semibold text-white">Активные заявки</h2>
          </div>
        </Card.Header>
        <Card.Content className="grid gap-3 px-5 pb-5">
          {leads.map((lead) => (
            <div key={lead.id} className="grid gap-3 rounded-3xl border border-white/10 bg-slate-950/50 p-4 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="grid gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-white">{lead.fullName ?? 'Без имени'}</p>
                  <Chip size="sm" variant="soft" color={statusChipColor(lead.status)}>
                    {STATUS_LABELS[lead.status] ?? lead.status}
                  </Chip>
                  <Chip size="sm" variant="soft" color={lead.channel === 'TELEGRAM' ? 'accent' : 'default'}>
                    {lead.channel}
                  </Chip>
                </div>
                <p className="text-sm text-slate-400">{lead.interest ?? lead.comment ?? 'Интерес не указан'}</p>
                <p className="text-sm text-slate-400">
                  {lead.phone ?? 'Телефон не указан'} · {lead.email ?? 'Email не указан'}
                </p>
              </div>
              <div className="grid gap-2 text-sm text-slate-300">
                <div className="flex items-center justify-between gap-3">
                  <span>Источник</span>
                  <span className="text-white">{lead.source ?? '—'}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Создан</span>
                  <span className="text-white">{formatDateTime(lead.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Назначен</span>
                  <span className="text-white">{lead.assignedUser?.name ?? 'Не назначен'}</span>
                </div>
              </div>
            </div>
          ))}
        </Card.Content>
      </Card>
    </div>
  );
}
