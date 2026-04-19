import { Button, Card, Chip, Input, TextArea } from '@heroui/react';
import { useEffect, useState } from 'react';
import type { RoleItem, UserListItem } from '../../../shared/model/types';

type UsersRolesSectionProps = {
  users: UserListItem[];
  roles: RoleItem[];
  rolePermissions: Array<{ id: string; code: string; description: string | null }>;
  onSaveRole: (id: string, payload: { name?: string; description?: string | null; permissions?: string[] }) => Promise<void>;
};

export function UsersRolesSection({ users, roles, rolePermissions, onSaveRole }: UsersRolesSectionProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(roles[0]?.id ?? null);
  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? roles[0] ?? null;
  const [draftName, setDraftName] = useState(selectedRole?.name ?? '');
  const [draftDescription, setDraftDescription] = useState(selectedRole?.description ?? '');
  const [permissions, setPermissions] = useState<string[]>(selectedRole?.permissions ?? []);

  useEffect(() => {
    if (!selectedRole) return;
    setDraftName(selectedRole.name);
    setDraftDescription(selectedRole.description ?? '');
    setPermissions(selectedRole.permissions);
  }, [selectedRole]);

  const selectedPermissionsCount = permissions.length;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <Card>
        <Card.Header>
          <div>
            <p className="text-sm uppercase tracking-[0.22em]">Пользователи</p>
            <h2 className="text-xl font-semibold">Команда</h2>
          </div>
        </Card.Header>
        <Card.Content>
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between gap-3 rounded-3xl border p-4">
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm">{user.email}</p>
              </div>
              <Chip size="sm" variant="soft" color="accent">
                {user.role.name}
              </Chip>
            </div>
          ))}
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <div>
            <p className="text-sm uppercase tracking-[0.22em]">Роли</p>
            <h2 className="text-xl font-semibold">RBAC</h2>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="grid gap-2 md:grid-cols-2">
            <select className="rounded-2xl border px-4 py-3" value={selectedRole?.id ?? ''} onChange={(event) => setSelectedRoleId(event.target.value)}>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            <Input aria-label="Название роли" placeholder="Название роли" value={draftName} onChange={(event) => setDraftName(event.target.value)} />
          </div>
          <TextArea aria-label="Описание роли" placeholder="Описание роли" rows={3} variant="secondary" value={draftDescription} onChange={(event) => setDraftDescription(event.target.value)} />
          <div className="grid gap-2 rounded-3xl border p-4 max-h-[360px] overflow-auto">
            {rolePermissions.map((permission) => (
              <label key={permission.id} className="flex items-start gap-3 rounded-2xl border p-3">
                <input
                  type="checkbox"
                  checked={permissions.includes(permission.code)}
                  onChange={(event) => {
                    setPermissions((current) =>
                      event.target.checked ? [...current, permission.code] : current.filter((value) => value !== permission.code)
                    );
                  }}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium">{permission.code}</p>
                  <p className="text-sm">{permission.description ?? 'Нет описания'}</p>
                </div>
              </label>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Chip size="sm" variant="soft" color="accent">
              Выбрано прав: {selectedPermissionsCount}
            </Chip>
            <Button
              variant="primary"
              isDisabled={!selectedRole}
              onPress={() => void onSaveRole(selectedRole?.id ?? '', { name: draftName, description: draftDescription, permissions })}
            >
              Сохранить роль
            </Button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
