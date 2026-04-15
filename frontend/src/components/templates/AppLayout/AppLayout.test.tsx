import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AppLayout } from './AppLayout';

const { mockLogout } = vi.hoisted(() => ({ mockLogout: vi.fn() }));

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, email: 'user@test.com', role: 'CLIENT' as const },
    isAuthenticated: true,
    isAdmin: false,
    login: vi.fn(),
    logout: mockLogout,
  }),
}));

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <AppLayout />
    </MemoryRouter>,
  );
}

describe('AppLayout', () => {
  it('renders the brand name', () => {
    renderLayout();
    expect(screen.getByText('SaaS-Flow')).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    renderLayout();
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /facturas/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /planes/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /suscripción/i })).toBeInTheDocument();
  });

  it('shows user email in sidebar', () => {
    renderLayout();
    expect(screen.getByText('user@test.com')).toBeInTheDocument();
  });

  it('shows CLIENT role label', () => {
    renderLayout();
    expect(screen.getByText('Cliente')).toBeInTheDocument();
  });

  it('calls logout when logout button is clicked', () => {
    renderLayout();
    fireEvent.click(screen.getByText('Cerrar sesión'));
    expect(mockLogout).toHaveBeenCalledOnce();
  });
});
