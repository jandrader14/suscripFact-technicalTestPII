import type { Plan } from '../../../types/plan.types';
import type { Subscription } from '../../../types/subscription.types';
import type { User } from '../../../types/user.types';
import { Spinner } from '../../atoms/Spinner';
import { UserRow } from '../../molecules/UserRow';

interface UsersTableProps {
  users: User[];
  subscriptions: Subscription[];
  plans: Plan[];
  isLoading: boolean;
  togglingId: number | null;
  onAssign: (user: User, subscription?: Subscription, plan?: Plan) => void;
  onToggle: (subscriptionId: number) => void;
  onGenerateInvoice?: (user: User, subscription: Subscription, plan: Plan) => void;
}

export function UsersTable({
  users,
  subscriptions,
  plans,
  isLoading,
  togglingId,
  onAssign,
  onToggle,
  onGenerateInvoice,
}: UsersTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16" aria-label="Cargando usuarios">
        <Spinner size="lg" />
      </div>
    );
  }

  const clients = users.filter((u) => u.role === 'CLIENT');

  if (clients.length === 0) {
    return (
      <div className="bg-bg-surface rounded border border-border shadow-card p-10 text-center">
        <p className="text-sm font-body text-text-secondary">No hay clientes registrados.</p>
      </div>
    );
  }

  const subscriptionByUser = new Map(subscriptions.map((s) => [s.userId, s]));
  const planById = new Map(plans.map((p) => [p.id, p]));

  return (
    <div className="bg-bg-surface rounded border border-border shadow-card overflow-hidden">
      <table className="w-full" aria-label="Listado de clientes">
        <thead>
          <tr className="border-b border-dark-border bg-dark-surface">
            {['Email', 'Rol', 'Estado', 'Plan', 'Inicio', 'Fin', 'Acciones'].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-mono font-semibold uppercase tracking-widest text-text-muted"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {clients.map((user) => {
            const sub = subscriptionByUser.get(user.id);
            const plan = sub ? planById.get(sub.planId) : undefined;
            return (
              <UserRow
                key={user.id}
                user={user}
                subscription={sub}
                plan={plan}
                isToggling={togglingId === sub?.id}
                onAssign={(sub, pl) => onAssign(user, sub, pl)}
                onToggle={onToggle}
                onGenerateInvoice={onGenerateInvoice}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
