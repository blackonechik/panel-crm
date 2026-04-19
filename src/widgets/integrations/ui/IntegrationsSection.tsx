import { Button, Card, Chip, TextArea } from '@heroui/react';
import { useEffect, useState } from 'react';
import type { IntegrationSetting } from '../../../shared/model/types';

type IntegrationsSectionProps = {
  integrations: IntegrationSetting[];
  onSaveIntegration: (key: string, payload: { isEnabled: boolean; payload?: unknown }) => Promise<void>;
};

export function IntegrationsSection({ integrations, onSaveIntegration }: IntegrationsSectionProps) {
  const [selectedKey, setSelectedKey] = useState(integrations[0]?.key ?? '');
  const selected = integrations.find((item) => item.key === selectedKey) ?? integrations[0] ?? null;
  const [enabled, setEnabled] = useState(selected?.isEnabled ?? false);
  const [payload, setPayload] = useState(JSON.stringify(selected?.payload ?? {}, null, 2));

  useEffect(() => {
    if (!selected) return;
    setEnabled(selected.isEnabled);
    setPayload(JSON.stringify(selected.payload ?? {}, null, 2));
  }, [selected]);

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <Card>
        <Card.Header>
          <div>
            <p className="text-sm uppercase tracking-[0.22em]">Интеграции</p>
            <h2 className="text-xl font-semibold">Каналы и сервисы</h2>
          </div>
        </Card.Header>
        <Card.Content>
          {integrations.map((integration) => (
            <button
              key={integration.id}
              type="button"
              onClick={() => setSelectedKey(integration.key)}
              className={`rounded-3xl border p-4 text-left transition ${selected?.key === integration.key ? 'ring-1' : ''}`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{integration.key}</p>
                <Chip size="sm" variant="soft" color={integration.isEnabled ? 'success' : 'default'}>
                  {integration.isEnabled ? 'online' : 'offline'}
                </Chip>
              </div>
            </button>
          ))}
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <div>
            <p className="text-sm uppercase tracking-[0.22em]">Настройка</p>
            <h2 className="text-xl font-semibold">{selected?.key ?? 'Выберите интеграцию'}</h2>
          </div>
        </Card.Header>
        <Card.Content>
          {selected ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Chip size="sm" variant="soft" color={enabled ? 'success' : 'default'}>
                  {enabled ? 'enabled' : 'disabled'}
                </Chip>
                <Button variant={enabled ? 'secondary' : 'primary'} onPress={() => setEnabled(!enabled)}>
                  {enabled ? 'Отключить' : 'Включить'}
                </Button>
              </div>
              <TextArea aria-label="Payload" placeholder="JSON payload" rows={12} variant="secondary" value={payload} onChange={(event) => setPayload(event.target.value)} />
              <Button
                variant="primary"
                onPress={() =>
                  void onSaveIntegration(selected.key, {
                    isEnabled: enabled,
                    payload: JSON.parse(payload || '{}')
                  })
                }
              >
                Сохранить интеграцию
              </Button>
            </>
          ) : (
            <div className="rounded-3xl border p-4">Интеграции не загружены</div>
          )}
        </Card.Content>
      </Card>
    </div>
  );
}
