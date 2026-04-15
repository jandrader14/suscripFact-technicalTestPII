import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSubscription } from './useSubscription';
import { useSubscriptionStore } from '../store/subscription.store';
import { subscriptionsService } from '../services/subscriptionsService';

vi.mock('../services/subscriptionsService', () => ({
  subscriptionsService: {
    getStatus: vi.fn(),
  },
}));

const mockSubscription = {
  id: 10,
  userId: 1,
  planId: 2,
  status: 'ACTIVE' as const,
  startDate: '2026-01-01',
  endDate: '2027-01-01',
};

const mockStatusResult = {
  isActive: true,
  subscription: mockSubscription,
};

describe('useSubscription', () => {
  beforeEach(() => {
    useSubscriptionStore.setState({ subscription: null, isActive: false });
    vi.clearAllMocks();
  });

  it('returns null subscription and isActive=false by default', () => {
    const { result } = renderHook(() => useSubscription());
    expect(result.current.subscription).toBeNull();
    expect(result.current.isActive).toBe(false);
  });

  it('loadStatus calls service and updates store', async () => {
    vi.mocked(subscriptionsService.getStatus).mockResolvedValue(mockStatusResult);
    const { result } = renderHook(() => useSubscription());

    let returned: typeof mockStatusResult;
    await act(async () => {
      returned = await result.current.loadStatus(1);
    });

    expect(subscriptionsService.getStatus).toHaveBeenCalledWith(1);
    expect(result.current.subscription).toEqual(mockSubscription);
    expect(result.current.isActive).toBe(true);
    expect(returned!).toEqual(mockStatusResult);
  });

  it('loadStatus sets isActive=false for EXPIRED subscription', async () => {
    vi.mocked(subscriptionsService.getStatus).mockResolvedValue({
      isActive: false,
      subscription: { ...mockSubscription, status: 'EXPIRED' },
    });
    const { result } = renderHook(() => useSubscription());

    await act(async () => {
      await result.current.loadStatus(1);
    });

    expect(result.current.isActive).toBe(false);
  });

  it('clear resets subscription state', () => {
    useSubscriptionStore.setState({ subscription: mockSubscription, isActive: true });
    const { result } = renderHook(() => useSubscription());

    act(() => {
      result.current.clear();
    });

    expect(result.current.subscription).toBeNull();
    expect(result.current.isActive).toBe(false);
  });

  it('loadStatus propagates service errors', async () => {
    vi.mocked(subscriptionsService.getStatus).mockRejectedValue(new Error('Not found'));
    const { result } = renderHook(() => useSubscription());

    await expect(
      act(async () => {
        await result.current.loadStatus(99);
      })
    ).rejects.toThrow('Not found');
  });
});
