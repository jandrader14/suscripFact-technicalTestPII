import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { useAuthStore } from '../../store/auth.store';

const { mockLogin, mockRegister, mockNavigate } = vi.hoisted(() => ({
  mockLogin: vi.fn(),
  mockRegister: vi.fn(),
  mockNavigate: vi.fn(),
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    logout: vi.fn(),
    user: null,
    isAuthenticated: false,
    isAdmin: false,
  }),
}));

vi.mock('../../services/authService', () => ({
  authService: { login: vi.fn(), register: mockRegister },
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
  });

  it('renders login form by default', () => {
    renderPage();
    expect(screen.getByText('Bienvenido de nuevo')).toBeInTheDocument();
  });

  it('renders Subscription Manager brand', () => {
    renderPage();
    expect(screen.getByText('Subscription Manager')).toBeInTheDocument();
  });

  it('calls login and navigates to dashboard on success', async () => {
    mockLogin.mockResolvedValue(undefined);
    renderPage();
    fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'pass123' } });
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'pass123');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  it('shows error message when login fails', async () => {
    mockLogin.mockRejectedValue(new Error('Unauthorized'));
    renderPage();
    fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: 'bad@test.com' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Credenciales inválidas'),
    );
  });

  it('toggles to register mode', () => {
    renderPage();
    fireEvent.click(screen.getByText(/no tienes cuenta/i));
    expect(screen.getByText('Crear cuenta')).toBeInTheDocument();
  });

  it('toggles back to login mode', () => {
    renderPage();
    fireEvent.click(screen.getByText(/no tienes cuenta/i));
    fireEvent.click(screen.getByText(/ya tienes cuenta/i));
    expect(screen.getByText('Bienvenido de nuevo')).toBeInTheDocument();
  });
});
