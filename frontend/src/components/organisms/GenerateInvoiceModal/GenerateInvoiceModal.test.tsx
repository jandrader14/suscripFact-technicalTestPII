import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GenerateInvoiceModal } from './GenerateInvoiceModal';
import type { User } from '../../../types/user.types';
import type { Subscription } from '../../../types/subscription.types';
import type { Plan } from '../../../types/plan.types';

const user: User = { id: 1, email: 'cliente@test.com', role: 'CLIENT', isActive: true, createdAt: '' };

const subscription: Subscription = {
  id: 10,
  userId: 1,
  planId: 2,
  startDate: '2026-01-01',
  endDate: '2027-01-01',
  status: 'ACTIVE',
};

const plan: Plan = {
  id: 2,
  name: 'Plan Plata',
  type: 'SILVER',
  price: 59000,
  description: 'Intermedio',
  maxUsers: 15,
  isActive: true,
  createdAt: '',
};

describe('GenerateInvoiceModal', () => {
  it('renders plan info and user email', () => {
    render(
      <GenerateInvoiceModal
        user={user}
        subscription={subscription}
        plan={plan}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByText('cliente@test.com')).toBeInTheDocument();
    expect(screen.getByText('Plan Plata')).toBeInTheDocument();
  });

  it('calls onClose when Cancelar is clicked', () => {
    const onClose = vi.fn();
    render(
      <GenerateInvoiceModal
        user={user}
        subscription={subscription}
        plan={plan}
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
      <GenerateInvoiceModal
        user={user}
        subscription={subscription}
        plan={plan}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    const dateInputs = screen.getAllByDisplayValue(/\d{4}-\d{2}-\d{2}/);
    fireEvent.change(dateInputs[0], { target: { value: '2028-01-01' } }); // start
    fireEvent.change(dateInputs[1], { target: { value: '2027-01-01' } }); // end < start
    fireEvent.click(screen.getByRole('button', { name: /generar/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/posterior/i);
  });

  it('calls onSubmit with correct planType and planPrice', () => {
    const onSubmit = vi.fn();
    render(
      <GenerateInvoiceModal
        user={user}
        subscription={subscription}
        plan={plan}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /generar/i }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        planType: 'SILVER',
        planPrice: 59000,
        userId: 1,
        subscriptionId: 10,
      }),
    );
  });
});
