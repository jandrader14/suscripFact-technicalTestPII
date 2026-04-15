import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AuthForm } from './AuthForm';

const fillForm = (email: string, password: string) => {
  fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: password } });
};

describe('AuthForm — login mode', () => {
  it('renders login heading and submit button', () => {
    render(<AuthForm mode="login" onSubmit={vi.fn()} />);
    expect(screen.getByText('Bienvenido de nuevo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('calls onSubmit with email and password on valid submit', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    render(<AuthForm mode="login" onSubmit={handleSubmit} />);
    fillForm('user@example.com', 'secret123');
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    await waitFor(() => expect(handleSubmit).toHaveBeenCalledWith('user@example.com', 'secret123'));
  });

  it('shows validation errors when fields are empty', async () => {
    render(<AuthForm mode="login" onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    await waitFor(() => {
      expect(screen.getByText('El correo es requerido')).toBeInTheDocument();
      expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument();
    });
  });

  it('shows invalid email error for wrong format', async () => {
    render(<AuthForm mode="login" onSubmit={vi.fn()} />);
    fillForm('not-an-email', 'pass123');
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    await waitFor(() => expect(screen.getByText('Correo inválido')).toBeInTheDocument());
  });

  it('shows password length error when password is too short', async () => {
    render(<AuthForm mode="login" onSubmit={vi.fn()} />);
    fillForm('user@example.com', '123');
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    await waitFor(() => expect(screen.getByText('Mínimo 6 caracteres')).toBeInTheDocument());
  });

  it('does not call onSubmit when validation fails', async () => {
    const handleSubmit = vi.fn();
    render(<AuthForm mode="login" onSubmit={handleSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    await waitFor(() => expect(handleSubmit).not.toHaveBeenCalled());
  });

  it('renders external error alert when error prop is provided', () => {
    render(<AuthForm mode="login" onSubmit={vi.fn()} error="Credenciales inválidas" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Credenciales inválidas');
  });
});

describe('AuthForm — register mode', () => {
  it('renders register heading and submit button', () => {
    render(<AuthForm mode="register" onSubmit={vi.fn()} />);
    expect(screen.getByText('Crear cuenta')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrarse/i })).toBeInTheDocument();
  });
});
