import { Button, Card, Chip, Input, TextArea } from '@heroui/react';
import type { ClinicProfile, IntegrationSetting, NotificationItem, RoleItem, UserListItem } from '../../../shared/model/types';
import { formatDateTime } from '../../../shared/lib/format';

type SettingsSectionProps = {
  profile: ClinicProfile | null;
  setProfile: (value: ClinicProfile | null) => void;
  onSaveProfile: () => Promise<void>;
  notifications: NotificationItem[];
  integrations: IntegrationSetting[];
  roles: RoleItem[];
  users: UserListItem[];
};

export function SettingsSection({
  profile,
  setProfile,
  onSaveProfile,
  notifications,
  integrations,
  roles,
  users
}: SettingsSectionProps) {
  const updateProfile = (patch: Partial<ClinicProfile>) => {
    if (!profile) return;
    setProfile({ ...profile, ...patch });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <Card className="border border-white/10 bg-white/5">
        <Card.Header className="px-5 pt-5">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/70">Клиника</p>
            <h2 className="text-xl font-semibold text-white">Профиль и тексты</h2>
          </div>
        </Card.Header>
        <Card.Content className="grid gap-4 px-5 pb-5">
          {profile ? (
            <>
              <Input aria-label="Название клиники" placeholder="Название клиники" value={profile.name} onChange={(event) => updateProfile({ name: event.target.value })} />
              <Input aria-label="Адрес" placeholder="Адрес" value={profile.address ?? ''} onChange={(event) => updateProfile({ address: event.target.value })} />
              <Input aria-label="Телефон" placeholder="Телефон" value={profile.phone ?? ''} onChange={(event) => updateProfile({ phone: event.target.value })} />
              <Input aria-label="Сайт" placeholder="Сайт" value={profile.site ?? ''} onChange={(event) => updateProfile({ site: event.target.value })} />
              <TextArea
                aria-label="Приветствие"
                placeholder="Приветствие"
                value={profile.welcomeText ?? ''}
                onChange={(event) => updateProfile({ welcomeText: event.target.value })}
                rows={3}
                variant="secondary"
              />
              <TextArea
                aria-label="Главное меню"
                placeholder="Главное меню"
                value={profile.mainMenuText ?? ''}
                onChange={(event) => updateProfile({ mainMenuText: event.target.value })}
                rows={3}
                variant="secondary"
              />
              <TextArea
                aria-label="Текст дисклеймера"
                placeholder="Текст дисклеймера"
                value={profile.disclaimerText ?? ''}
                onChange={(event) => updateProfile({ disclaimerText: event.target.value })}
                rows={3}
                variant="secondary"
              />
              <Button variant="primary" onPress={() => void onSaveProfile()}>
                Сохранить профиль
              </Button>
            </>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4 text-slate-300">Профиль клиники не загружен</div>
          )}
        </Card.Content>
      </Card>

      <div className="grid gap-6">
        <Card className="border border-white/10 bg-white/5">
          <Card.Header className="px-5 pt-5">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/70">Интеграции</p>
              <h2 className="text-xl font-semibold text-white">Telegram / MAX</h2>
            </div>
          </Card.Header>
          <Card.Content className="grid gap-3 px-5 pb-5">
            {integrations.map((integration) => (
              <div key={integration.id} className="flex items-center justify-between gap-3 rounded-3xl border border-white/10 bg-slate-950/50 p-4">
                <div>
                  <p className="font-medium text-white">{integration.key}</p>
                  <p className="text-sm text-slate-400">{integration.isEnabled ? 'включено' : 'выключено'}</p>
                </div>
                <Chip size="sm" variant="soft" color={integration.isEnabled ? 'success' : 'default'}>
                  {integration.isEnabled ? 'online' : 'offline'}
                </Chip>
              </div>
            ))}
          </Card.Content>
        </Card>

        <Card className="border border-white/10 bg-white/5">
          <Card.Header className="px-5 pt-5">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/70">Команда</p>
              <h2 className="text-xl font-semibold text-white">Пользователи и роли</h2>
            </div>
          </Card.Header>
          <Card.Content className="grid gap-4 px-5 pb-5">
            <div className="grid gap-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between gap-3 rounded-3xl border border-white/10 bg-slate-950/50 p-4">
                  <div>
                    <p className="font-medium text-white">{user.name}</p>
                    <p className="text-sm text-slate-400">{user.email}</p>
                  </div>
                  <Chip size="sm" variant="soft" color="accent">
                    {user.role.name}
                  </Chip>
                </div>
              ))}
            </div>

            <div className="grid gap-2">
              {roles.map((role) => (
                <div key={role.id} className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-white">{role.name}</p>
                    <Chip size="sm" variant="soft" color="default">
                      {role.permissions.length} прав
                    </Chip>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{role.description ?? 'Описание не задано'}</p>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        <Card className="border border-white/10 bg-white/5">
          <Card.Header className="px-5 pt-5">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/70">События</p>
              <h2 className="text-xl font-semibold text-white">Последние уведомления</h2>
            </div>
          </Card.Header>
          <Card.Content className="grid gap-3 px-5 pb-5">
            {notifications.slice(0, 5).map((notification) => (
              <div key={notification.id} className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-white">{notification.title}</p>
                  <Chip size="sm" variant="soft" color={notification.isRead ? 'default' : 'warning'}>
                    {notification.isRead ? 'read' : 'new'}
                  </Chip>
                </div>
                <p className="mt-2 text-sm text-slate-400">{notification.body}</p>
                <p className="mt-3 text-xs text-slate-500">{formatDateTime(notification.createdAt)}</p>
              </div>
            ))}
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
