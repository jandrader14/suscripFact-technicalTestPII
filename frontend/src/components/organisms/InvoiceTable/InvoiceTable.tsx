import type { Invoice } from '../../../types/invoice.types';
import { InvoiceRow } from '../../molecules/InvoiceRow';
import { Spinner } from '../../atoms/Spinner';

interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading?: boolean;
  payingId?: number | null;
  onPay?: (invoiceId: number) => void;
}

const COLUMNS = ['#', 'Monto', 'Estado', 'Vencimiento', 'Pagado el', 'Acción'];

export function InvoiceTable({ invoices, isLoading = false, payingId = null, onPay }: InvoiceTableProps) {
  return (
    <div className="bg-bg-surface rounded border border-border shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-display font-semibold text-text-primary uppercase tracking-wide">
          Historial de facturas
        </h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12" aria-label="Cargando facturas">
          <Spinner size="md" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm font-body text-text-muted">No hay facturas registradas.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-bg-muted">
                {COLUMNS.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-xs font-mono font-medium uppercase tracking-widest text-text-muted"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <InvoiceRow
                  key={invoice.id}
                  invoice={invoice}
                  onPay={onPay}
                  isPaying={payingId === invoice.id}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
