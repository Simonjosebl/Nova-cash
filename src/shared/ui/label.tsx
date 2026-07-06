import * as React from 'react';
import { cn } from '@/lib/utils';

/** Label del Design System (Cap. 3.18): siempre arriba del input, nunca como placeholder. */
const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('text-caption font-medium text-foreground', className)}
      {...props}
    />
  ),
);
Label.displayName = 'Label';

export { Label };
