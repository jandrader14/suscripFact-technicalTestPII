import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RoleRoute } from './RoleRoute';

const { mockUser } = vi.hoisted(() => ({
  mockUser: { current: null as { id: number; email: string; role: 'CLIENT' | 'ADMIN' } | null, isAuthenticated: false },
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser.current,
    isAuthenticated: mockUser.isAuthenticated,
    isAdmin: mockUser.current?.role === 'ADMIN',
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

function renderWithRole(
  userRole: 'CLIENT' | 'ADMIN' | null,
  allowedRoles: Array<'CLIENT' | 'ADMIN'>,
) {
  mockUser.current = userRole ? { id: 1, email: 'u@test.com', role: userRole } : null;
  mockUser.isAuthenticated = userRole !== null;
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/login" element={<div>Login</div>} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
        <Route element={<RoleRoute allowedRoles={allowedRoles} />}>
          <Route path="/admin" element={<div>Admin area</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('RoleRoute', () => {
  it('renders content when user has the required role', () => {
    renderWithRole('ADMIN', ['ADMIN']);
    expect(screen.getByText('Admin area')).toBeInTheDocument();
  });

  it('redirects to /dashboard when user lacks the required role', () => {
    renderWithRole('CLIENT', ['ADMIN']);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Admin area')).not.toBeInTheDocument();
  });

  it('redirects to /login when user is not authenticated', () => {
    renderWithRole(null, ['ADMIN']);
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('allows multiple roles', () => {
    renderWithRole('CLIENT', ['CLIENT', 'ADMIN']);
    expect(screen.getByText('Admin area')).toBeInTheDocument();
  });
});
