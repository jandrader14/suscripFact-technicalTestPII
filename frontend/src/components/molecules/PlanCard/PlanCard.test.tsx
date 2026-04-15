import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PlanCard } from './PlanCard';
import type { Plan } from '../../../types/plan.types';

const basePlan: Plan = {
  id: 1,
  name: 'Plan Bronce',
  type: 'BRONZE',
  price: 50000,
  description: 'Ideal para equipos pequeños.',
  maxUsers: 5,
  isActive: true,
  createdAt: '2026-01-01',
};

describe('PlanCard', () => {
  it('renders plan name and description', () => {
    render(<PlanCard plan={basePlan} />);
    expect(screen.getByText('Plan Bronce')).toBeInTheDocument();
    expect(screen.getByText('Ideal para equipos pequeños.')).toBeInTheDocument();
  });

  it('renders plan type badge', () => {
    render(<PlanCard plan={basePlan} />);
    expect(screen.getByText('Bronce')).toBeInTheDocument();
  });

  it('renders formatted price', () => {
    render(<PlanCard plan={basePlan} />);
    expect(screen.getByText(/50.000/)).toBeInTheDocument();
  });

  it('shows "Plan actual" label when isCurrentPlan=true', () => {
    render(<PlanCard plan={basePlan} isCurrentPlan />);
    expect(screen.getByText('Plan actual')).toBeInTheDocument();
  });

  it('renders Subscribe button for active plan when onSubscribe provided', () => {
    render(<PlanCard plan={basePlan} onSubscribe={vi.fn()} />);
    expect(screen.getByRole('button', { name: /suscribirse/i })).toBeInTheDocument();
  });

  it('calls onSubscribe with plan id on click', () => {
    const handleSubscribe = vi.fn();
    render(<PlanCard plan={basePlan} onSubscribe={handleSubscribe} />);
    fireEvent.click(screen.getByRole('button', { name: /suscribirse/i }));
    expect(handleSubscribe).toHaveBeenCalledWith(1);
  });

  it('does not render Subscribe button when isCurrentPlan=true', () => {
    render(<PlanCard plan={basePlan} isCurrentPlan onSubscribe={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /suscribirse/i })).not.toBeInTheDocument();
  });

  it('renders Edit button when showAdminActions=true', () => {
    render(<PlanCard plan={basePlan} showAdminActions onEdit={vi.fn()} />);
    expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument();
  });

  it('calls onEdit with the plan on click', () => {
    const handleEdit = vi.fn();
    render(<PlanCard plan={basePlan} showAdminActions onEdit={handleEdit} />);
    fireEvent.click(screen.getByRole('button', { name: /editar/i }));
    expect(handleEdit).toHaveBeenCalledWith(basePlan);
  });

  it('shows inactive label when plan is not active', () => {
    render(<PlanCard plan={{ ...basePlan, isActive: false }} />);
    expect(screen.getByText('Plan inactivo')).toBeInTheDocument();
  });
});
