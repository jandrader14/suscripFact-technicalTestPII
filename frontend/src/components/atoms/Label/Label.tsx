import { LabelHTMLAttributes } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ children, required = false, className = '', ...props }: LabelProps) {
  return (
    <label
      className={['block text-sm font-medium text-text-secondary font-body', className].join(' ')}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-1 text-status-overdue" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}
