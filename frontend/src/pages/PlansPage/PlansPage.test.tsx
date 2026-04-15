import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { PlansPage } from './PlansPage';
import type { Plan } from '../../types/plan.types';

const { mockLoadStatus, mockGetAll, mockUpdatePlan, mockCreateSub } = vi.hoisted(() => ({
  mockLoadStatus: vi.fn(),
  mockGetAll: vi.fn(),
  mockUpdatePlan: vi.fn(),
  mockCreateSub: vi.fn(),
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

vi.mock('../../services/plansService', () => ({
  plansService: { getAll: mockGetAll, update: mockUpdatePlan },
}));

vi.mock('../../services/subscriptionsService', () => ({
  subscriptionsService: { create: mockCreateSub },
}));

const mockPlans: Plan[] = [
  { id: 1, name: 'Bronce', type: 'BRONZE', price: 50000, description: 'Básico', maxUsers: 5, isActive: true, createdAt: '2026-01-01' },
  { id: 2, name: 'Plata', type: 'SILVER', price: 100000, description: 'Estándar', maxUsers: 15, isActive: true, createdAt: '2026-01-01' },
];

function renderPage() {
  return render(<MemoryRouter><PlansPage /></MemoryRouter>);
}

describe('PlansPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAll.mockResolvedValue(mockPlans);
    mockLoadStatus.mockResolvedValue({ isActive: false, subscription: null });
  });

  it('renders plans heading', () => {
    renderPage();
    expect(screen.getByText('Planes')).toBeInTheDocument();
  });

  it('renders plan cards after load', async () => {
    renderPage();
    await waitFor(() => expect(screen.getAllByText('Bronce').length).toBeGreaterThan(0));
    expect(screen.getAllByText('Plata').length).toBeGreaterThan(0);
  });

  it('shows error when plans fail to load', async () => {
    mockGetAll.mockRejectedValue(new Error('Network'));
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar los planes'),
    );
  });

  it('calls subscriptionsService.create when subscribing', async () => {
    mockCreateSub.mockResolvedValue({ id: 99, planId: 1, userId: 1, status: 'ACTIVE', startDate: '2026-04-01', endDate: '2027-04-01' });
    renderPage();
    await waitFor(() => screen.getAllByRole('button', { name: /suscribirse/i }));
    fireEvent.click(screen.getAllByRole('button', { name: /suscribirse/i })[0]);
    await waitFor(() =>
      expect(mockCreateSub).toHaveBeenCalledWith(expect.objectContaining({ planId: 1, userId: 1 })),
    );
  });

  it('shows subscription error if create fails', async () => {
    mockCreateSub.mockRejectedValue(new Error('Already active'));
    renderPage();
    await waitFor(() => screen.getAllByRole('button', { name: /suscribirse/i }));
    fireEvent.click(screen.getAllByRole('button', { name: /suscribirse/i })[0]);
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('ya tengas una activa'),
    );
  });
});
