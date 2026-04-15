import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { billingService } from '../../services/billingService';
import { InvoiceTable } from '../../components/organisms/InvoiceTable';
import type { Invoice } from '../../types/invoice.types';

export function InvoicesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const userId = user.id;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await billingService.getByUser(userId);
        setInvoices(data);
      } catch {
        setError('No se pudieron cargar las facturas.');
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
    } catch {
      setError('No se pudo procesar el pago. Intenta de nuevo.');
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      <header>
        <h1 className="text-2xl font-display font-semibold text-text-primary">Facturas</h1>
        <p className="text-sm font-body text-text-secondary mt-1">
          Historial completo de tus facturas
        </p>
      </header>

      {error && (
        <div role="alert" className="rounded border border-status-overdue/30 bg-status-overdue-bg px-4 py-3 text-sm font-body text-status-overdue">
          {error}
        </div>
      )}

      <InvoiceTable
        invoices={invoices}
        isLoading={isLoading}
        payingId={payingId}
        onPay={handlePay}
      />
    </div>
  );
}
