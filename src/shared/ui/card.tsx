import * as React from 'react';
import { cn } from '@/lib/utils';

/** Card base (Cap. 3.14 / R-16): surface, radius 24 (lg), padding 24, halo sutil de marca. */
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg bg-card p-6 text-card-foreground shadow-card-glow dark:shadow-card-glow-dark',
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

export { Card };
