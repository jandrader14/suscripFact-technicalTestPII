import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { billingService } from '../../services/billingService';
import { MetricsDashboard } from '../../components/organisms/MetricsDashboard';
import { InvoiceTable } from '../../components/organisms/InvoiceTable';
import type { Invoice } from '../../types/invoice.types';

export function DashboardPage() {
  const { user } = useAuth();
  const { subscription, loadStatus } = useSubscription();
  const loadStatusRef = useRef(loadStatus);
  loadStatusRef.current = loadStatus;

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [payingId, setPayingId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    const userId = user.id;
    const load = async () => {
      setIsLoading(true);
      try {
        const [invoiceData] = await Promise.all([
          billingService.getByUser(userId),
          loadStatusRef.current(userId),
        ]);
        setInvoices(invoiceData);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePay = async (invoiceId: number) => {
    setPayingId(invoiceId);
    try {
      const updated = await billingService.pay(invoiceId);
      setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? updated : inv)));
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-6 max-w-6xl mx-auto">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-display font-semibold text-text-primary">
          Dashboard
        </h1>
        <p className="text-sm font-body text-text-secondary">
          Bienvenido, <span className="text-text-primary font-medium">{user?.email}</span>
        </p>
      </header>

      <MetricsDashboard
        invoices={invoices}
        subscription={subscription}
        isLoading={isLoading}
      />

      <InvoiceTable
        invoices={invoices}
        isLoading={isLoading}
        payingId={payingId}
        onPay={handlePay}
      />
    </div>
  );
}
