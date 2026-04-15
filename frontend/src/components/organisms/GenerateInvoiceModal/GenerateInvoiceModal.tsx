import { useState } from 'react';
import type { Plan } from '../../../types/plan.types';
import type { Subscription } from '../../../types/subscription.types';
import type { User } from '../../../types/user.types';
import { Button } from '../../atoms/Button';

interface GenerateInvoiceModalProps {
  user: User;
  subscription: Subscription;
  plan: Plan;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: GenerateInvoicePayload) => void;
}

export interface GenerateInvoicePayload {
  subscriptionId: number;
  userId: number;
  planType: string;
  planPrice: number;
  maxUsers?: number;
  startDate: string;
  endDate: string;
  dueDate: string;
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

const STRATEGY_LABELS: Record<string, string> = {
  BRONZE: 'Precio base sin descuento',
  SILVER: 'Descuento 10% si período > 6 meses',
  GOLD: 'Descuento 15% (+5% si > 10 usuarios)',
};

export function GenerateInvoiceModal({
  user,
  subscription,
  plan,
  isSubmitting,
  onClose,
  onSubmit,
}: GenerateInvoiceModalProps) {
  const [startDate, setStartDate] = useState(subscription.startDate.split('T')[0]);
  const [endDate, setEndDate] = useState(subscription.endDate.split('T')[0]);
  const [dueDate, setDueDate] = useState(todayISO());
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (endDate <= startDate) {
      setValidationError('La fecha de fin debe ser posterior al inicio.');
      return;
    }
    if (!dueDate) {
      setValidationError('La fecha de vencimiento es obligatoria.');
      return;
    }
    setValidationError(null);
    onSubmit({
      subscriptionId: subscription.id,
      userId: user.id,
      planType: plan.type,
      planPrice: plan.price,
      maxUsers: plan.maxUsers,
      startDate,
      endDate,
      dueDate,
    });
  };

  const isPastDue = dueDate < todayISO();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Generar factura para ${user.email}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-bg-surface rounded border border-border shadow-card p-6 flex flex-col gap-5">
        <header className="flex flex-col gap-1">
          <h2 className="text-sm font-display font-semibold text-text-primary uppercase tracking-wide">
            Generar factura
          </h2>
          <p className="text-xs font-mono text-text-muted truncate">{user.email}</p>
        </header>

        {/* Plan info */}
        <div className="bg-dark-surface rounded border border-dark-border px-4 py-3 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-text-muted uppercase tracking-wide">Plan</span>
            <span className="text-sm font-body font-medium text-text-primary">
              {plan.name}
              <span className="ml-2 text-xs text-text-muted">({plan.type})</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-text-muted uppercase tracking-wide">Precio base</span>
            <span className="text-sm font-body text-accent">
              {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(plan.price)}
            </span>
          </div>
          <p className="text-xs font-body text-text-muted mt-0.5">
            {STRATEGY_LABELS[plan.type] ?? 'Estrategia personalizada'}
          </p>
        </div>

        {validationError && (
          <div
            role="alert"
            className="rounded border border-status-overdue/30 bg-status-overdue-bg px-3 py-2 text-xs font-body text-status-overdue"
          >
            {validationError}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs font-body text-text-secondary">
              Período inicio
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded border border-border px-3 py-2 text-sm text-text-primary bg-bg-surface focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-body text-text-secondary">
              Período fin
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded border border-border px-3 py-2 text-sm text-text-primary bg-bg-surface focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-xs font-body text-text-secondary">
            Fecha de vencimiento
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded border border-border px-3 py-2 text-sm text-text-primary bg-bg-surface focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
            />
            {isPastDue && (
              <span className="text-xs text-status-overdue font-body mt-0.5">
                ⚠ Fecha en el pasado — la factura quedará como OVERDUE al actualizar estados
              </span>
            )}
          </label>
        </div>

        <footer className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button variant="primary" isLoading={isSubmitting} onClick={handleSubmit}>
            Generar
          </Button>
        </footer>
      </div>
    </div>
  );
}
