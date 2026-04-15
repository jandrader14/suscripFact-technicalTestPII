import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatCard } from './StatCard';

describe('StatCard', () => {
  it('renders title and value', () => {
    render(<StatCard title="Total Facturas" value={42} />);
    expect(screen.getByText('Total Facturas')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<StatCard title="Ingresos" value="$1.200" description="Último mes" />);
    expect(screen.getByText('Último mes')).toBeInTheDocument();
  });

  it('renders trend up with label', () => {
    render(<StatCard title="Clientes" value={10} trend="up" trendLabel="+3 este mes" />);
    expect(screen.getByText(/\+3 este mes/i)).toBeInTheDocument();
  });

  it('renders trend down with correct color class', () => {
    render(<StatCard title="Pagos" value={5} trend="down" trendLabel="-2 esta semana" />);
    const trendEl = screen.getByText(/-2 esta semana/i);
    expect(trendEl).toHaveClass('text-status-overdue');
  });

  it('does not render trend section when trend is undefined', () => {
    render(<StatCard title="Planes" value={3} />);
    expect(screen.queryByText('↑')).not.toBeInTheDocument();
    expect(screen.queryByText('↓')).not.toBeInTheDocument();
  });

  it('renders article element for semantic structure', () => {
    render(<StatCard title="Test" value={0} />);
    expect(screen.getByRole('article')).toBeInTheDocument();
  });
});
