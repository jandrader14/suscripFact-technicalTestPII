import { useState } from 'react';
import type { Plan } from '../../../types/plan.types';
import type { Subscription } from '../../../types/subscription.types';
import type { User } from '../../../types/user.types';
import { Button } from '../../atoms/Button';

interface AssignSubscriptionModalProps {
  user: User;
  plans: Plan[];
  currentSubscription?: Subscription;
  currentPlan?: Plan;
  isSubmitting: boolean;
  isRemoving?: boolean;
  onClose: () => void;
  onSubmit: (planId: number, startDate: string, endDate: string) => void;
  onRemove?: () => void;
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function oneYearFromNowISO(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
}

export function AssignSubscriptionModal({
  user,
  plans,
  currentSubscription,
  currentPlan,
  isSubmitting,
  isRemoving = false,
  onClose,
  onSubmit,
  onRemove,
}: AssignSubscriptionModalProps) {
  const isChanging = Boolean(currentSubscription);
  const activePlans = plans.filter((p) => p.isActive);

  const defaultPlanId = currentPlan?.id ?? activePlans[0]?.id ?? 0;
  const defaultStart = currentSubscription?.startDate ?? todayISO();
  const defaultEnd = currentSubscription?.endDate ?? oneYearFromNowISO();

  const [planId, setPlanId] = useState<number>(defaultPlanId);
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const handleSubmit = () => {
    if (!planId) {
      setValidationError('Selecciona un plan.');
      return;
    }
    if (!startDate || !endDate) {
      setValidationError('Las fechas son obligatorias.');
      return;
    }
    if (endDate <= startDate) {
      setValidationError('La fecha de fin debe ser posterior al inicio.');
      return;
    }
    setValidationError(null);
    onSubmit(planId, startDate, endDate);
  };

  const title = isChanging ? 'Cambiar plan' : 'Asignar plan';
  const submitLabel = isChanging ? 'Cambiar' : 'Asignar';
  const ariaLabel = `${title} a ${user.email}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-bg-surface rounded border border-border shadow-card p-6 flex flex-col gap-5">
        <header className="flex flex-col gap-0.5">
          <h2 className="text-sm font-display font-semibold text-text-primary uppercase tracking-wide">
            {title}
          </h2>
          <p className="text-xs font-mono text-text-muted truncate">{user.email}</p>
        </header>

        {isChanging && currentPlan && (
          <div className="rounded border border-border bg-dark-surface px-3 py-2 flex items-center justify-between gap-2">
            <span className="text-xs font-body text-text-secondary">
              Plan actual:{' '}
              <span className="font-medium text-text-primary">{currentPlan.name}</span>
            </span>
            {onRemove && (
              showRemoveConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-body text-status-overdue">¿Confirmar?</span>
                  <Button
                    variant="danger"
                    size="sm"
                    isLoading={isRemoving}
                    onClick={onRemove}
                  >
                    Sí, quitar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isRemoving}
                    onClick={() => setShowRemoveConfirm(false)}
                  >
                    No
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRemoveConfirm(true)}
                  aria-label={`Quitar suscripción de ${user.email}`}
                >
                  Quitar plan
                </Button>
              )
            )}
          </div>
        )}

        {validationError && (
          <div
            role="alert"
            className="rounded border border-status-overdue/30 bg-status-overdue-bg px-3 py-2 text-xs font-body text-status-overdue"
          >
            {validationError}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-xs font-body text-text-secondary">
            {isChanging ? 'Nuevo plan' : 'Plan'}
            <select
              value={planId}
              onChange={(e) => setPlanId(Number(e.target.value))}
              className="rounded border border-border px-3 py-2 text-sm text-text-primary bg-bg-surface focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
            >
              {activePlans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} —{' '}
                  {new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    maximumFractionDigits: 0,
                  }).format(p.price)}{' '}
                  / año
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs font-body text-text-secondary">
              Fecha de inicio
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded border border-border px-3 py-2 text-sm text-text-primary bg-bg-surface focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-body text-text-secondary">
              Fecha de fin
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded border border-border px-3 py-2 text-sm text-text-primary bg-bg-surface focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
              />
            </label>
          </div>
        </div>

        <footer className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting || isRemoving}>
            Cancelar
          </Button>
          <Button variant="primary" isLoading={isSubmitting} onClick={handleSubmit}>
            {submitLabel}
          </Button>
        </footer>
      </div>
    </div>
  );
}
