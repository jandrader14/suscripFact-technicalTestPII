import { useEffect, useState } from 'react';
import { billingService } from '../../services/billingService';
import { plansService } from '../../services/plansService';
import { subscriptionsService } from '../../services/subscriptionsService';
import { usersService } from '../../services/usersService';
import { AssignSubscriptionModal } from '../../components/organisms/AssignSubscriptionModal';
import { GenerateInvoiceModal } from '../../components/organisms/GenerateInvoiceModal';
import type { GenerateInvoicePayload } from '../../components/organisms/GenerateInvoiceModal';
import { UsersTable } from '../../components/organisms/UsersTable';
import type { Plan } from '../../types/plan.types';
import type { Subscription } from '../../types/subscription.types';
import type { User } from '../../types/user.types';

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [assignTarget, setAssignTarget] = useState<{
    user: User;
    subscription?: Subscription;
    plan?: Plan;
  } | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [invoiceTarget, setInvoiceTarget] = useState<{
    user: User;
    subscription: Subscription;
    plan: Plan;
  } | null>(null);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [userData, subData, planData] = await Promise.all([
          usersService.getAll(),
          subscriptionsService.getAll(),
          plansService.getAll(),
        ]);
        setUsers(userData);
        setSubscriptions(subData);
        setPlans(planData);
      } catch {
        setError('No se pudo cargar la información de usuarios.');
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const handleToggle = async (subscriptionId: number) => {
    setTogglingId(subscriptionId);
    setError(null);
    try {
      const updated = await subscriptionsService.toggle(subscriptionId);
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s)),
      );
    } catch {
      setError('No se pudo actualizar el estado de la suscripción.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleGenerateInvoice = async (payload: GenerateInvoicePayload) => {
    setIsGeneratingInvoice(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await billingService.generate(payload);
      setSuccessMsg('Factura generada. Ve al Dashboard para verla.');
      setInvoiceTarget(null);
    } catch {
      setError('No se pudo generar la factura.');
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const handleAssignSubmit = async (planId: number, startDate: string, endDate: string) => {
    if (!assignTarget) return;
    setIsAssigning(true);
    setError(null);
    try {
      // Cancel the existing ACTIVE subscription before creating the new one
      const existing = assignTarget.subscription;
      if (existing?.status === 'ACTIVE') {
        const toggled = await subscriptionsService.toggle(existing.id);
        setSubscriptions((prev) => prev.map((s) => (s.id === toggled.id ? toggled : s)));
      }
      const newSub = await subscriptionsService.create({
        userId: assignTarget.user.id,
        planId,
        startDate,
        endDate,
      });
      setSubscriptions((prev) => {
        const without = prev.filter((s) => s.userId !== assignTarget.user.id);
        return [...without, newSub];
      });
      setAssignTarget(null);
    } catch {
      setError('No se pudo asignar el plan.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveSubscription = async () => {
    const existing = assignTarget?.subscription;
    if (!existing || existing.status !== 'ACTIVE') {
      setAssignTarget(null);
      return;
    }
    setIsRemoving(true);
    setError(null);
    try {
      const toggled = await subscriptionsService.toggle(existing.id);
      setSubscriptions((prev) => prev.map((s) => (s.id === toggled.id ? toggled : s)));
      setAssignTarget(null);
    } catch {
      setError('No se pudo quitar la suscripción.');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      <header>
        <h1 className="text-2xl font-display font-semibold text-text-primary">Clientes</h1>
        <p className="text-sm font-body text-text-secondary mt-1">
          Gestiona los clientes registrados y sus suscripciones
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded border border-status-overdue/30 bg-status-overdue-bg px-4 py-3 text-sm font-body text-status-overdue"
        >
          {error}
        </div>
      )}

      {successMsg && (
        <div
          role="status"
          className="rounded border border-status-paid/30 bg-status-paid-bg px-4 py-3 text-sm font-body text-status-paid"
        >
          {successMsg}
        </div>
      )}

      <UsersTable
        users={users}
        subscriptions={subscriptions}
        plans={plans}
        isLoading={isLoading}
        togglingId={togglingId}
        onAssign={setAssignTarget}
        onToggle={(id) => void handleToggle(id)}
        onGenerateInvoice={(u, sub, plan) => setInvoiceTarget({ user: u, subscription: sub, plan })}
      />

      {assignTarget && (
        <AssignSubscriptionModal
          user={assignTarget}
          plans={plans}
          isSubmitting={isAssigning}
          onClose={() => setAssignTarget(null)}
          onSubmit={(planId, startDate, endDate) =>
            void handleAssignSubmit(planId, startDate, endDate)
          }
        />
      )}

      {invoiceTarget && (
        <GenerateInvoiceModal
          user={invoiceTarget.user}
          subscription={invoiceTarget.subscription}
          plan={invoiceTarget.plan}
          isSubmitting={isGeneratingInvoice}
          onClose={() => setInvoiceTarget(null)}
          onSubmit={(payload) => void handleGenerateInvoice(payload)}
        />
      )}
    </div>
  );
}
