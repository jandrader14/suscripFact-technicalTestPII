import type { Plan } from '../../../types/plan.types';
import type { Subscription } from '../../../types/subscription.types';
import type { User } from '../../../types/user.types';
import { Badge } from '../../atoms/Badge';
import { Button } from '../../atoms/Button';

interface UserRowProps {
  user: User;
  subscription?: Subscription;
  plan?: Plan;
  isToggling: boolean;
  onAssign: (subscription?: Subscription, plan?: Plan) => void;
  onToggle: (subscriptionId: number) => void;
  onGenerateInvoice?: (user: User, subscription: Subscription, plan: Plan) => void;
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function UserRow({
  user,
  subscription,
  plan,
  isToggling,
  onAssign,
  onToggle,
  onGenerateInvoice,
}: UserRowProps) {
  const canToggle = subscription && subscription.status !== 'EXPIRED';
  const canGenerateInvoice = subscription?.status === 'ACTIVE' && plan && onGenerateInvoice;

  return (
    <tr className="border-b border-border hover:bg-bg-muted/40 transition-colors duration-fast">
      <td className="px-4 py-3 text-sm font-mono text-text-primary">{user.email}</td>
      <td className="px-4 py-3">
        <span
          className={[
            'inline-block px-2 py-0.5 rounded text-xs font-mono font-medium uppercase tracking-wide',
            user.role === 'ADMIN'
              ? 'bg-accent/10 text-accent'
              : 'bg-dark-surface text-text-muted',
          ].join(' ')}
        >
          {user.role === 'ADMIN' ? 'Admin' : 'Cliente'}
        </span>
      </td>
      <td className="px-4 py-3">
        {subscription ? (
          <Badge variant={subscription.status} />
        ) : (
          <span className="text-xs text-text-muted font-body">Sin suscripción</span>
        )}
      </td>
      <td className="px-4 py-3 text-sm font-body text-text-secondary">
        {plan?.name ?? (subscription ? '—' : '—')}
      </td>
      <td className="px-4 py-3 text-xs font-body text-text-muted">
        {subscription ? formatDate(subscription.startDate) : '—'}
      </td>
      <td className="px-4 py-3 text-xs font-body text-text-muted">
        {subscription ? formatDate(subscription.endDate) : '—'}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onAssign(subscription, plan)}
            aria-label={
              subscription ? `Cambiar plan de ${user.email}` : `Asignar plan a ${user.email}`
            }
          >
            {subscription ? 'Cambiar plan' : 'Asignar plan'}
          </Button>
          {canGenerateInvoice && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onGenerateInvoice(user, subscription!, plan!)}
              aria-label={`Generar factura para ${user.email}`}
            >
              Factura
            </Button>
          )}
          {canToggle && (
            <Button
              variant={subscription.status === 'ACTIVE' ? 'danger' : 'primary'}
              size="sm"
              isLoading={isToggling}
              onClick={() => onToggle(subscription.id)}
              aria-label={
                subscription.status === 'ACTIVE'
                  ? `Desactivar suscripción de ${user.email}`
                  : `Activar suscripción de ${user.email}`
              }
            >
              {subscription.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
