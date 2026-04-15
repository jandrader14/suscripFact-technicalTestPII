import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { plansService } from '../../services/plansService';
import { subscriptionsService } from '../../services/subscriptionsService';
import { Button } from '../../components/atoms/Button';
import { PlansTable } from '../../components/organisms/PlansTable';
import type { CreatePlanPayload, Plan, UpdatePlanPayload } from '../../types/plan.types';

const PLAN_TYPES = ['BRONZE', 'SILVER', 'GOLD'] as const;

const EMPTY_CREATE: CreatePlanPayload = {
  name: '',
  type: 'BRONZE',
  price: 0,
  description: '',
  maxUsers: 1,
};

function getSubscriptionDates() {
  const start = new Date();
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + 1);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

export function PlansPage() {
  const { user, isAdmin } = useAuth();
  const { subscription, loadStatus } = useSubscription();
  const loadStatusRef = useRef(loadStatus);
  loadStatusRef.current = loadStatus;

  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subscribingId, setSubscribingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [editForm, setEditForm] = useState<UpdatePlanPayload>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<CreatePlanPayload>(EMPTY_CREATE);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const userId = user?.id;
    const load = async () => {
      setIsLoading(true);
      try {
        const [planData] = await Promise.all([
          plansService.getAll(),
          userId ? loadStatusRef.current(userId) : Promise.resolve(),
        ]);
        setPlans(planData);
      } catch {
        setError('No se pudieron cargar los planes.');
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubscribe = async (planId: number) => {
    if (!user) return;
    setSubscribingId(planId);
    setError(null);
    try {
      const { startDate, endDate } = getSubscriptionDates();
      await subscriptionsService.create({ userId: user.id, planId, startDate, endDate });
      await loadStatus(user.id);
    } catch {
      setError('No se pudo crear la suscripción. Es posible que ya tengas una activa.');
    } finally {
      setSubscribingId(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingPlan) return;
    try {
      const updated = await plansService.update(editingPlan.id, editForm);
      setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setEditingPlan(null);
    } catch {
      setError('No se pudo actualizar el plan.');
    }
  };

  const handleCreatePlan = async () => {
    if (!createForm.name || !createForm.description) {
      setError('Nombre y descripción son obligatorios.');
      return;
    }
    setIsCreating(true);
    setError(null);
    try {
      const newPlan = await plansService.create(createForm);
      setPlans((prev) => [...prev, newPlan]);
      setCreateForm(EMPTY_CREATE);
      setShowCreateForm(false);
    } catch {
      setError('No se pudo crear el plan.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-text-primary">Planes</h1>
          <p className="text-sm font-body text-text-secondary mt-1">
            {isAdmin ? 'Administra los planes disponibles' : 'Elige el plan que mejor se adapte a tu equipo'}
          </p>
        </div>
        {isAdmin && !showCreateForm && (
          <Button variant="primary" size="sm" onClick={() => setShowCreateForm(true)}>
            + Nuevo plan
          </Button>
        )}
      </header>

      {error && (
        <div role="alert" className="rounded border border-status-overdue/30 bg-status-overdue-bg px-4 py-3 text-sm font-body text-status-overdue">
          {error}
        </div>
      )}

      {showCreateForm && (
        <div role="dialog" aria-label="Crear nuevo plan" className="bg-bg-surface border border-border rounded shadow-card p-5 flex flex-col gap-4">
          <h2 className="text-sm font-display font-semibold text-text-primary">Nuevo plan</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-sm font-body text-text-secondary">
              Nombre
              <input
                type="text"
                value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                className="rounded border border-border px-3 py-2 text-sm text-text-primary bg-bg-surface focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                placeholder="Ej. Plan Empresarial"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-body text-text-secondary">
              Tipo
              <select
                value={createForm.type}
                onChange={(e) => setCreateForm((f) => ({ ...f, type: e.target.value as typeof PLAN_TYPES[number] }))}
                className="rounded border border-border px-3 py-2 text-sm text-text-primary bg-bg-surface focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
              >
                {PLAN_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm font-body text-text-secondary">
              Precio (COP)
              <input
                type="number"
                value={createForm.price}
                onChange={(e) => setCreateForm((f) => ({ ...f, price: Number(e.target.value) }))}
                className="rounded border border-border px-3 py-2 text-sm text-text-primary bg-bg-surface focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-body text-text-secondary">
              Máx. usuarios
              <input
                type="number"
                value={createForm.maxUsers}
                onChange={(e) => setCreateForm((f) => ({ ...f, maxUsers: Number(e.target.value) }))}
                className="rounded border border-border px-3 py-2 text-sm text-text-primary bg-bg-surface focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-body text-text-secondary sm:col-span-2">
              Descripción
              <input
                type="text"
                value={createForm.description}
                onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                className="rounded border border-border px-3 py-2 text-sm text-text-primary bg-bg-surface focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                placeholder="Mínimo 10 caracteres"
              />
            </label>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => void handleCreatePlan()}
              disabled={isCreating}
              className="h-9 px-4 text-sm font-body font-medium rounded bg-accent text-white hover:bg-accent-hover transition-colors duration-fast disabled:opacity-50"
            >
              {isCreating ? 'Guardando…' : 'Crear plan'}
            </button>
            <button
              onClick={() => { setShowCreateForm(false); setCreateForm(EMPTY_CREATE); }}
              className="h-9 px-4 text-sm font-body font-medium rounded border border-border text-text-secondary hover:bg-bg-muted transition-colors duration-fast"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {editingPlan && (
        <div role="dialog" aria-label="Editar plan" className="bg-bg-surface border border-border rounded shadow-card p-5 flex flex-col gap-4">
          <h2 className="text-sm font-display font-semibold text-text-primary">
            Editar: {editingPlan.name}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-sm font-body text-text-secondary">
              Precio
              <input
                type="number"
                defaultValue={editingPlan.price}
                onChange={(e) => setEditForm((f) => ({ ...f, price: Number(e.target.value) }))}
                className="rounded border border-border px-3 py-2 text-sm text-text-primary bg-bg-surface focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-body text-text-secondary">
              Máx. usuarios
              <input
                type="number"
                defaultValue={editingPlan.maxUsers}
                onChange={(e) => setEditForm((f) => ({ ...f, maxUsers: Number(e.target.value) }))}
                className="rounded border border-border px-3 py-2 text-sm text-text-primary bg-bg-surface focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
              />
            </label>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => void handleSaveEdit()}
              className="h-9 px-4 text-sm font-body font-medium rounded bg-accent text-white hover:bg-accent-hover transition-colors duration-fast"
            >
              Guardar
            </button>
            <button
              onClick={() => setEditingPlan(null)}
              className="h-9 px-4 text-sm font-body font-medium rounded border border-border text-text-secondary hover:bg-bg-muted transition-colors duration-fast"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <PlansTable
        plans={plans}
        isLoading={isLoading}
        currentPlanId={subscription?.planId ?? null}
        subscribingId={subscribingId}
        onSubscribe={handleSubscribe}
        onEdit={(plan) => { setEditingPlan(plan); setEditForm({}); }}
        showAdminActions={isAdmin}
      />
    </div>
  );
}
