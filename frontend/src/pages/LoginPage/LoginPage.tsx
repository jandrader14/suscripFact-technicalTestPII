import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '../../components/organisms/AuthForm';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';

export function LoginPage() {
  const [error, setError] = useState<string | undefined>();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (email: string, password: string) => {
    setError(undefined);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch {
      setError('Credenciales inválidas. Verifica tu correo y contraseña.');
    }
  };

  const handleRegister = async (email: string, password: string) => {
    setError(undefined);
    try {
      await authService.register({ email, password });
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch {
      setError('No se pudo crear la cuenta. El correo puede estar en uso.');
    }
  };

  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-mono text-xs tracking-widest uppercase text-accent font-medium">
            Subscription Manager
          </span>
        </div>

        <div className="bg-bg-surface rounded border border-border shadow-card p-8">
          <AuthForm
            mode={mode}
            onSubmit={mode === 'login' ? handleSubmit : handleRegister}
            error={error}
          />

          <div className="mt-6 pt-5 border-t border-border text-center">
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(undefined); }}
              className="text-sm font-body text-text-secondary hover:text-accent transition-colors duration-fast"
            >
              {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
