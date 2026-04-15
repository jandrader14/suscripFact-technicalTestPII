import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { InvoiceFilterBar } from './InvoiceFilterBar';

describe('InvoiceFilterBar', () => {
  it('renders all filter options', () => {
    render(<InvoiceFilterBar activeFilter="ALL" onChange={vi.fn()} />);
    expect(screen.getByRole('tab', { name: /todas/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /pendientes/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /pagadas/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /vencidas/i })).toBeInTheDocument();
  });

  it('marks active filter as selected', () => {
    render(<InvoiceFilterBar activeFilter="PENDING" onChange={vi.fn()} />);
    expect(screen.getByRole('tab', { name: /pendientes/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /todas/i })).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onChange with correct value when tab is clicked', () => {
    const onChange = vi.fn();
    render(<InvoiceFilterBar activeFilter="ALL" onChange={onChange} />);
    fireEvent.click(screen.getByRole('tab', { name: /pagadas/i }));
    expect(onChange).toHaveBeenCalledWith('PAID');
  });

  it('displays counts when provided', () => {
    render(
      <InvoiceFilterBar
        activeFilter="ALL"
        onChange={vi.fn()}
        counts={{ ALL: 5, PENDING: 2, PAID: 3, OVERDUE: 0 }}
      />,
    );
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
