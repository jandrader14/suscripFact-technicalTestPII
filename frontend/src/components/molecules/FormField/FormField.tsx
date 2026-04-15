import { type InputHTMLAttributes, useId } from 'react';
import { Input } from '../../atoms/Input';
import { Label } from '../../atoms/Label';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export function FormField({ label, error, required = false, id, ...inputProps }: FormFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={fieldId} required={required}>
        {label}
      </Label>
      <Input id={fieldId} error={error} required={required} {...inputProps} />
    </div>
  );
}
