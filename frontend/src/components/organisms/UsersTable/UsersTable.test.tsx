import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UsersTable } from './UsersTable';
import type { User } from '../../../types/user.types';
import type { Subscription } from '../../../types/subscription.types';
import type { Plan } from '../../../types/plan.types';

const users: User[] = [
  { id: 1, email: 'a@test.com', role: 'CLIENT', isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 2, email: 'b@test.com', role: 'CLIENT', isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 3, email: 'admin@test.com', role: 'ADMIN', isActive: true, createdAt: '2026-01-01T00:00:00Z' },
];

const subscriptions: Subscription[] = [
  { id: 10, userId: 1, planId: 1, startDate: '2026-01-01', endDate: '2027-01-01', status: 'ACTIVE' },
];

const plans: Plan[] = [
  { id: 1, name: 'Bronce', type: 'BRONZE', price: 29000, description: 'Plan básico', maxUsers: 5, isActive: true, createdAt: '2026-01-01T00:00:00Z' },
];

describe('UsersTable', () => {
  it('shows loading spinner while loading', () => {
    render(
      <UsersTable
        users={[]}
        subscriptions={[]}
        plans={[]}
        isLoading
        togglingId={null}
        onAssign={vi.fn()}
        onToggle={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Cargando usuarios')).toBeInTheDocument();
  });

  it('shows empty state when no clients exist', () => {
    render(
      <UsersTable
        users={[{ id: 3, email: 'admin@test.com', role: 'ADMIN', isActive: true, createdAt: '' }]}
        subscriptions={[]}
        plans={[]}
        isLoading={false}
        togglingId={null}
        onAssign={vi.fn()}
        onToggle={vi.fn()}
      />,
    );
    expect(screen.getByText(/no hay clientes/i)).toBeInTheDocument();
  });

  it('renders only client rows (excludes admins)', () => {
    render(
      <UsersTable
        users={users}
        subscriptions={subscriptions}
        plans={plans}
        isLoading={false}
        togglingId={null}
        onAssign={vi.fn()}
        onToggle={vi.fn()}
      />,
    );
    expect(screen.getByText('a@test.com')).toBeInTheDocument();
    expect(screen.getByText('b@test.com')).toBeInTheDocument();
    expect(screen.queryByText('admin@test.com')).not.toBeInTheDocument();
  });

  it('shows plan name for user with subscription', () => {
    render(
      <UsersTable
        users={users}
        subscriptions={subscriptions}
        plans={plans}
        isLoading={false}
        togglingId={null}
        onAssign={vi.fn()}
        onToggle={vi.fn()}
      />,
    );
    expect(screen.getByText('Bronce')).toBeInTheDocument();
  });
});
