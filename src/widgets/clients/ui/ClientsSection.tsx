import { Button, Card, Chip, Input, TextArea } from '@heroui/react';
import { useEffect, useMemo, useState } from 'react';
import { initials } from '../../../shared/lib/format';
import type { Client } from '../../../entities/client/model/types';

type ClientsSectionProps = {
  clients: Client[];
  onSaveClient: (id: string, payload: Partial<Client>) => Promise<void>;
  selectedClientId?: string | null;
  onSelectClient?: (id: string) => void;
};

export function ClientsSection({ clients, onSaveClient, selectedClientId = null, onSelectClient }: ClientsSectionProps) {
  const [query, setQuery] = useState('');
  const selectedClient = clients.find((client) => client.id === selectedClientId) ?? clients[0] ?? null;
  const [draft, setDraft] = useState<Client | null>(selectedClient);

  const filtered = useMemo(() => {
    return clients.filter((client) => {
      const haystack = [client.fullName, client.phone, client.email, client.username, client.company, client.city, client.source]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return !query || haystack.includes(query.toLowerCase());
    });
  }, [clients, query]);

  useEffect(() => {
    setDraft(selectedClient);
  }, [selectedClient]);

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <Card>
        <Card.Header>
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/70">Клиенты</p>
            <h2 className="text-xl font-semibold text-white">База клиентов</h2>
          </div>
        </Card.Header>
        <Card.Content>
          <Input aria-label="Поиск клиентов" placeholder="Имя, телефон, email, username" value={query} onChange={(event) => setQuery(event.target.value)} />
          {filtered.map((client) => (
            <button
              key={client.id}
              type="button"
              onClick={() => onSelectClient?.(client.id)}
              className={`rounded-3xl border p-4 text-left transition ${selectedClient?.id === client.id ? 'border-cyan-400/40 bg-cyan-400/10' : 'border-white/10 bg-slate-950/50 hover:bg-slate-950/70'}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-400/15 text-sm font-semibold text-cyan-100">
                  {initials(client.fullName ?? client.username ?? client.email)}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{client.fullName ?? 'Без имени'}</p>
                  <p className="truncate text-sm text-slate-400">{client.phone ?? client.email ?? client.username ?? 'Нет контакта'}</p>
                </div>
              </div>
            </button>
          ))}
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/70">Карточка клиента</p>
            <h2 className="text-xl font-semibold text-white">{draft?.fullName ?? 'Выберите клиента'}</h2>
          </div>
        </Card.Header>
        <Card.Content>
          {draft ? (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <Input aria-label="Имя" placeholder="Имя" value={draft.fullName ?? ''} onChange={(event) => setDraft({ ...draft, fullName: event.target.value })} />
                <Input aria-label="Телефон" placeholder="Телефон" value={draft.phone ?? ''} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} />
                <Input aria-label="Email" placeholder="Email" value={draft.email ?? ''} onChange={(event) => setDraft({ ...draft, email: event.target.value })} />
                <Input aria-label="Username" placeholder="Username" value={draft.username ?? ''} onChange={(event) => setDraft({ ...draft, username: event.target.value })} />
                <Input aria-label="Город" placeholder="Город" value={draft.city ?? ''} onChange={(event) => setDraft({ ...draft, city: event.target.value })} />
                <Input aria-label="Компания" placeholder="Компания" value={draft.company ?? ''} onChange={(event) => setDraft({ ...draft, company: event.target.value })} />
              </div>
              <TextArea aria-label="Теги" placeholder="Теги через запятую" rows={3} variant="secondary" value={draft.tags.join(', ')} onChange={(event) => setDraft({ ...draft, tags: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} />
              <div className="flex flex-wrap gap-2">
                <Chip size="sm" variant="soft" color={draft.consentAccepted ? 'success' : 'warning'}>
                  {draft.consentAccepted ? 'Согласие есть' : 'Согласие не зафиксировано'}
                </Chip>
                <Chip size="sm" variant="soft" color="default">
                  Источник: {draft.source ?? '—'}
                </Chip>
              </div>
              <Button variant="primary" onPress={() => void onSaveClient(draft.id, draft)}>
                Сохранить клиента
              </Button>
            </>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4 text-slate-300">Клиенты не найдены</div>
          )}
        </Card.Content>
      </Card>
    </div>
  );
}
