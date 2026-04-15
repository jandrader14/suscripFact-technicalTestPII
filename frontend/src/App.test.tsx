import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

const { mockAuthState } = vi.hoisted(() => ({
  mockAuthState: {
    user: null as { id: number; email: string; role: 'CLIENT' | 'ADMIN' } | null,
    isAuthenticated: false,
    isAdmin: false,
  },
}));

vi.mock('./hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockAuthState.user,
    isAuthenticated: mockAuthState.isAuthenticated,
    isAdmin: mockAuthState.isAdmin,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('./hooks/useSubscription', () => ({
  useSubscription: () => ({
    subscription: null,
    isActive: false,
    loadStatus: vi.fn().mockResolvedValue({ isActive: false, subscription: null }),
    clear: vi.fn(),
  }),
}));

vi.mock('./services/billingService', () => ({
  billingService: { getByUser: vi.fn().mockResolvedValue([]), pay: vi.fn() },
}));

vi.mock('./services/plansService', () => ({
  plansService: { getAll: vi.fn().mockResolvedValue([]) },
}));

vi.mock('./services/subscriptionsService', () => ({
  subscriptionsService: { create: vi.fn(), getStatus: vi.fn() },
}));

describe('App routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState.user = null;
    mockAuthState.isAuthenticated = false;
    mockAuthState.isAdmin = false;
  });

  it('renders without crashing', () => {
    expect(() => render(<App />)).not.toThrow();
  });

  it('shows login page when not authenticated', () => {
    render(<App />);
    expect(screen.getByText('Bienvenido de nuevo')).toBeInTheDocument();
  });

  it('shows login form inputs when not authenticated', () => {
    render(<App />);
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });
});
