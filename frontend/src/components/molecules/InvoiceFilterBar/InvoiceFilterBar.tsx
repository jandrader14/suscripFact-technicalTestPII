import type { InvoiceStatus } from '../../../types/invoice.types';

export type InvoiceFilter = InvoiceStatus | 'ALL';

interface FilterOption {
  value: InvoiceFilter;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { value: 'ALL', label: 'Todas' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'PAID', label: 'Pagadas' },
  { value: 'OVERDUE', label: 'Vencidas' },
];

interface InvoiceFilterBarProps {
  activeFilter: InvoiceFilter;
  onChange: (filter: InvoiceFilter) => void;
  counts?: Partial<Record<InvoiceFilter, number>>;
}

export function InvoiceFilterBar({ activeFilter, onChange, counts }: InvoiceFilterBarProps) {
  return (
    <div
      role="tablist"
      aria-label="Filtrar facturas"
      className="flex items-center gap-1 bg-bg-surface border border-border rounded p-1 self-start"
    >
      {FILTER_OPTIONS.map(({ value, label }) => {
        const count = counts?.[value];
        const isActive = activeFilter === value;
        return (
          <button
            key={value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(value)}
            className={[
              'flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-body font-medium',
              'transition-colors duration-fast',
              isActive
                ? 'bg-accent text-white'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-muted',
            ].join(' ')}
          >
            {label}
            {count !== undefined && (
              <span
                className={[
                  'inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full text-[10px] font-mono',
                  isActive ? 'bg-white/20 text-white' : 'bg-dark-surface text-text-muted',
                ].join(' ')}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
