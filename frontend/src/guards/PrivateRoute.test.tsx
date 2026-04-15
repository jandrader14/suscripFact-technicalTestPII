import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';

const { mockIsAuthenticated } = vi.hoisted(() => ({
  mockIsAuthenticated: { value: false },
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockIsAuthenticated.value ? { id: 1, email: 'u@test.com', role: 'CLIENT' as const } : null,
    isAuthenticated: mockIsAuthenticated.value,
    isAdmin: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

function renderWithRoute(authenticated: boolean, initialPath = '/protected') {
  mockIsAuthenticated.value = authenticated;
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Página de login</div>} />
        <Route element={<PrivateRoute />}>
          <Route path="/protected" element={<div>Contenido protegido</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('PrivateRoute', () => {
  it('renders protected content when authenticated', () => {
    renderWithRoute(true);
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });

  it('redirects to /login when not authenticated', () => {
    renderWithRoute(false);
    expect(screen.getByText('Página de login')).toBeInTheDocument();
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });
});
