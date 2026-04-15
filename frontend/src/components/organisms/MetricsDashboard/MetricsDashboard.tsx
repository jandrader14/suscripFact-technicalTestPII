import type { Invoice } from '../../../types/invoice.types';
import type { Subscription } from '../../../types/subscription.types';
import { StatCard } from '../../molecules/StatCard';
import { Spinner } from '../../atoms/Spinner';

interface MetricsDashboardProps {
  invoices: Invoice[];
  subscription: Subscription | null;
  isLoading?: boolean;
}

function sumAmount(invoices: Invoice[]): number {
  return invoices.reduce((acc, inv) => acc + inv.amount, 0);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function MetricsDashboard({ invoices, subscription, isLoading = false }: MetricsDashboardProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16" aria-label="Cargando métricas">
        <Spinner size="lg" />
      </div>
    );
  }

  const paid = invoices.filter((i) => i.status === 'PAID');
  const pending = invoices.filter((i) => i.status === 'PENDING');
  const overdue = invoices.filter((i) => i.status === 'OVERDUE');
  const totalCollected = sumAmount(paid);

  return (
    <section aria-label="Resumen de métricas" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        title="Total facturado"
        value={formatCurrency(totalCollected)}
        description={`${paid.length} facturas pagadas`}
        trend={paid.length > 0 ? 'up' : 'neutral'}
        trendLabel={paid.length > 0 ? `+${paid.length}` : undefined}
        className="[animation-delay:0ms]"
      />
      <StatCard
        title="Pendientes"
        value={pending.length}
        description={formatCurrency(sumAmount(pending))}
        className="[animation-delay:80ms]"
      />
      <StatCard
        title="Vencidas"
        value={overdue.length}
        description={overdue.length > 0 ? formatCurrency(sumAmount(overdue)) : 'Sin vencidas'}
        trend={overdue.length > 0 ? 'down' : 'neutral'}
        trendLabel={overdue.length > 0 ? `${overdue.length} sin pagar` : undefined}
        className="[animation-delay:160ms]"
      />
      <StatCard
        title="Suscripción"
        value={subscription?.status ?? 'Sin plan'}
        description={subscription ? `Plan activo` : 'No tienes suscripción'}
        trend={subscription?.status === 'ACTIVE' ? 'up' : 'neutral'}
        className="[animation-delay:240ms]"
      />
    </section>
  );
}
