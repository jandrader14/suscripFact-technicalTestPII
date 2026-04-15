import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders ACTIVE subscription label', () => {
    render(<Badge variant="ACTIVE" />);
    expect(screen.getByText('Activa')).toBeInTheDocument();
  });

  it('renders PAID invoice label', () => {
    render(<Badge variant="PAID" />);
    expect(screen.getByText('Pagada')).toBeInTheDocument();
  });

  it('renders GOLD plan label', () => {
    render(<Badge variant="GOLD" />);
    expect(screen.getByText('Oro')).toBeInTheDocument();
  });

  it('renders OVERDUE with correct styles', () => {
    render(<Badge variant="OVERDUE" />);
    const badge = screen.getByText('Vencida');
    expect(badge).toHaveClass('text-status-overdue');
  });

  it('renders BRONZE with correct styles', () => {
    render(<Badge variant="BRONZE" />);
    const badge = screen.getByText('Bronce');
    expect(badge).toHaveClass('text-plan-bronze');
  });

  it('merges custom className', () => {
    render(<Badge variant="ACTIVE" className="ml-2" />);
    expect(screen.getByText('Activa')).toHaveClass('ml-2');
  });
});
