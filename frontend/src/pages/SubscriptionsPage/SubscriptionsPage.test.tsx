import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { SubscriptionsPage } from './SubscriptionsPage';
import type { Subscription } from '../../types/subscription.types';

const { mockLoadStatus, mockGenerate, mockSubscriptionRef } = vi.hoisted(() => ({
  mockLoadStatus: vi.fn(),
  mockGenerate: vi.fn(),
  mockSubscriptionRef: { current: null as Subscription | null, isActive: false },
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
    subscription: mockSubscriptionRef.current,
    isActive: mockSubscriptionRef.isActive,
    loadStatus: mockLoadStatus,
    clear: vi.fn(),
  }),
}));

vi.mock('../../services/billingService', () => ({
  billingService: { generate: mockGenerate },
}));

const mockActiveSubscription: Subscription = {
  id: 5, userId: 1, planId: 2, status: 'ACTIVE', startDate: '2026-01-01', endDate: '2027-01-01',
};

function renderPage() {
  return render(<MemoryRouter><SubscriptionsPage /></MemoryRouter>);
}

describe('SubscriptionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSubscriptionRef.current = null;
    mockSubscriptionRef.isActive = false;
    mockLoadStatus.mockResolvedValue({ isActive: false, subscription: null });
  });

  it('renders page heading', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Mi Suscripción')).toBeInTheDocument());
  });

  it('shows empty state when no subscription', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('No tienes una suscripción activa.')).toBeInTheDocument(),
    );
  });

  it('shows link to plans when no subscription', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole('link', { name: /ver planes/i })).toBeInTheDocument(),
    );
  });

  it('shows subscription details when active', async () => {
    mockSubscriptionRef.current = mockActiveSubscription;
    mockSubscriptionRef.isActive = true;
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('Detalle de suscripción')).toBeInTheDocument(),
    );
  });

  it('shows ACTIVE badge when subscription is active', async () => {
    mockSubscriptionRef.current = mockActiveSubscription;
    mockSubscriptionRef.isActive = true;
    renderPage();
    await waitFor(() => expect(screen.getByText('Activa')).toBeInTheDocument());
  });

  it('shows Generar factura button when subscription is active', async () => {
    mockSubscriptionRef.current = mockActiveSubscription;
    mockSubscriptionRef.isActive = true;
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /generar factura/i })).toBeInTheDocument(),
    );
  });

  it('calls billingService.generate and shows success message', async () => {
    mockSubscriptionRef.current = mockActiveSubscription;
    mockSubscriptionRef.isActive = true;
    mockGenerate.mockResolvedValue({});
    renderPage();
    await waitFor(() => screen.getByRole('button', { name: /generar factura/i }));
    fireEvent.click(screen.getByRole('button', { name: /generar factura/i }));
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Factura generada correctamente'),
    );
  });
});
