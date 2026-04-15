import type { Invoice } from '../../../types/invoice.types';
import { Badge } from '../../atoms/Badge';
import { Button } from '../../atoms/Button';

interface InvoiceRowProps {
  invoice: Invoice;
  onPay?: (invoiceId: number) => void;
  isPaying?: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateStr));
}

export function InvoiceRow({ invoice, onPay, isPaying = false }: InvoiceRowProps) {
  const canPay = invoice.status === 'PENDING' || invoice.status === 'OVERDUE';

  return (
    <tr className="border-b border-border last:border-0 hover:bg-bg-muted transition-colors duration-fast">
      <td className="px-4 py-3 text-sm font-mono text-text-secondary">
        #{invoice.id}
      </td>
      <td className="px-4 py-3 text-sm font-body font-medium text-text-primary">
        {formatCurrency(invoice.amount)}
      </td>
      <td className="px-4 py-3">
        <Badge variant={invoice.status} />
      </td>
      <td className="px-4 py-3 text-sm font-body text-text-secondary">
        {formatDate(invoice.dueDate)}
      </td>
      <td className="px-4 py-3 text-sm font-body text-text-muted">
        {invoice.paidAt ? formatDate(invoice.paidAt) : '—'}
      </td>
      <td className="px-4 py-3 text-right">
        {canPay && onPay && (
          <Button
            size="sm"
            variant="primary"
            isLoading={isPaying}
            onClick={() => onPay(invoice.id)}
          >
            Pagar
          </Button>
        )}
      </td>
    </tr>
  );
}
