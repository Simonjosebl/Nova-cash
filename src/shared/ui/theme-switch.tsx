import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/shared/hooks/useTheme';

interface ThemeSwitchProps {
  className?: string;
}

/**
 * Switch de tema claro/oscuro (Cap. 3.24). Pista con el gradiente de marca en oscuro
 * y perilla con resorte que muestra sol o luna.
 */
export function ThemeSwitch({ className }: ThemeSwitchProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Modo oscuro"
      onClick={toggleTheme}
      className={cn(
        'relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border p-0.5 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        isDark
          ? 'justify-end border-transparent bg-gradient-to-r from-nova-blue to-nova-cyan'
          : 'justify-start border-border bg-secondary',
        className,
      )}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className="flex size-7 items-center justify-center rounded-full bg-card shadow-card"
      >
        <motion.span
          key={isDark ? 'moon' : 'sun'}
          initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex"
        >
          {isDark ? (
            <Moon className="size-4 fill-accent/20 text-accent" />
          ) : (
            <Sun className="size-4 text-warning" />
          )}
        </motion.span>
      </motion.span>
    </button>
  );
}
