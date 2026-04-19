import { Button, Card, Chip, Input, TextArea } from '@heroui/react';
import { useMemo, useState } from 'react';
import type { ChatDetail, ChatListItem, UserListItem } from '../../../shared/model/types';
import { formatDateTime } from '../../../shared/lib/format';
import { statusChipColor } from '../../../shared/lib/status';

const CHAT_STATUS_OPTIONS = [
  'NEW',
  'BOT_IN_PROGRESS',
  'WAITING_MANAGER',
  'ASSIGNED',
  'MANAGER_IN_PROGRESS',
  'WAITING_CLIENT',
  'COMPLETED',
  'ARCHIVED',
  'SPAM',
  'APPOINTMENT',
  'WAITING_CONFIRMATION',
  'CONFIRMED',
  'RESCHEDULED',
  'CANCELLED'
];

const CHAT_MODE_OPTIONS = ['AUTO', 'MANUAL', 'MIXED', 'CLOSED'];

type ChatsSectionProps = {
  chats: ChatListItem[];
  chat: ChatDetail | null;
  users: UserListItem[];
  chatMessage: string;
  setChatMessage: (value: string) => void;
  internalNote: string;
  setInternalNote: (value: string) => void;
  onSelectChat: (value: string) => void;
  onSendMessage: () => Promise<void>;
  onAddNote: () => Promise<void>;
  onStatusChange: (value: string) => Promise<void>;
  onModeChange: (value: string) => Promise<void>;
  onAssignChat: (value: string) => Promise<void>;
};

