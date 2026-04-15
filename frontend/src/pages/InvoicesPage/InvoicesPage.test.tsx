import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { InvoicesPage } from './InvoicesPage';
import type { Invoice } from '../../types/invoice.types';

const { mockGetByUser, mockPay } = vi.hoisted(() => ({
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

vi.mock('../../services/billingService', () => ({
  billingService: { getByUser: mockGetByUser, pay: mockPay },
}));

const mockInvoices: Invoice[] = [
  { id: 10, subscriptionId: 1, userId: 1, amount: 80000, status: 'PENDING', dueDate: '2026-05-01', paidAt: null },
];

function renderPage() {
  return render(<MemoryRouter><InvoicesPage /></MemoryRouter>);
}

describe('InvoicesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetByUser.mockResolvedValue(mockInvoices);
  });

  it('renders page heading', () => {
    renderPage();
    expect(screen.getByText('Facturas')).toBeInTheDocument();
  });

  it('renders invoices after load', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('#10')).toBeInTheDocument());
  });

  it('shows error alert when load fails', async () => {
    mockGetByUser.mockRejectedValue(new Error('Network error'));
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar'),
    );
  });

  it('calls billingService.pay with the invoice id on click', async () => {
    mockPay.mockResolvedValue({ ...mockInvoices[0], status: 'PAID', paidAt: '2026-04-15' });
    renderPage();
    const payBtn = await screen.findByRole('button', { name: /pagar/i });
    fireEvent.click(payBtn);
    await waitFor(() => expect(mockPay).toHaveBeenCalledWith(10));
  });

  it('shows pay error when payment fails', async () => {
    mockPay.mockRejectedValue(new Error('Payment failed'));
    renderPage();
    await waitFor(() => screen.getByRole('button', { name: /pagar/i }));
    fireEvent.click(screen.getByRole('button', { name: /pagar/i }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('No se pudo procesar el pago'),
    );
  });
});
