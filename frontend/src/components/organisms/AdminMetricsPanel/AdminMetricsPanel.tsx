import type { SubscriptionMetrics } from '../../../types/subscription.types';
import { Spinner } from '../../atoms/Spinner';
import { StatCard } from '../../molecules/StatCard';

interface AdminMetricsPanelProps {
  metrics: SubscriptionMetrics;
  totalInvoices: number;
  isLoading?: boolean;
}

export function AdminMetricsPanel({
  metrics,
  totalInvoices,
  isLoading = false,
}: AdminMetricsPanelProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16" aria-label="Cargando métricas">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <section aria-label="Métricas de administración" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        title="Activas"
        value={metrics.active}
        description={`de ${metrics.total} suscripciones`}
        trend={metrics.active > 0 ? 'up' : 'neutral'}
        trendLabel={metrics.active > 0 ? `${metrics.active} activas` : undefined}
        className="[animation-delay:0ms]"
      />
      <StatCard
        title="Vencidas"
        value={metrics.expired}
        trend={metrics.expired > 0 ? 'down' : 'neutral'}
        trendLabel={metrics.expired > 0 ? `${metrics.expired} sin renovar` : undefined}
        className="[animation-delay:80ms]"
      />
      <StatCard
        title="Canceladas"
        value={metrics.cancelled}
        trend="neutral"
        className="[animation-delay:160ms]"
      />
      <StatCard
        title="Total facturas"
        value={totalInvoices}
        description="En el sistema"
        className="[animation-delay:240ms]"
      />
    </section>
  );
}
