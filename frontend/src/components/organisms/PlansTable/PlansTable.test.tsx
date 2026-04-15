import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PlansTable } from './PlansTable';
import type { Plan } from '../../../types/plan.types';

const mockPlans: Plan[] = [
  { id: 1, name: 'Bronce', type: 'BRONZE', price: 50000, description: 'Básico', maxUsers: 5, isActive: true, createdAt: '2026-01-01' },
  { id: 2, name: 'Plata', type: 'SILVER', price: 100000, description: 'Estándar', maxUsers: 15, isActive: true, createdAt: '2026-01-01' },
  { id: 3, name: 'Oro', type: 'GOLD', price: 200000, description: 'Premium', maxUsers: 50, isActive: true, createdAt: '2026-01-01' },
];

describe('PlansTable', () => {
  it('renders a card per plan', () => {
    render(<PlansTable plans={mockPlans} />);
    expect(screen.getAllByRole('article')).toHaveLength(3);
  });

  it('shows empty state when plans array is empty', () => {
    render(<PlansTable plans={[]} />);
    expect(screen.getByText('No hay planes disponibles.')).toBeInTheDocument();
  });

  it('shows spinner when isLoading=true', () => {
    render(<PlansTable plans={[]} isLoading />);
    expect(screen.getByRole('status', { name: /cargando/i })).toBeInTheDocument();
  });

  it('shows "Plan actual" badge for currentPlanId', () => {
    render(<PlansTable plans={mockPlans} currentPlanId={2} />);
    expect(screen.getByText('Plan actual')).toBeInTheDocument();
  });

  it('calls onSubscribe with plan id', () => {
    const handleSubscribe = vi.fn();
    render(<PlansTable plans={mockPlans} onSubscribe={handleSubscribe} />);
    const buttons = screen.getAllByRole('button', { name: /suscribirse/i });
    fireEvent.click(buttons[0]);
    expect(handleSubscribe).toHaveBeenCalledWith(1);
  });

  it('renders Edit buttons when showAdminActions=true', () => {
    render(<PlansTable plans={mockPlans} showAdminActions onEdit={vi.fn()} />);
    expect(screen.getAllByRole('button', { name: /editar/i })).toHaveLength(3);
  });

  it('calls onEdit with correct plan', () => {
    const handleEdit = vi.fn();
    render(<PlansTable plans={mockPlans} showAdminActions onEdit={handleEdit} />);
    fireEvent.click(screen.getAllByRole('button', { name: /editar/i })[1]);
    expect(handleEdit).toHaveBeenCalledWith(mockPlans[1]);
  });

  it('shows admin heading when showAdminActions=true', () => {
    render(<PlansTable plans={mockPlans} showAdminActions />);
    expect(screen.getByText('Gestión de planes')).toBeInTheDocument();
  });

  it('shows plan count', () => {
    render(<PlansTable plans={mockPlans} />);
    expect(screen.getByText('3 planes')).toBeInTheDocument();
  });
});
