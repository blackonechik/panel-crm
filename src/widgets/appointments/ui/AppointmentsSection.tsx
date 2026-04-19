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

type CalendarDay = {
  dateKey: string;
  dayLabel: string;
  weekdayLabel: string;
  subtitle: string;
  slots: AppointmentSlot[];
};

const WEEK_SIZE = 7;

function toDateKey(value: string) {
  return value.slice(0, 10);
}

function createDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function labelDate(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00`);
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short'
  }).format(date);
}

function labelWeekday(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00`);
  return new Intl.DateTimeFormat('ru-RU', {
    weekday: 'short'
  }).format(date);
}

function labelSubtitle(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00`);
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

function buildUpcomingDays(days = 28) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return createDateKey(date);
  });
}

function splitIntoChunks<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function formatRangeLabel(days: CalendarDay[]) {
  if (!days.length) return 'Неделя';
  const first = new Date(`${days[0].dateKey}T12:00:00`);
  const last = new Date(`${days[days.length - 1].dateKey}T12:00:00`);
  return `${new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short' }).format(first)} — ${new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short'
  }).format(last)}`;
}

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
  const [selectedDayKey, setSelectedDayKey] = useState('');
  const [weekStart, setWeekStart] = useState(0);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [rescheduleValues, setRescheduleValues] = useState<Record<string, string>>({});

  const calendarDays = useMemo<CalendarDay[]>(() => {
    const slotMap = new Map<string, AppointmentSlot[]>();

    for (const slot of appointmentSlots) {
      const key = toDateKey(slot.scheduledAt);
      const current = slotMap.get(key) ?? [];
      current.push(slot);
      slotMap.set(key, current);
    }

    return buildUpcomingDays().map((dateKey) => ({
      dateKey,
      dayLabel: labelDate(dateKey),
      weekdayLabel: labelWeekday(dateKey),
      subtitle: labelSubtitle(dateKey),
      slots: (slotMap.get(dateKey) ?? []).sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
    }));
  }, [appointmentSlots]);

  const visibleWeeks = useMemo(() => splitIntoChunks(calendarDays, WEEK_SIZE), [calendarDays]);
  const visibleDays = visibleWeeks[weekStart] ?? visibleWeeks[0] ?? [];

  const selectedDay = useMemo(() => {
    return calendarDays.find((day) => day.dateKey === selectedDayKey) ?? visibleDays[0] ?? calendarDays[0] ?? null;
  }, [calendarDays, selectedDayKey, visibleDays]);

  const selectedSlot = useMemo(() => {
    if (!selectedDay) return null;
    return selectedDay.slots.find((slot) => slot.scheduledAt === scheduledAt) ?? selectedDay.slots[0] ?? null;
  }, [scheduledAt, selectedDay]);

  const statusCounts = useMemo(() => {
    return appointments.reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = (acc[item.status] ?? 0) + 1;
      return acc;
    }, {});
  }, [appointments]);

  useEffect(() => {
    if (!calendarDays.length) return;

    const todayKey = createDateKey(new Date());
    const dayIndex = Math.max(
      0,
      calendarDays.findIndex((day) => day.dateKey === todayKey && day.slots.length > 0)
    );
    const initialDay = calendarDays[dayIndex] ?? calendarDays[0];
    if (!selectedDayKey && initialDay) {
      setSelectedDayKey(initialDay.dateKey);
    }
    if (!visibleWeeks.length) return;
    if (weekStart >= visibleWeeks.length) {
      setWeekStart(Math.max(0, visibleWeeks.length - 1));
    }
  }, [calendarDays, selectedDayKey, visibleWeeks, weekStart]);

  useEffect(() => {
    if (!selectedDay) return;
    if (!selectedDay.slots.length) {
      if (scheduledAt) setScheduledAt('');
      return;
    }

    const hasSelectedSlot = selectedDay.slots.some((slot) => slot.scheduledAt === scheduledAt);
    if (!hasSelectedSlot) {
      setScheduledAt(selectedDay.slots[0].scheduledAt);
    }
  }, [scheduledAt, selectedDay]);

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

  function selectDay(day: CalendarDay) {
    setSelectedDayKey(day.dateKey);
    setScheduledAt(day.slots[0]?.scheduledAt ?? '');
  }

  function selectSlot(slot: AppointmentSlot) {
    setSelectedDayKey(toDateKey(slot.scheduledAt));
    setScheduledAt(slot.scheduledAt);
  }

  function goPreviousWeek() {
    setWeekStart((current) => Math.max(0, current - 1));
  }

  function goNextWeek() {
    setWeekStart((current) => Math.min(Math.max(0, visibleWeeks.length - 1), current + 1));
  }

  function goToToday() {
    const todayKey = createDateKey(new Date());
    const dayIndex = calendarDays.findIndex((day) => day.dateKey === todayKey);
    if (dayIndex >= 0) {
      const nextWeekStart = Math.floor(dayIndex / WEEK_SIZE);
      setWeekStart(nextWeekStart);
      setSelectedDayKey(todayKey);
      setScheduledAt(calendarDays[dayIndex]?.slots[0]?.scheduledAt ?? '');
    }
  }

  const weekLabel = formatRangeLabel(visibleDays);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="grid gap-6">
        <Card>
          <Card.Header>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.22em]">Календарь</p>
                <h2 className="text-xl font-semibold">Выбор слота записи</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" onPress={goPreviousWeek} isDisabled={weekStart === 0}>
                  Назад
                </Button>
                <Button variant="secondary" onPress={goToToday}>
                  Сегодня
                </Button>
                <Button variant="secondary" onPress={goNextWeek} isDisabled={weekStart >= Math.max(0, visibleWeeks.length - 1)}>
                  Вперёд
                </Button>
              </div>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm">Период: {weekLabel}</p>
              <Chip variant="soft" color="accent">
                Свободных слотов: {appointmentSlots.length}
              </Chip>
            </div>

            {visibleDays.length ? (
              <div className="grid gap-3 xl:grid-cols-7">
                {visibleDays.map((day) => {
                  const isSelected = day.dateKey === selectedDayKey;
                  const hasSlots = day.slots.length > 0;
                  const firstSlot = day.slots[0];
                  const lastSlot = day.slots[day.slots.length - 1];

                  return (
                    <button
                      key={day.dateKey}
                      type="button"
                      onClick={() => selectDay(day)}
                      className={[
                        'min-h-[220px] rounded-3xl border p-4 text-left transition',
                        isSelected ? 'ring-1' : ''
                      ].join(' ')}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm uppercase tracking-[0.18em]">{day.weekdayLabel}</p>
                          <p className="text-2xl font-semibold">{day.dayLabel}</p>
                        </div>
                        <Chip size="sm" variant="soft" color={hasSlots ? 'accent' : 'default'}>
                          {day.slots.length}
                        </Chip>
                      </div>

                      <p className="mt-2 text-sm">{day.subtitle}</p>

                      <div className="mt-4 space-y-2">
                        {hasSlots ? (
                          <>
                            <div className="flex flex-wrap gap-2">
                              {day.slots.slice(0, 4).map((slot) => (
                                <span
                                  key={slot.scheduledAt}
                                  className={[
                                    'rounded-full px-3 py-1 text-xs font-medium',
                                    scheduledAt === slot.scheduledAt ? 'ring-1' : ''
                                  ].join(' ')}
                                >
                                  {slot.label}
                                </span>
                              ))}
                            </div>
                            {day.slots.length > 4 ? <p className="text-xs">+ ещё {day.slots.length - 4} окна</p> : null}
                            <p className="text-xs">
                              {firstSlot?.label} — {lastSlot?.label}
                            </p>
                          </>
                        ) : (
                          <div className="rounded-2xl border border-dashed px-3 py-4 text-sm">
                            Нет доступных окон
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl border p-4">Доступные слоты пока не найдены</div>
            )}
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <div>
              <p className="text-sm uppercase tracking-[0.22em]">День</p>
              <h2 className="text-xl font-semibold">{selectedDay ? selectedDay.subtitle : 'Выберите день'}</h2>
            </div>
          </Card.Header>
          <Card.Content>
            {selectedDay ? (
              <div className="grid gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip variant="soft" color="accent">
                    {selectedDay.weekdayLabel} · {selectedDay.dayLabel}
                  </Chip>
                  <Chip variant="soft" color={selectedDay.slots.length ? 'success' : 'default'}>
                    {selectedDay.slots.length ? `${selectedDay.slots.length} слотов` : 'Свободных окон нет'}
                  </Chip>
                  {selectedSlot ? (
                    <Chip variant="soft" color="default">
                      Выбран: {selectedSlot.label}
                    </Chip>
                  ) : null}
                </div>

                {selectedDay.slots.length ? (
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {selectedDay.slots.map((slot) => {
                      const isSelected = scheduledAt === slot.scheduledAt;
                      return (
                        <button
                          key={slot.scheduledAt}
                          type="button"
                          onClick={() => selectSlot(slot)}
                          className={[
                            'rounded-2xl border px-4 py-3 text-left transition',
                            isSelected ? 'ring-1' : ''
                          ].join(' ')}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium">{slot.label}</p>
                              <p className="text-sm">{formatDateTime(slot.scheduledAt)}</p>
                            </div>
                            <Chip size="sm" variant="soft" color={slot.doctor ? 'accent' : 'default'}>
                              {slot.doctor ?? 'любой врач'}
                            </Chip>
                          </div>
                          <p className="mt-2 text-xs">{slot.specialization ?? 'Без специализации'}</p>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-3xl border p-4">
                    На этот день пока нет свободных окон. Можно выбрать другой день в календаре.
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-3xl border p-4">
                Выберите день в календаре.
              </div>
            )}
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <div>
              <p className="text-sm uppercase tracking-[0.22em]">Запись</p>
              <h2 className="text-xl font-semibold">Новая запись</h2>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="grid gap-3 md:grid-cols-2">
              <Input aria-label="Услуга" placeholder="Услуга" value={service} onChange={(event) => setService(event.target.value)} />
              <Input aria-label="Врач" placeholder="Врач" value={doctor} onChange={(event) => setDoctor(event.target.value)} />
              <Input aria-label="ФИО" placeholder="ФИО клиента" value={fullName} onChange={(event) => setFullName(event.target.value)} />
              <Input aria-label="Телефон" placeholder="Телефон" value={phone} onChange={(event) => setPhone(event.target.value)} />
              <Input aria-label="Email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
              <Input
                aria-label="Точный слот"
                type="datetime-local"
                value={scheduledAt ? scheduledAt.slice(0, 16) : ''}
                onChange={(event) => setScheduledAt(event.target.value ? new Date(event.target.value).toISOString() : '')}
              />
            </div>
            <TextArea aria-label="Комментарий" placeholder="Комментарий к записи" rows={3} variant="secondary" value={comment} onChange={(event) => setComment(event.target.value)} />
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="primary" isDisabled={!service.trim() || !scheduledAt} isPending={saving} onPress={() => void handleCreate()}>
                Создать запись
              </Button>
              <Chip variant="soft" color="accent">
                Доступно слотов: {appointmentSlots.length}
              </Chip>
              <Chip variant="soft" color={selectedSlot ? 'success' : 'default'}>
                {selectedSlot ? selectedSlot.label : 'Слот не выбран'}
              </Chip>
            </div>
          </Card.Content>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card>
          <Card.Header>
            <div>
              <p className="text-sm uppercase tracking-[0.22em]">SLA</p>
              <h2 className="text-xl font-semibold">Качество реакции</h2>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="flex items-center justify-between rounded-2xl border p-4">
              <span>Первый ответ</span>
              <span className="font-semibold">{overview?.sla.averageFirstResponseMinutes ?? 0} мин</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border p-4">
              <span>В ожидании менеджера</span>
              <span className="font-semibold">{overview?.chats.waitingManager ?? 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border p-4">
              <span>Записей всего</span>
              <span className="font-semibold">{overview?.appointments.total ?? appointments.length}</span>
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

        <Card>
          <Card.Header>
            <div>
              <p className="text-sm uppercase tracking-[0.22em]">Записи</p>
              <h2 className="text-xl font-semibold">Текущие appointments</h2>
            </div>
          </Card.Header>
          <Card.Content>
            {appointments.slice(0, 8).map((appointment) => (
              <div key={appointment.id} className="grid gap-3 rounded-3xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{appointment.service}</p>
                    <p className="text-sm">
                      {appointment.client?.fullName ?? 'Без клиента'} · {appointment.doctor ?? 'любой врач'}
                    </p>
                    <p className="text-sm">{formatDateTime(appointment.scheduledAt)}</p>
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
                {appointment.comment ? <p className="text-sm">{appointment.comment}</p> : null}
              </div>
            ))}
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