export function ChatsSection({
  chats,
  chat,
  users,
  chatMessage,
  setChatMessage,
  internalNote,
  setInternalNote,
  onSelectChat,
  onSendMessage,
  onAddNote,
  onStatusChange,
  onModeChange,
  onAssignChat
}: ChatsSectionProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('');
  const [leadFilter, setLeadFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  const filteredChats = useMemo(() => {
    return chats.filter((item) => {
      const haystack = [
        item.client.fullName,
        item.client.phone,
        item.client.email,
        item.client.username,
        item.externalChatId,
        item.channel,
        item.status
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (search && !haystack.includes(search.toLowerCase())) return false;
      if (statusFilter && item.status !== statusFilter) return false;
      if (channelFilter && item.channel !== channelFilter) return false;
      if (assignedFilter === 'assigned' && !item.assignedUser) return false;
      if (assignedFilter === 'unassigned' && item.assignedUser) return false;
      if (leadFilter === 'with' && !item.tags.includes('lead')) return false;
      if (leadFilter === 'without' && item.tags.includes('lead')) return false;
      if (dateFilter) {
        const updated = new Date(item.updatedAt).toISOString().slice(0, 10);
        if (updated !== dateFilter) return false;
      }
      return true;
    });
  }, [assignedFilter, channelFilter, chats, dateFilter, leadFilter, search, statusFilter]);

  const assignableUsers = users.filter(Boolean);

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <Card>
        <Card.Header>
          <div>
            <p className="text-sm uppercase tracking-[0.22em]">Очередь</p>
            <h2 className="text-xl font-semibold">Все чаты</h2>
          </div>
          <Chip variant="soft" color="accent">
            {filteredChats.length}
          </Chip>
        </Card.Header>
        <Card.Content>
          <Input aria-label="Поиск чатов" placeholder="Имя, телефон, username, канал" value={search} onChange={(event) => setSearch(event.target.value)} />
          <div className="grid gap-3 md:grid-cols-2">
            <select className="rounded-2xl border px-4 py-3" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">Все статусы</option>
              {CHAT_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select className="rounded-2xl border px-4 py-3" value={channelFilter} onChange={(event) => setChannelFilter(event.target.value)}>
              <option value="">Все каналы</option>
              <option value="TELEGRAM">Telegram</option>
              <option value="MAX">MAX</option>
            </select>
            <select className="rounded-2xl border px-4 py-3" value={assignedFilter} onChange={(event) => setAssignedFilter(event.target.value)}>
              <option value="">Все назначения</option>
              <option value="assigned">Назначенные</option>
              <option value="unassigned">Неназначенные</option>
            </select>
            <select className="rounded-2xl border px-4 py-3" value={leadFilter} onChange={(event) => setLeadFilter(event.target.value)}>
              <option value="all">Все чаты</option>
              <option value="with">С лидом</option>
              <option value="without">Без лида</option>
            </select>
          </div>
          <Input aria-label="Дата обновления" type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
          <div className="grid gap-3">
            {filteredChats.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectChat(item.id)}
                className={`rounded-3xl border p-4 text-left transition ${chat?.id === item.id ? 'ring-1' : ''}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{item.client.fullName ?? 'Без имени'}</p>
                  <Chip size="sm" variant="soft" color={item.channel === 'TELEGRAM' ? 'accent' : 'default'}>
                    {item.channel}
                  </Chip>
                </div>
                <p className="mt-1 truncate text-sm">{item.client.phone ?? item.client.username ?? item.externalChatId}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Chip size="sm" variant="soft" color={statusChipColor(item.status)}>
                    {item.status}
                  </Chip>
                  <Chip size="sm" variant="soft" color={item.isUrgent ? 'danger' : 'default'}>
                    {item.isUrgent ? 'срочно' : 'обычный'}
                  </Chip>
                </div>
              </button>
            ))}
          </div>
        </Card.Content>
      </Card>

      <div className="grid gap-6">
        <Card>
          <Card.Header>
            <div>
              <p className="text-sm uppercase tracking-[0.22em]">Диалог</p>
              <h2 className="text-xl font-semibold">{chat?.client.fullName ?? 'Выберите чат'}</h2>
            </div>
            {chat ? (
              <div className="flex flex-wrap gap-2">
                <Chip variant="soft" color="accent">
                  {chat.channel}
                </Chip>
                <Chip variant="soft" color={statusChipColor(chat.status)}>
                  {chat.status}
                </Chip>
                <Chip variant="soft" color={chat.isUrgent ? 'danger' : 'default'}>
                  {chat.isUrgent ? 'срочно' : 'обычный'}
                </Chip>
              </div>
            ) : null}
          </Card.Header>

          <Card.Content>
            {chat ? (
              <>
                <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                  <Card>
                    <Card.Content>
                      <div className="flex flex-wrap gap-3">
                        <div className="rounded-2xl border px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.2em]">Клиент</p>
                          <p className="font-medium">{chat.client.fullName ?? '—'}</p>
                          <p className="text-sm">{chat.client.phone ?? chat.client.email ?? 'Нет контакта'}</p>
                        </div>
                        <div className="rounded-2xl border px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.2em]">Назначен</p>
                          <p className="font-medium">{chat.assignedUser?.name ?? 'Не назначен'}</p>
                          <p className="text-sm">{chat.priority}</p>
                        </div>
                        <div className="rounded-2xl border px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.2em]">Состояние</p>
                          <p className="font-medium">{chat.conversationState}</p>
                          <p className="text-sm">{formatDateTime(chat.updatedAt)}</p>
                        </div>
                        <div className="rounded-2xl border px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.2em]">Теги</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {chat.tags.length ? chat.tags.map((tag) => (
                              <Chip key={tag} size="sm" variant="soft" color="default">
                                {tag}
                              </Chip>
                            )) : <span className="text-sm">Нет тегов</span>}
                          </div>
                        </div>
                      </div>
                    </Card.Content>
                  </Card>

                  <Card>
                    <Card.Content>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="grid gap-2 text-sm">
                          <span>Статус чата</span>
                          <select className="rounded-2xl border px-4 py-3" value={chat.status} onChange={(event) => void onStatusChange(event.target.value)}>
                            {CHAT_STATUS_OPTIONS.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </label>
                        <label className="grid gap-2 text-sm">
                          <span>Режим</span>
                          <select className="rounded-2xl border px-4 py-3" value={chat.mode} onChange={(event) => void onModeChange(event.target.value)}>
                            {CHAT_MODE_OPTIONS.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <label className="grid gap-2 text-sm">
                        <span>Назначить сотруднику</span>
                        <select className="rounded-2xl border px-4 py-3" value={chat.assignedUser?.id ?? ''} onChange={(event) => void onAssignChat(event.target.value)}>
                          <option value="">Не назначен</option>
                          {assignableUsers.map((user) => (
                            <option key={user.id} value={user.id}>{user.name} · {user.role.name}</option>
                          ))}
                        </select>
                      </label>
                    </Card.Content>
                  </Card>
                </div>

                <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
                  <Card>
                    <Card.Header>
                      <h3 className="text-lg font-semibold">Сообщения</h3>
                    </Card.Header>
                    <Card.Content>
                      <div className="max-h-[560px] space-y-3 overflow-auto pr-1">
                        {chat.messages.map((message) => (
                          <div key={message.id} className={`flex ${message.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-3xl border px-4 py-3 ${
                            message.direction === 'OUTBOUND'
                                ? 'ring-1'
                                : message.direction === 'INTERNAL'
                                  ? 'border-dashed'
                                  : ''
                            }`}>
                              <p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>
                              <p className="mt-2 text-[11px] uppercase tracking-[0.18em]">{message.direction} · {formatDateTime(message.createdAt)}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="grid gap-3 rounded-3xl border p-4">
                        <TextArea aria-label="Ответ клиенту" placeholder="Ответ клиенту" value={chatMessage} onChange={(event) => setChatMessage(event.target.value)} rows={3} variant="secondary" />
                        <div className="grid gap-2 rounded-2xl border border-dashed p-3">
                          <input
                            aria-label="Файл"
                            type="file"
                            onChange={(event) => setAttachmentName(event.target.files?.[0]?.name ?? '')}
                            className="block w-full rounded-2xl border px-4 py-3 text-sm file:mr-4 file:rounded-xl file:border-0 file:px-3 file:py-2 file:text-sm file:font-medium"
                          />
                          <p className="text-xs">{attachmentName ? `Выбран файл: ${attachmentName}` : 'Файлы можно прикреплять при поддержке канала'}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="primary" onPress={() => void onSendMessage()}>Отправить</Button>
                          <Button variant="secondary" onPress={() => onSelectChat(chat.id)}>Обновить</Button>
                          <Button variant="ghost" isDisabled>
                            Прикрепить файл
                          </Button>
                        </div>
                      </div>
                    </Card.Content>
                  </Card>

                  <Card>
                    <Card.Header>
                      <h3 className="text-lg font-semibold">Карточка клиента</h3>
                    </Card.Header>
                    <Card.Content>
                      <div className="rounded-3xl border p-4">
                        <p className="text-xs uppercase tracking-[0.2em]">Контакты</p>
                        <p className="mt-2 text-sm">{chat.client.fullName ?? '—'}</p>
                        <p className="text-sm">{chat.client.phone ?? 'Телефон не указан'}</p>
                        <p className="text-sm">{chat.client.email ?? 'Email не указан'}</p>
                        <p className="text-sm">@{chat.client.username ?? 'username не указан'}</p>
                      </div>

                      <div className="rounded-3xl border p-4">
                        <p className="text-xs uppercase tracking-[0.2em]">Lead</p>
                        <p className="mt-2 text-sm">{chat.lead?.status ?? 'Не создан'}</p>
                        <p className="text-sm">{chat.lead?.interest ?? 'Интерес не указан'}</p>
                        <p className="text-sm">{chat.lead?.assignedUser?.name ?? 'Назначение не задано'}</p>
                      </div>

                      <div className="rounded-3xl border p-4">
                        <TextArea aria-label="Внутренняя заметка" placeholder="Внутренняя заметка" value={internalNote} onChange={(event) => setInternalNote(event.target.value)} rows={4} variant="secondary" />
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button variant="secondary" onPress={() => void onAddNote()}>Добавить заметку</Button>
                        </div>
                      </div>
                    </Card.Content>
                  </Card>
                </div>
              </>
            ) : (
              <div className="rounded-3xl border p-8">
                Выберите чат слева, чтобы открыть переписку, карточку клиента и быстрые действия.
              </div>
            )}
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
