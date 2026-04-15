import { create } from 'zustand';

import type { Subscription } from '../types/subscription.types';

interface SubscriptionState {
  subscription: Subscription | null;
  isActive: boolean;
  setSubscription: (data: Subscription | null) => void;
  clearSubscription: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  subscription: null,
  isActive: false,

  setSubscription: (data: Subscription | null) =>
    set({
      subscription: data,
      isActive: data?.status === 'ACTIVE' || false,
    }),

  clearSubscription: () =>
    set({
      subscription: null,
      isActive: false,
    }),
}));
