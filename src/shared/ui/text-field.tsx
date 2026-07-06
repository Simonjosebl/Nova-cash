import * as React from 'react';
import { Input } from './input';
import { Label } from './label';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

/**
 * Campo de formulario: Label + Input + mensaje de error (Cap. 3.18 / estados).
 * Se combina con React Hook Form: <TextField label=".." error={..} {...register('x')} />
 */
export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, id, name, ...props }, ref) => {
    const fieldId = id ?? name;
    return (
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={fieldId}>{label}</Label>
        <Input id={fieldId} name={name} ref={ref} aria-invalid={!!error} {...props} />
        {error ? (
          <p role="alert" className="text-caption text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
TextField.displayName = 'TextField';
