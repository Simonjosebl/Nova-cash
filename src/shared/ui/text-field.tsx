import * as React from 'react';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from './input';
import { Label } from './label';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  /** Icono opcional al inicio del campo. */
  icon?: LucideIcon;
}

/**
 * Campo de formulario: Label + Input + mensaje de error (Cap. 3.18 / estados).
 * Se combina con React Hook Form: <TextField label=".." error={..} {...register('x')} />
 * Los campos de contraseña incluyen el botón para mostrar/ocultar.
 */
export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, id, name, icon: Icon, type, className, ...props }, ref) => {
    const fieldId = id ?? name;
    const isPassword = type === 'password';
    const [visible, setVisible] = React.useState(false);

    return (
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={fieldId}>{label}</Label>
        <div className="relative">
          {Icon ? (
            <Icon
              aria-hidden
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            />
          ) : null}
          <Input
            id={fieldId}
            name={name}
            ref={ref}
            type={isPassword && visible ? 'text' : type}
            aria-invalid={!!error}
            className={cn(Icon && 'pl-12', isPassword && 'pr-12', className)}
            {...props}
          />
          {isPassword ? (
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          ) : null}
        </div>
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
