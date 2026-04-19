import { Button, Card, Input } from '@heroui/react';

type LoginFormProps = {
  email: string;
  password: string;
  loading: boolean;
  error: string | null;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
};

export function LoginForm({
  email,
  password,
  loading,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit
}: LoginFormProps) {
  return (
    <Card className="border border-white/10 bg-white/95 text-slate-950 shadow-2xl shadow-cyan-950/30">
      <Card.Header className="flex flex-col gap-2 px-8 pt-8">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Вход в систему</p>
        <h2 className="text-2xl font-semibold">Зайти в панель</h2>
        <p className="text-sm text-slate-500">Для первого входа используй seed-аккаунт из backend.</p>
      </Card.Header>
      <Card.Content className="gap-4 px-8 pb-8">
        <Input aria-label="Email" placeholder="Email" value={email} onChange={(event) => onEmailChange(event.target.value)} />
        <Input
          aria-label="Пароль"
          placeholder="Пароль"
          type="password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
        />
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}
        <Button variant="primary" size="lg" isPending={loading} onPress={onSubmit}>
          Войти
        </Button>
        <Button variant="ghost" size="sm" isDisabled>
          Восстановить пароль
        </Button>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-medium text-slate-700">Стартовый аккаунт</p>
          <p>admin@local.dev</p>
          <p>admin12345</p>
        </div>
      </Card.Content>
    </Card>
  );
}
