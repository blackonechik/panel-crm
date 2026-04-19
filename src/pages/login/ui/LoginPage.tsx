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
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10">
        <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <Card.Content>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm uppercase">Bot CRM</p>
                  <h1 className="text-3xl font-semibold">Операторская панель для Telegram и MAX</h1>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {[
                  ['24/7', 'Автоответы и маршрутизация'],
                  ['2 канала', 'Telegram и MAX'],
                  ['RBAC', 'Роли и права доступа']
                ].map(([value, label]) => (
                  <Card key={value}>
                    <Card.Content>
                      <p className="text-2xl font-semibold">{value}</p>
                      <p className="text-sm">{label}</p>
                    </Card.Content>
                  </Card>
                ))}
              </div>

              <div className="grid gap-3 text-sm">
                {[
                  'Очередь чатов, карточка клиента и быстрые действия в одном экране',
                  'FAQ, сценарии, клиника, интеграции и аналитика уже подключены к backend',
                  'Шаблон рассчитан на быстрый старт: логин, токены ботов и база данных'
                ].map((text) => (
                  <div key={text} className="flex items-start gap-3 rounded-2xl border p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5" />
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
