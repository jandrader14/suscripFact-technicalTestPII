import { type FormEvent, useState } from 'react';
import { FormField } from '../../molecules/FormField';
import { Button } from '../../atoms/Button';

type AuthMode = 'login' | 'register';

interface AuthFormProps {
  mode: AuthMode;
  onSubmit: (email: string, password: string) => Promise<void>;
  error?: string;
}

export function AuthForm({ mode, onSubmit, error }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    if (!email) errors.email = 'El correo es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Correo inválido';
    if (!password) errors.password = 'La contraseña es requerida';
    else if (password.length < 6) errors.password = 'Mínimo 6 caracteres';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await onSubmit(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5" aria-label={isLogin ? 'Iniciar sesión' : 'Crear cuenta'}>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-display font-semibold text-text-primary">
          {isLogin ? 'Bienvenido de nuevo' : 'Crear cuenta'}
        </h1>
        <p className="text-sm font-body text-text-secondary">
          {isLogin ? 'Ingresa tus credenciales para continuar' : 'Completa los datos para registrarte'}
        </p>
      </div>

      {error && (
        <div role="alert" className="rounded border border-status-overdue/30 bg-status-overdue-bg px-4 py-3 text-sm font-body text-status-overdue">
          {error}
        </div>
      )}

      <FormField
        label="Correo electrónico"
        id="auth-email"
        type="email"
        placeholder="tu@correo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
        required
        autoComplete="email"
      />

      <FormField
        label="Contraseña"
        id="auth-password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
        required
        autoComplete={isLogin ? 'current-password' : 'new-password'}
      />

      <Button type="submit" isLoading={isLoading} className="w-full mt-1">
        {isLogin ? 'Iniciar sesión' : 'Registrarse'}
      </Button>
    </form>
  );
}
