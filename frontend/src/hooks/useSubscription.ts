import { useSubscriptionStore } from '../store/subscription.store';
import { subscriptionsService } from '../services/subscriptionsService';
import { type Subscription, type SubscriptionStatusResult } from '../types/subscription.types';

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  isActive: boolean;
  loadStatus: (userId: number) => Promise<SubscriptionStatusResult>;
  clear: () => void;
}

export function useSubscription(): UseSubscriptionReturn {
  const subscription = useSubscriptionStore((state) => state.subscription);
  const isActive = useSubscriptionStore((state) => state.isActive);
  const setSubscription = useSubscriptionStore((state) => state.setSubscription);
  const clearSubscription = useSubscriptionStore((state) => state.clearSubscription);

  const loadStatus = async (userId: number): Promise<SubscriptionStatusResult> => {
    const result = await subscriptionsService.getStatus(userId);
    setSubscription(result.subscription);
    return result;
  };

  return {
    subscription,
    isActive,
    loadStatus,
    clear: clearSubscription,
  };
}
