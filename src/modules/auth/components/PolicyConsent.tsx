import * as React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';

interface PolicyConsentProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const LINK_CLASS = 'font-semibold text-nova-blue underline-offset-2 hover:underline';

/**
 * Casilla obligatoria de autorización de tratamiento de datos (Ley 1581 / R-05).
 * Los enlaces abren en otra pestaña para no perder lo escrito en el formulario.
 */
export const PolicyConsent = React.forwardRef<HTMLInputElement, PolicyConsentProps>(
  ({ error, id = 'acceptPolicies', ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start gap-3">
        <span className="relative mt-0.5 flex size-5 shrink-0">
          <input
            id={id}
            ref={ref}
            type="checkbox"
            aria-invalid={!!error}
            className="peer size-5 cursor-pointer appearance-none rounded-xs border-2 border-input bg-card transition-colors checked:border-nova-blue checked:bg-nova-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-[invalid=true]:border-destructive"
            {...props}
          />
          <Check
            aria-hidden
            strokeWidth={3}
            className="pointer-events-none absolute inset-0 m-auto size-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100"
          />
        </span>
        <label htmlFor={id} className="cursor-pointer text-caption text-muted-foreground">
          Acepto la{' '}
          <Link to={ROUTES.privacy} target="_blank" rel="noreferrer" className={LINK_CLASS}>
            Política de Tratamiento de Datos
          </Link>{' '}
          y los{' '}
          <Link to={ROUTES.terms} target="_blank" rel="noreferrer" className={LINK_CLASS}>
            Términos y Condiciones
          </Link>
          .
        </label>
      </div>
      {error ? (
        <p role="alert" className="text-caption text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  ),
);
PolicyConsent.displayName = 'PolicyConsent';
