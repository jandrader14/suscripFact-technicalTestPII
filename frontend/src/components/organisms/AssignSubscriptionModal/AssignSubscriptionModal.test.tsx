import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AssignSubscriptionModal } from './AssignSubscriptionModal';
import type { User } from '../../../types/user.types';
import type { Plan } from '../../../types/plan.types';

const user: User = {
  id: 1,
  email: 'cliente@test.com',
  role: 'CLIENT',
  isActive: true,
  createdAt: '',
};

const plans: Plan[] = [
  { id: 1, name: 'Bronce', type: 'BRONZE', price: 29000, description: 'Básico', maxUsers: 5, isActive: true, createdAt: '' },
  { id: 2, name: 'Plata', type: 'SILVER', price: 59000, description: 'Intermedio', maxUsers: 15, isActive: true, createdAt: '' },
];

describe('AssignSubscriptionModal', () => {
  it('renders user email and plan options', () => {
    render(
      <AssignSubscriptionModal
        user={user}
        plans={plans}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByText('cliente@test.com')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Bronce/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Plata/i })).toBeInTheDocument();
  });

  it('calls onClose when Cancelar is clicked', () => {
    const onClose = vi.fn();
    render(
      <AssignSubscriptionModal
        user={user}
        plans={plans}
        isSubmitting={false}
        onClose={onClose}
        onSubmit={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows validation error when end date is before start date', () => {
    render(
      <AssignSubscriptionModal
        user={user}
        plans={plans}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    const inputs = screen.getAllByDisplayValue(/.*/);
    const dateInputs = inputs.filter((el) => el.getAttribute('type') === 'date');
    fireEvent.change(dateInputs[0], { target: { value: '2027-01-01' } }); // start
    fireEvent.change(dateInputs[1], { target: { value: '2026-01-01' } }); // end < start
    fireEvent.click(screen.getByRole('button', { name: /asignar/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/posterior/i);
  });

  it('shows loading state when submitting', () => {
    render(
      <AssignSubscriptionModal
        user={user}
        plans={plans}
        isSubmitting
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: /asignar/i })).toHaveAttribute('aria-busy', 'true');
  });
});
