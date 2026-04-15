import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MetricsDashboard } from './MetricsDashboard';
import type { Invoice } from '../../../types/invoice.types';
import type { Subscription } from '../../../types/subscription.types';

const mockInvoices: Invoice[] = [
  { id: 1, subscriptionId: 1, userId: 1, amount: 100000, status: 'PAID', dueDate: '2026-04-01', paidAt: '2026-03-28' },
  { id: 2, subscriptionId: 1, userId: 1, amount: 50000, status: 'PENDING', dueDate: '2026-05-01', paidAt: null },
  { id: 3, subscriptionId: 1, userId: 1, amount: 75000, status: 'OVERDUE', dueDate: '2026-03-01', paidAt: null },
];

const mockSubscription: Subscription = {
  id: 1,
  userId: 1,
  planId: 2,
  status: 'ACTIVE',
  startDate: '2026-01-01',
  endDate: '2027-01-01',
};

describe('MetricsDashboard', () => {
  it('renders 4 stat cards', () => {
    render(<MetricsDashboard invoices={mockInvoices} subscription={mockSubscription} />);
    expect(screen.getAllByRole('article')).toHaveLength(4);
  });

  it('shows spinner when isLoading=true', () => {
    render(<MetricsDashboard invoices={[]} subscription={null} isLoading />);
    expect(screen.getByRole('status', { name: /cargando/i })).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('shows pending count correctly', () => {
    render(<MetricsDashboard invoices={mockInvoices} subscription={mockSubscription} />);
    const pendingCard = screen.getByText('Pendientes').closest('article');
    expect(pendingCard).toHaveTextContent('1');
  });

  it('shows overdue count correctly', () => {
    render(<MetricsDashboard invoices={mockInvoices} subscription={mockSubscription} />);
    const overdueCard = screen.getByText('Vencidas').closest('article');
    expect(overdueCard).toHaveTextContent('1');
  });

  it('shows "Sin plan" when subscription is null', () => {
    render(<MetricsDashboard invoices={[]} subscription={null} />);
    expect(screen.getByText('Sin plan')).toBeInTheDocument();
  });

  it('shows subscription status when subscription exists', () => {
    render(<MetricsDashboard invoices={mockInvoices} subscription={mockSubscription} />);
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });

  it('renders section with accessible label', () => {
    render(<MetricsDashboard invoices={[]} subscription={null} />);
    expect(screen.getByRole('region', { name: /resumen de métricas/i })).toBeInTheDocument();
  });
});
