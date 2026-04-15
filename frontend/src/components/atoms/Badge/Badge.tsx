import type { SubscriptionStatus } from '../../../types/subscription.types';
import type { InvoiceStatus } from '../../../types/invoice.types';
import type { PlanType } from '../../../types/plan.types';

type BadgeVariant = SubscriptionStatus | InvoiceStatus | PlanType;

interface BadgeProps {
  variant: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  // Subscription statuses
  ACTIVE: 'bg-status-active-bg text-status-active',
  EXPIRED: 'bg-status-overdue-bg text-status-expired',
  CANCELLED: 'bg-bg-muted text-status-cancelled',
  // Invoice statuses
  PAID: 'bg-status-paid-bg text-status-paid',
  PENDING: 'bg-status-pending-bg text-status-pending',
  OVERDUE: 'bg-status-overdue-bg text-status-overdue',
  // Plan types
  BRONZE: 'bg-plan-bronze-bg text-plan-bronze',
  SILVER: 'bg-plan-silver-bg text-plan-silver',
  GOLD: 'bg-plan-gold-bg text-plan-gold',
};

const variantLabels: Record<BadgeVariant, string> = {
  ACTIVE: 'Activa',
  EXPIRED: 'Expirada',
  CANCELLED: 'Cancelada',
  PAID: 'Pagada',
  PENDING: 'Pendiente',
  OVERDUE: 'Vencida',
  BRONZE: 'Bronce',
  SILVER: 'Plata',
  GOLD: 'Oro',
};

export function Badge({ variant, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium font-mono tracking-wide',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {variantLabels[variant]}
    </span>
  );
}
