import type { Plan } from '../../../types/plan.types';
import { PlanCard } from '../../molecules/PlanCard';
import { Spinner } from '../../atoms/Spinner';

interface PlansTableProps {
  plans: Plan[];
  isLoading?: boolean;
  currentPlanId?: number | null;
  subscribingId?: number | null;
  onSubscribe?: (planId: number) => void;
  onEdit?: (plan: Plan) => void;
  showAdminActions?: boolean;
}

export function PlansTable({
  plans,
  isLoading = false,
  currentPlanId = null,
  subscribingId = null,
  onSubscribe,
  onEdit,
  showAdminActions = false,
}: PlansTableProps) {
  return (
    <section aria-label="Planes disponibles">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-display font-semibold text-text-primary uppercase tracking-wide">
          {showAdminActions ? 'Gestión de planes' : 'Planes disponibles'}
        </h2>
        <span className="text-xs font-mono text-text-muted">
          {plans.length} {plans.length === 1 ? 'plan' : 'planes'}
        </span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12" aria-label="Cargando planes">
          <Spinner size="md" />
        </div>
      ) : plans.length === 0 ? (
        <div className="py-12 text-center rounded border border-border bg-bg-surface">
          <p className="text-sm font-body text-text-muted">No hay planes disponibles.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <div key={plan.id} style={{ animationDelay: `${index * 80}ms` }}>
              <PlanCard
                plan={plan}
                isCurrentPlan={plan.id === currentPlanId}
                onSubscribe={onSubscribe}
                onEdit={onEdit}
                isSubscribing={subscribingId === plan.id}
                showAdminActions={showAdminActions}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
