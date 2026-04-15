import type { Plan } from '../../../types/plan.types';
import { Badge } from '../../atoms/Badge';
import { Button } from '../../atoms/Button';

interface PlanCardProps {
  plan: Plan;
  isCurrentPlan?: boolean;
  onSubscribe?: (planId: number) => void;
  onEdit?: (plan: Plan) => void;
  isSubscribing?: boolean;
  showAdminActions?: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PlanCard({
  plan,
  isCurrentPlan = false,
  onSubscribe,
  onEdit,
  isSubscribing = false,
  showAdminActions = false,
}: PlanCardProps) {
  return (
    <article
      className={[
        'bg-bg-surface rounded border shadow-card p-6 flex flex-col gap-4 animate-fade-up',
        isCurrentPlan ? 'border-accent ring-1 ring-accent/30' : 'border-border',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-display font-semibold text-text-primary">{plan.name}</h3>
          <Badge variant={plan.type} />
        </div>
        {isCurrentPlan && (
          <span className="text-xs font-mono font-medium text-accent border border-accent/40 rounded px-2 py-0.5">
            Plan actual
          </span>
        )}
      </div>

      <p className="text-sm font-body text-text-secondary leading-relaxed">{plan.description}</p>

      <div className="flex flex-col gap-1 text-xs font-mono text-text-muted">
        <span>Usuarios: hasta {plan.maxUsers}</span>
        {!plan.isActive && (
          <span className="text-status-overdue font-medium">Plan inactivo</span>
        )}
      </div>

      <p className="text-2xl font-display font-bold text-text-primary">
        {formatCurrency(plan.price)}
        <span className="text-sm font-body font-normal text-text-muted"> / mes</span>
      </p>

      <div className="flex gap-2 mt-auto pt-2">
        {!showAdminActions && onSubscribe && !isCurrentPlan && plan.isActive && (
          <Button
            variant="primary"
            size="sm"
            isLoading={isSubscribing}
            onClick={() => onSubscribe(plan.id)}
            className="flex-1"
          >
            Suscribirse
          </Button>
        )}
        {showAdminActions && onEdit && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(plan)}
            className="flex-1"
          >
            Editar
          </Button>
        )}
      </div>
    </article>
  );
}
