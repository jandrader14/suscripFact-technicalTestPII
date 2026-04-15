import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { InvoiceTable } from './InvoiceTable';
import type { Invoice } from '../../../types/invoice.types';

const mockInvoices: Invoice[] = [
  { id: 1, subscriptionId: 1, userId: 1, amount: 100000, status: 'PAID', dueDate: '2026-04-01', paidAt: '2026-03-28' },
  { id: 2, subscriptionId: 1, userId: 1, amount: 50000, status: 'PENDING', dueDate: '2026-05-01', paidAt: null },
];

describe('InvoiceTable', () => {
  it('renders table headers', () => {
    render(<InvoiceTable invoices={mockInvoices} />);
    expect(screen.getByText('#')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('Monto')).toBeInTheDocument();
  });

  it('renders a row per invoice', () => {
    render(<InvoiceTable invoices={mockInvoices} />);
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
  });

  it('shows empty state when invoices array is empty', () => {
    render(<InvoiceTable invoices={[]} />);
    expect(screen.getByText('No hay facturas registradas.')).toBeInTheDocument();
  });

  it('shows spinner when isLoading=true', () => {
    render(<InvoiceTable invoices={[]} isLoading />);
    expect(screen.getByRole('status', { name: /cargando/i })).toBeInTheDocument();
    expect(screen.queryByText('No hay facturas registradas.')).not.toBeInTheDocument();
  });

  it('calls onPay with correct invoice id', () => {
    const handlePay = vi.fn();
    render(<InvoiceTable invoices={mockInvoices} onPay={handlePay} />);
    fireEvent.click(screen.getByRole('button', { name: /pagar/i }));
    expect(handlePay).toHaveBeenCalledWith(2);
  });

  it('shows spinner on the paying row when payingId matches', () => {
    render(<InvoiceTable invoices={mockInvoices} onPay={vi.fn()} payingId={2} />);
    expect(screen.getByRole('status', { name: /cargando/i })).toBeInTheDocument();
  });

  it('renders title heading', () => {
    render(<InvoiceTable invoices={[]} />);
    expect(screen.getByText('Historial de facturas')).toBeInTheDocument();
  });
});
