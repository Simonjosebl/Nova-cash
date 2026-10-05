import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  name: string;
  src?: string | null;
  className?: string;
}

/**
 * Avatar (Cap. 3 — componentes globales). Foto del usuario (p. ej. de Google) o su inicial
 * sobre el gradiente de marca si no hay foto o no carga.
 */
export function Avatar({ name, src, className }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const initial = (name.trim() || '?').charAt(0).toUpperCase();

  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={cn('size-7 shrink-0 rounded-full object-cover', className)}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        'flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-nova-blue to-nova-cyan text-small font-bold text-white',
        className,
      )}
    >
      {initial}
    </span>
  );
}
