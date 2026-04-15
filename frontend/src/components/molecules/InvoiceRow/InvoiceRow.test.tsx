import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { InvoiceRow } from './InvoiceRow';
import type { Invoice } from '../../../types/invoice.types';

const baseInvoice: Invoice = {
  id: 7,
  subscriptionId: 1,
  userId: 2,
  amount: 150000,
  status: 'PENDING',
  dueDate: '2026-05-01',
  paidAt: null,
};

function renderRow(invoice: Invoice, onPay?: (id: number) => void, isPaying = false) {
  return render(
    <table>
      <tbody>
        <InvoiceRow invoice={invoice} onPay={onPay} isPaying={isPaying} />
      </tbody>
    </table>,
  );
}

describe('InvoiceRow', () => {
  it('renders invoice id and amount', () => {
    renderRow(baseInvoice);
    expect(screen.getByText('#7')).toBeInTheDocument();
    expect(screen.getByText(/150.000/)).toBeInTheDocument();
  });

  it('renders PENDING badge', () => {
    renderRow(baseInvoice);
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('renders Pay button for PENDING invoice', () => {
    renderRow(baseInvoice, vi.fn());
    expect(screen.getByRole('button', { name: /pagar/i })).toBeInTheDocument();
  });

  it('renders Pay button for OVERDUE invoice', () => {
    renderRow({ ...baseInvoice, status: 'OVERDUE' }, vi.fn());
    expect(screen.getByRole('button', { name: /pagar/i })).toBeInTheDocument();
  });

  it('does not render Pay button for PAID invoice', () => {
    renderRow({ ...baseInvoice, status: 'PAID', paidAt: '2026-04-10' });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onPay with invoice id when Pay is clicked', () => {
    const handlePay = vi.fn();
    renderRow(baseInvoice, handlePay);
    fireEvent.click(screen.getByRole('button', { name: /pagar/i }));
    expect(handlePay).toHaveBeenCalledWith(7);
  });

  it('shows dash when paidAt is null', () => {
    renderRow(baseInvoice);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows spinner when isPaying=true', () => {
    renderRow(baseInvoice, vi.fn(), true);
    expect(screen.getByRole('status', { name: /cargando/i })).toBeInTheDocument();
  });
});
