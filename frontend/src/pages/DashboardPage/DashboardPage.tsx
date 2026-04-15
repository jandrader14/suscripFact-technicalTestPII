import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { billingService } from '../../services/billingService';
import { subscriptionsService } from '../../services/subscriptionsService';
import { AdminMetricsPanel } from '../../components/organisms/AdminMetricsPanel';
import { InvoiceTable } from '../../components/organisms/InvoiceTable';
import { MetricsDashboard } from '../../components/organisms/MetricsDashboard';
import { InvoiceFilterBar } from '../../components/molecules/InvoiceFilterBar';
import { Button } from '../../components/atoms/Button';
import type { InvoiceFilter } from '../../components/molecules/InvoiceFilterBar';
import type { Invoice } from '../../types/invoice.types';
import type { SubscriptionMetrics } from '../../types/subscription.types';

export function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const { subscription, loadStatus } = useSubscription();
  const loadStatusRef = useRef(loadStatus);
  loadStatusRef.current = loadStatus;

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<InvoiceFilter>('ALL');
  const [isUpdatingOverdue, setIsUpdatingOverdue] = useState(false);

  // Admin-only state
  const [adminMetrics, setAdminMetrics] = useState<SubscriptionMetrics>({
    active: 0, expired: 0, cancelled: 0, total: 0,
  });

  useEffect(() => {
    if (!user) return;
    const userId = user.id;
    const load = async () => {
      setIsLoading(true);
      try {
        if (isAdmin) {
          // Actualizar estados OVERDUE antes de cargar para ver datos frescos
          await billingService.updateOverdue().catch(() => null);
          const [invoiceData, metrics] = await Promise.all([
            billingService.getAll(),
            subscriptionsService.getMetrics(),
          ]);
          setInvoices(invoiceData);
          setAdminMetrics(metrics);
        } else {
          const [invoiceData] = await Promise.all([
            billingService.getByUser(userId),
            loadStatusRef.current(userId),
          ]);
          setInvoices(invoiceData);
        }
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateOverdue = async () => {
    setIsUpdatingOverdue(true);
    try {
      await billingService.updateOverdue();
      const [invoiceData, metrics] = await Promise.all([
        billingService.getAll(),
        subscriptionsService.getMetrics(),
      ]);
      setInvoices(invoiceData);
      setAdminMetrics(metrics);
    } finally {
      setIsUpdatingOverdue(false);
    }
  };

  const handlePay = async (invoiceId: number) => {
    setPayingId(invoiceId);
    try {
      const updated = await billingService.pay(invoiceId);
      setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? updated : inv)));
    } finally {
      setPayingId(null);
    }
  };

  const filteredInvoices =
    filter === 'ALL' ? invoices : invoices.filter((inv) => inv.status === filter);

  const counts: Partial<Record<InvoiceFilter, number>> = {
    ALL: invoices.length,
    PENDING: invoices.filter((i) => i.status === 'PENDING').length,
    PAID: invoices.filter((i) => i.status === 'PAID').length,
    OVERDUE: invoices.filter((i) => i.status === 'OVERDUE').length,
  };

  return (
    <div className="flex flex-col gap-8 p-6 max-w-6xl mx-auto">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-display font-semibold text-text-primary">Dashboard</h1>
          <p className="text-sm font-body text-text-secondary">
            Bienvenido, <span className="text-text-primary font-medium">{user?.email}</span>
          </p>
        </div>
        {isAdmin && (
          <Button
            variant="secondary"
            size="sm"
            isLoading={isUpdatingOverdue}
            onClick={() => void handleUpdateOverdue()}
            title="Marca como OVERDUE las facturas pendientes cuya fecha de vencimiento ya pasó"
          >
            Actualizar vencidas
          </Button>
        )}
      </header>

      {isAdmin ? (
        <AdminMetricsPanel
          metrics={adminMetrics}
          totalInvoices={invoices.length}
          isLoading={isLoading}
        />
      ) : (
        <MetricsDashboard
          invoices={invoices}
          subscription={subscription}
          isLoading={isLoading}
        />
      )}

      <div className="flex flex-col gap-3">
        <InvoiceFilterBar activeFilter={filter} onChange={setFilter} counts={counts} />
        <InvoiceTable
          invoices={filteredInvoices}
          isLoading={isLoading}
          payingId={payingId}
          onPay={handlePay}
        />
      </div>
    </div>
  );
}
