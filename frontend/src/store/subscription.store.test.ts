import { describe, it, expect, beforeEach } from 'vitest';
import { useSubscriptionStore } from './subscription.store';
import type { Subscription } from '../types/subscription.types';

const mockSubscription: Subscription = {
  id: 10,
  userId: 1,
  planId: 2,
  status: 'ACTIVE',
  startDate: '2026-01-01',
  endDate: '2027-01-01',
};

describe('subscription.store', () => {
  beforeEach(() => {
    useSubscriptionStore.setState({ subscription: null, isActive: false });
  });

  it('starts with null subscription and isActive=false', () => {
    const state = useSubscriptionStore.getState();
    expect(state.subscription).toBeNull();
    expect(state.isActive).toBe(false);
  });

  it('sets subscription and marks isActive=true when status is ACTIVE', () => {
    useSubscriptionStore.getState().setSubscription(mockSubscription);
    const state = useSubscriptionStore.getState();
    expect(state.subscription).toEqual(mockSubscription);
    expect(state.isActive).toBe(true);
  });

  it('marks isActive=false when status is EXPIRED', () => {
    useSubscriptionStore.getState().setSubscription({
      ...mockSubscription,
      status: 'EXPIRED',
    });
    expect(useSubscriptionStore.getState().isActive).toBe(false);
  });

  it('marks isActive=false when subscription is null', () => {
    useSubscriptionStore.getState().setSubscription(null);
    expect(useSubscriptionStore.getState().isActive).toBe(false);
  });

  it('clears subscription on clearSubscription', () => {
    useSubscriptionStore.getState().setSubscription(mockSubscription);
    useSubscriptionStore.getState().clearSubscription();
    const state = useSubscriptionStore.getState();
    expect(state.subscription).toBeNull();
    expect(state.isActive).toBe(false);
  });
});
