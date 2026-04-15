interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  className?: string;
}

const trendConfig = {
  up: { symbol: '↑', colorClass: 'text-status-paid' },
  down: { symbol: '↓', colorClass: 'text-status-overdue' },
  neutral: { symbol: '→', colorClass: 'text-text-muted' },
};

export function StatCard({
  title,
  value,
  description,
  trend,
  trendLabel,
  className = '',
}: StatCardProps) {
  return (
    <article
      className={[
        'bg-bg-surface rounded border border-border shadow-card p-5 flex flex-col gap-3',
        'animate-fade-up',
        className,
      ].join(' ')}
    >
      <p className="text-xs font-medium uppercase tracking-widest text-text-muted font-mono">
        {title}
      </p>
      <p className="text-3xl font-display font-semibold text-text-primary leading-none">
        {value}
      </p>
      {(description || trend) && (
        <div className="flex items-center gap-2 text-xs font-body text-text-secondary">
          {trend && trendLabel && (
            <span className={['font-medium', trendConfig[trend].colorClass].join(' ')}>
              {trendConfig[trend].symbol} {trendLabel}
            </span>
          )}
          {description && <span>{description}</span>}
        </div>
      )}
    </article>
  );
}
