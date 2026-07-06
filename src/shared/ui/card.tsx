import * as React from 'react';
import { cn } from '@/lib/utils';

/** Card base (Cap. 3.14): surface, radius 24 (lg), padding 24, sombra sutil. */
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-lg bg-card p-6 text-card-foreground shadow-card', className)}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

export { Card };
