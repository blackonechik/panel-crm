import { Button, Card, Chip, Input, TextArea } from '@heroui/react';
import { useEffect, useMemo, useState } from 'react';
import type { AnalyticsOverview } from '../../../shared/model/types';
import type { Appointment, AppointmentSlot } from '../../../entities/appointment/model/types';
import { formatDateTime } from '../../../shared/lib/format';

type AppointmentsSectionProps = {
  appointments: Appointment[];
  appointmentSlots: AppointmentSlot[];
  overview: AnalyticsOverview | null;
  onCreateAppointment: (payload: {
    service: string;
    doctor?: string;
    scheduledAt: string;
    comment?: string;
    fullName?: string;
    phone?: string;
    email?: string;
    source?: string;
    createLead?: boolean;
  }) => Promise<void>;
  onConfirmAppointment: (id: string) => Promise<void>;
  onCancelAppointment: (id: string) => Promise<void>;
  onRescheduleAppointment: (id: string, scheduledAt: string) => Promise<void>;
};

export function AppointmentsSection({
  appointments,
  appointmentSlots,
  overview,
  onCreateAppointment,
  onConfirmAppointment,
  onCancelAppointment,
  onRescheduleAppointment
}: AppointmentsSectionProps) {
  const [service, setService] = useState('');
  const [doctor, setDoctor] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [rescheduleValues, setRescheduleValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!scheduledAt && appointmentSlots[0]) {
      setScheduledAt(appointmentSlots[0].scheduledAt);
    }
  }, [appointmentSlots, scheduledAt]);

  const statusCounts = useMemo(() => {
    return appointments.reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = (acc[item.status] ?? 0) + 1;
      return acc;
    }, {});
  }, [appointments]);

  async function handleCreate() {
    if (!service.trim() || !scheduledAt) return;
    setSaving(true);
    try {
      await onCreateAppointment({
        service: service.trim(),
        doctor: doctor.trim() || undefined,
        scheduledAt,
        comment: comment.trim() || undefined,
        fullName: fullName.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        source: 'panel',
        createLead: true
      });
      setService('');
      setDoctor('');
      setComment('');
      setFullName('');
      setPhone('');
      setEmail('');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
      <div className="grid gap-6">
        <Card className="border border-white/10 bg-white/5">
          <Card.Header className="px-5 pt-5">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/70">Записи</p>
              <h2 className="text-xl font-semibold text-white">Новая запись</h2>
            </div>
          </Card.Header>
          <Card.Content className="grid gap-4 px-5 pb-5">
            <div className="grid gap-3 md:grid-cols-2">
              <Input aria-label="Услуга" placeholder="Услуга" value={service} onChange={(event) => setService(event.target.value)} />
              <Input aria-label="Врач" placeholder="Врач" value={doctor} onChange={(event) => setDoctor(event.target.value)} />
              <Input
                aria-label="Дата и время"
                type="datetime-local"
                value={scheduledAt ? scheduledAt.slice(0, 16) : ''}
                onChange={(event) => setScheduledAt(event.target.value ? new Date(event.target.value).toISOString() : '')}
              />
              <Input aria-label="ФИО" placeholder="ФИО клиента" value={fullName} onChange={(event) => setFullName(event.target.value)} />
              <Input aria-label="Телефон" placeholder="Телефон" value={phone} onChange={(event) => setPhone(event.target.value)} />
              <Input aria-label="Email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <TextArea aria-label="Комментарий" placeholder="Комментарий к записи" rows={3} variant="secondary" value={comment} onChange={(event) => setComment(event.target.value)} />
            <div className="flex flex-wrap gap-2">
              {appointmentSlots.slice(0, 6).map((slot) => (
                <button
                  key={slot.scheduledAt}
                  type="button"
                  onClick={() => setScheduledAt(slot.scheduledAt)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    scheduledAt === slot.scheduledAt ? 'bg-cyan-400 text-slate-950' : 'bg-white/5 text-slate-200 hover:bg-white/10'
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" isDisabled={!service.trim() || !scheduledAt} isPending={saving} onPress={() => void handleCreate()}>
                Создать запись
              </Button>
              <Chip variant="soft" color="accent">
                Доступно слотов: {appointmentSlots.length}
              </Chip>
            </div>
          </Card.Content>
        </Card>

        <Card className="border border-white/10 bg-white/5">
          <Card.Header className="px-5 pt-5">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/70">Слоты</p>
              <h2 className="text-xl font-semibold text-white">Ближайшие доступные окна</h2>
            </div>
          </Card.Header>
          <Card.Content className="grid gap-3 px-5 pb-5">
            {appointmentSlots.length ? (
              appointmentSlots.slice(0, 10).map((slot) => (
                <div key={slot.scheduledAt} className="flex items-center justify-between gap-3 rounded-3xl border border-white/10 bg-slate-950/50 p-4">
                  <div>
                    <p className="font-medium text-white">{slot.label}</p>
                    <p className="text-sm text-slate-400">
                      {slot.specialization ?? 'Любое направление'} {slot.doctor ? `· ${slot.doctor}` : ''}
                    </p>
                  </div>
                  <Chip size="sm" variant="soft" color="default">
                    {formatDateTime(slot.scheduledAt)}
                  </Chip>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4 text-slate-300">Доступные слоты пока не найдены</div>
            )}
          </Card.Content>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card className="border border-white/10 bg-white/5">
          <Card.Header className="px-5 pt-5">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/70">SLA</p>
              <h2 className="text-xl font-semibold text-white">Качество реакции</h2>
            </div>
          </Card.Header>
          <Card.Content className="grid gap-3 px-5 pb-5">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <span className="text-slate-300">Первый ответ</span>
              <span className="font-semibold text-white">{overview?.sla.averageFirstResponseMinutes ?? 0} мин</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <span className="text-slate-300">В ожидании менеджера</span>
              <span className="font-semibold text-white">{overview?.chats.waitingManager ?? 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <span className="text-slate-300">Записей всего</span>
              <span className="font-semibold text-white">{overview?.appointments.total ?? appointments.length}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['REQUESTED', 'WAITING_CONFIRMATION', 'CONFIRMED', 'RESCHEDULED', 'CANCELLED'] as const).map((status) => (
                <Chip key={status} size="sm" variant="soft" color={status === 'CONFIRMED' ? 'success' : status === 'CANCELLED' ? 'danger' : 'default'}>
                  {status}: {statusCounts[status] ?? 0}
                </Chip>
              ))}
            </div>
          </Card.Content>
        </Card>

        <Card className="border border-white/10 bg-white/5">
          <Card.Header className="px-5 pt-5">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/70">Записи</p>
              <h2 className="text-xl font-semibold text-white">Текущие appointments</h2>
            </div>
          </Card.Header>
          <Card.Content className="grid gap-3 px-5 pb-5">
            {appointments.slice(0, 8).map((appointment) => (
              <div key={appointment.id} className="grid gap-3 rounded-3xl border border-white/10 bg-slate-950/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{appointment.service}</p>
                    <p className="text-sm text-slate-400">{appointment.client?.fullName ?? 'Без клиента'} · {appointment.doctor ?? 'любой врач'}</p>
                    <p className="text-sm text-slate-400">{formatDateTime(appointment.scheduledAt)}</p>
                  </div>
                  <Chip size="sm" variant="soft" color={appointment.status === 'CONFIRMED' ? 'success' : appointment.status === 'CANCELLED' ? 'danger' : 'accent'}>
                    {appointment.status}
                  </Chip>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="primary" onPress={() => void onConfirmAppointment(appointment.id)}>
                    Подтвердить
                  </Button>
                  <Button size="sm" variant="secondary" onPress={() => void onCancelAppointment(appointment.id)}>
                    Отменить
                  </Button>
                </div>
                <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                  <Input
                    aria-label={`Перенести ${appointment.id}`}
                    type="datetime-local"
                    value={rescheduleValues[appointment.id] ?? ''}
                    onChange={(event) =>
                      setRescheduleValues((current) => ({
                        ...current,
                        [appointment.id]: event.target.value
                      }))
                    }
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    isDisabled={!rescheduleValues[appointment.id]}
                    onPress={() => {
                      const value = rescheduleValues[appointment.id];
                      if (!value) return;
                      void onRescheduleAppointment(appointment.id, new Date(value).toISOString());
                    }}
                  >
                    Перенести
                  </Button>
                </div>
                {appointment.comment ? <p className="text-sm text-slate-400">{appointment.comment}</p> : null}
              </div>
            ))}
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
