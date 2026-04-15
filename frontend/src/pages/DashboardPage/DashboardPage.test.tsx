import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from './DashboardPage';
import type { Invoice } from '../../types/invoice.types';

const { mockLoadStatus, mockGetByUser, mockPay } = vi.hoisted(() => ({
  mockLoadStatus: vi.fn(),
  mockGetByUser: vi.fn(),
  mockPay: vi.fn(),
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, email: 'user@test.com', role: 'CLIENT' as const },
    isAuthenticated: true,
    isAdmin: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('../../hooks/useSubscription', () => ({
  useSubscription: () => ({
    subscription: null,
    isActive: false,
    loadStatus: mockLoadStatus,
    clear: vi.fn(),
  }),
}));

vi.mock('../../services/billingService', () => ({
  billingService: { getByUser: mockGetByUser, pay: mockPay },
}));

const mockInvoices: Invoice[] = [
  { id: 1, subscriptionId: 1, userId: 1, amount: 100000, status: 'PAID', dueDate: '2026-04-01', paidAt: '2026-03-28' },
  { id: 2, subscriptionId: 1, userId: 1, amount: 50000, status: 'PENDING', dueDate: '2026-05-01', paidAt: null },
];

function renderPage() {
  return render(<MemoryRouter><DashboardPage /></MemoryRouter>);
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadStatus.mockResolvedValue({ isActive: false, subscription: null });
    mockGetByUser.mockResolvedValue(mockInvoices);
  });

  it('renders dashboard heading', () => {
    renderPage();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('shows user email', () => {
    renderPage();
    expect(screen.getByText('user@test.com')).toBeInTheDocument();
  });

  it('shows spinner while loading', () => {
    mockGetByUser.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getAllByRole('status')).not.toHaveLength(0);
  });

  it('renders invoices after loading', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('#1')).toBeInTheDocument());
    expect(screen.getByText('#2')).toBeInTheDocument();
  });

  it('calls billingService.pay when Pay is clicked', async () => {
    mockPay.mockResolvedValue({ ...mockInvoices[1], status: 'PAID', paidAt: '2026-04-15' });
    renderPage();
    await waitFor(() => screen.getByRole('button', { name: /pagar/i }));
    fireEvent.click(screen.getByRole('button', { name: /pagar/i }));
    await waitFor(() => expect(mockPay).toHaveBeenCalledWith(2));
  });
});
