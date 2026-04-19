import { Avatar, Button, Card, Chip } from '@heroui/react';
import { NavLink } from 'react-router-dom';
import { initials } from '../../../shared/lib/format';
import { NAVIGATION_ITEMS } from '../../../shared/config/navigation';

type SidebarProps = {
  userName: string;
  userRole: string;
  permissions: string[];
  onLogout: () => void;
};

export function Sidebar({ userName, userRole, permissions, onLogout }: SidebarProps) {
  return (
    <aside className="hidden w-[290px] shrink-0 lg:block">
      <Card>
        <Card.Content>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl">
              <span className="text-lg font-semibold">B</span>
            </div>
            <div>
              <p className="text-xs uppercase">Bot CRM</p>
              <p className="font-semibold">Панель оператора</p>
            </div>
          </div>

          <div className="grid gap-3">
            {NAVIGATION_ITEMS.map((item) => (
              <NavLink
                key={item.key}
                to={item.path}
                className={({ isActive }) =>
                  [
                    'rounded-2xl px-4 py-3 text-sm font-medium transition',
                    isActive ? 'ring-1' : ''
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="rounded-3xl border p-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <Avatar.Fallback>{initials(userName)}</Avatar.Fallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium">{userName}</p>
                <p className="truncate text-sm">{userRole}</p>
              </div>
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.22em]">Права доступа</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {permissions.slice(0, 6).map((permission) => (
                <Chip key={permission} size="sm" variant="soft" color="accent">
                  {permission}
                </Chip>
              ))}
            </div>
          </div>

          <Button variant="danger-soft" onPress={onLogout}>
            Выйти
          </Button>
        </Card.Content>
      </Card>
    </aside>
  );
}
