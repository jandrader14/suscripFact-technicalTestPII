import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AdminMetricsPanel } from './AdminMetricsPanel';
import type { SubscriptionMetrics } from '../../../types/subscription.types';

const metrics: SubscriptionMetrics = {
  active: 12,
  expired: 3,
  cancelled: 1,
  total: 16,
};

describe('AdminMetricsPanel', () => {
  it('shows spinner while loading', () => {
    render(<AdminMetricsPanel metrics={metrics} totalInvoices={0} isLoading />);
    expect(screen.getByLabelText('Cargando métricas')).toBeInTheDocument();
  });

  it('renders all four metric cards', () => {
    render(<AdminMetricsPanel metrics={metrics} totalInvoices={45} />);
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
  });

  it('renders card titles', () => {
    render(<AdminMetricsPanel metrics={metrics} totalInvoices={0} />);
    expect(screen.getByText(/activas/i)).toBeInTheDocument();
    expect(screen.getByText(/vencidas/i)).toBeInTheDocument();
    expect(screen.getByText(/canceladas/i)).toBeInTheDocument();
    expect(screen.getByText(/total facturas/i)).toBeInTheDocument();
  });
});
