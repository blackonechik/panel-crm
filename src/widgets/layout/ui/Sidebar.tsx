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
      <Card className="sticky top-6 border border-white/10 bg-white/5 backdrop-blur-xl">
        <Card.Content className="gap-6 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/20 text-cyan-300">
              <span className="text-lg font-semibold">B</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">Bot CRM</p>
              <p className="font-semibold text-white">Панель оператора</p>
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
                    isActive ? 'bg-cyan-400/15 text-cyan-100 ring-1 ring-cyan-300/30' : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
            <div className="flex items-center gap-3">
              <Avatar color="accent" variant="soft" className="h-11 w-11">
                <Avatar.Fallback>{initials(userName)}</Avatar.Fallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium text-white">{userName}</p>
                <p className="truncate text-sm text-slate-400">{userRole}</p>
              </div>
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.22em] text-slate-500">Права доступа</p>
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
