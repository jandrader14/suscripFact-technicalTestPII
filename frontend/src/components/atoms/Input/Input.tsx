import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { error, className = '', id, ...props },
  ref,
) {
  const errorId = error && id ? `${id}-error` : undefined;

  return (
    <div className="flex flex-col gap-1">
      <input
        ref={ref}
        id={id}
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        className={[
          'block w-full rounded border bg-bg-surface px-3 py-2 text-sm font-body text-text-primary',
          'placeholder:text-text-muted',
          'transition-colors duration-fast ease-out-expo',
          'focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-bg-muted',
          error
            ? 'border-status-overdue focus:ring-red-200 focus:border-status-overdue'
            : 'border-border hover:border-border-strong',
          className,
        ].join(' ')}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-xs text-status-overdue font-body">
          {error}
        </p>
      )}
    </div>
  );
});
