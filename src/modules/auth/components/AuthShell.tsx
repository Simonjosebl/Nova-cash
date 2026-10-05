import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import logo from '@/shared/assets/logo.png';
import { ThemeSwitch } from '@/shared/ui/theme-switch';

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Formas decorativas del hero: píldoras diagonales y líneas finas (R-04). */
function HeroDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <span className="absolute -left-10 top-10 h-16 w-48 -rotate-[35deg] rounded-full bg-white/10" />
      <span className="absolute -right-12 top-24 h-20 w-56 -rotate-[35deg] rounded-full bg-nova-cyan/20" />
      <span className="absolute bottom-12 left-1/3 h-12 w-40 -rotate-[35deg] rounded-full bg-white/5" />
      <span className="absolute left-8 top-0 h-48 w-px rotate-[35deg] bg-white/20" />
      <span className="absolute right-16 top-6 h-40 w-px rotate-[35deg] bg-white/15" />
      <span className="absolute bottom-0 left-1/2 h-32 w-px rotate-[35deg] bg-white/15" />
    </div>
  );
}

/**
 * Layout de autenticación (Cap. 6.4 / R-04): hero con gradiente de marca + hoja
 * redondeada con el formulario. En pantallas anchas se muestra como tarjeta centrada.
 */
export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="flex min-h-dvh justify-center bg-background sm:items-center sm:py-8">
      <main className="relative flex min-h-dvh w-full max-w-md flex-col overflow-hidden bg-surface-tint sm:min-h-0 sm:rounded-xl sm:shadow-modal">
        <section className="relative flex h-64 shrink-0 flex-col items-center justify-center gap-3 bg-gradient-to-br from-nova-navy via-nova-blue to-nova-cyan pb-10">
          <HeroDecor />
          <ThemeSwitch className="absolute right-6 top-6" />
          <motion.img
            src={logo}
            alt="Nova Cash"
            className="relative size-20 rounded-lg shadow-modal"
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          <p className="relative text-title font-bold tracking-tight text-white">NovaCash</p>
        </section>

        <motion.section
          className="relative -mt-10 flex flex-1 flex-col gap-8 rounded-t-xl bg-surface-tint px-6 pb-8 pt-12 sm:px-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: 0.1 }}
        >
          <header className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-h2 font-bold tracking-tight text-primary">{title}</h1>
            {subtitle ? <p className="text-body text-muted-foreground">{subtitle}</p> : null}
          </header>

          <div className="flex flex-col gap-5">{children}</div>

          {footer ? (
            <div className="mt-auto pt-2 text-center text-caption text-muted-foreground">
              {footer}
            </div>
          ) : null}
        </motion.section>
      </main>
    </div>
  );
}
