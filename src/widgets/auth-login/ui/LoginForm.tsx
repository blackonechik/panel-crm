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
    <Card>
      <Card.Header>
        <p className="text-sm uppercase tracking-[0.24em]">Вход в систему</p>
        <h2 className="text-2xl font-semibold">Зайти в панель</h2>
        <p className="text-sm">Для первого входа используй seed-аккаунт из backend.</p>
      </Card.Header>
      <Card.Content>
        <Input aria-label="Email" placeholder="Email" value={email} onChange={(event) => onEmailChange(event.target.value)} />
        <Input
          aria-label="Пароль"
          placeholder="Пароль"
          type="password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
        />
        {error ? (
          <div className="rounded-2xl border px-4 py-3 text-sm">{error}</div>
        ) : null}
        <Button variant="primary" size="lg" isPending={loading} onPress={onSubmit}>
          Войти
        </Button>
        <Button variant="ghost" size="sm" isDisabled>
          Восстановить пароль
        </Button>
        <div className="rounded-2xl border p-4 text-sm">
          <p className="font-medium">Стартовый аккаунт</p>
          <p>admin@local.dev</p>
          <p>admin12345</p>
        </div>
      </Card.Content>
    </Card>
  );
}
