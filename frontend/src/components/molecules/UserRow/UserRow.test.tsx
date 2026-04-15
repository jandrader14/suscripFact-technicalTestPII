import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UserRow } from './UserRow';
import type { User } from '../../../types/user.types';
import type { Subscription } from '../../../types/subscription.types';
import type { Plan } from '../../../types/plan.types';

const mockUser: User = {
  id: 1,
  email: 'cliente@test.com',
  role: 'CLIENT',
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z',
};

const mockSubscription: Subscription = {
  id: 10,
  userId: 1,
  planId: 2,
  startDate: '2026-01-01',
  endDate: '2027-01-01',
  status: 'ACTIVE',
};

const mockPlan: Plan = {
  id: 2,
  name: 'Plan Plata',
  type: 'SILVER',
  price: 50000,
  description: 'Plan intermedio',
  maxUsers: 10,
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z',
};

function renderInTable(ui: React.ReactElement) {
  return render(
    <table><tbody>{ui}</tbody></table>,
  );
}

describe('UserRow', () => {
  it('renders user email and role', () => {
    renderInTable(
      <UserRow
        user={mockUser}
        isToggling={false}
        onAssign={vi.fn()}
        onToggle={vi.fn()}
      />,
    );
    expect(screen.getByText('cliente@test.com')).toBeInTheDocument();
    expect(screen.getByText('Cliente')).toBeInTheDocument();
  });

  it('shows plan name and Desactivar button when subscription is ACTIVE', () => {
    renderInTable(
      <UserRow
        user={mockUser}
        subscription={mockSubscription}
        plan={mockPlan}
        isToggling={false}
        onAssign={vi.fn()}
        onToggle={vi.fn()}
      />,
    );
    expect(screen.getByText('Plan Plata')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /desactivar/i })).toBeInTheDocument();
  });

  it('calls onToggle with subscription id when toggle button clicked', () => {
    const onToggle = vi.fn();
    renderInTable(
      <UserRow
        user={mockUser}
        subscription={mockSubscription}
        isToggling={false}
        onAssign={vi.fn()}
        onToggle={onToggle}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /desactivar/i }));
    expect(onToggle).toHaveBeenCalledWith(10);
  });

  it('calls onAssign when assign button is clicked', () => {
    const onAssign = vi.fn();
    renderInTable(
      <UserRow
        user={mockUser}
        isToggling={false}
        onAssign={onAssign}
        onToggle={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /asignar plan/i }));
    expect(onAssign).toHaveBeenCalledOnce();
  });

  it('does not show toggle button for EXPIRED subscriptions', () => {
    const expired: Subscription = { ...mockSubscription, status: 'EXPIRED' };
    renderInTable(
      <UserRow
        user={mockUser}
        subscription={expired}
        isToggling={false}
        onAssign={vi.fn()}
        onToggle={vi.fn()}
      />,
    );
    expect(screen.queryByRole('button', { name: /activar|desactivar/i })).not.toBeInTheDocument();
  });
});
