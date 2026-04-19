import { Bot, CheckCircle2 } from 'lucide-react';
import { Card } from '@heroui/react';
import { LoginForm } from '../../../widgets/auth-login/ui/LoginForm';

type LoginPageProps = {
  email: string;
  password: string;
  loading: boolean;
  error: string | null;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
};

export function LoginPage({ email, password, loading, error, onEmailChange, onPasswordChange, onSubmit }: LoginPageProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.20),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.16),_transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10">
        <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
            <Card.Content className="gap-6 p-8 lg:p-10">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/20 text-cyan-300">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Bot CRM</p>
                  <h1 className="text-3xl font-semibold text-white">Операторская панель для Telegram и MAX</h1>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {[
                  ['24/7', 'Автоответы и маршрутизация'],
                  ['2 канала', 'Telegram и MAX'],
                  ['RBAC', 'Роли и права доступа']
                ].map(([value, label]) => (
                  <Card key={value} className="border border-white/10 bg-slate-950/60">
                    <Card.Content className="gap-1 p-4">
                      <p className="text-2xl font-semibold text-white">{value}</p>
                      <p className="text-sm text-slate-300">{label}</p>
                    </Card.Content>
                  </Card>
                ))}
              </div>

              <div className="grid gap-3 text-sm text-slate-300">
                {[
                  'Очередь чатов, карточка клиента и быстрые действия в одном экране',
                  'FAQ, сценарии, клиника, интеграции и аналитика уже подключены к backend',
                  'Шаблон рассчитан на быстрый старт: логин, токены ботов и база данных'
                ].map((text) => (
                  <div key={text} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>

          <LoginForm
            email={email}
            password={password}
            loading={loading}
            error={error}
            onEmailChange={onEmailChange}
            onPasswordChange={onPasswordChange}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </div>
  );
}
