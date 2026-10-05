import { motion, useReducedMotion } from 'framer-motion';
import logoMark from '@/shared/assets/logo-mark.png';

/**
 * Splash de arranque mientras se resuelve la sesión (Cap. 6.2). Nunca pantalla en blanco.
 * La N de marca con halo que respira, anillo de progreso en los tonos de la N, nombre y
 * barra indeterminada. Respeta prefers-reduced-motion.
 */
export function SplashScreen() {
  const reduce = useReducedMotion();

  return (
    <div
      role="status"
      aria-label="Cargando Nova Cash"
      className="relative flex min-h-dvh flex-col items-center justify-center gap-8 overflow-hidden bg-background"
    >
      {/* Resplandor de fondo en los tonos de la N */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute left-1/2 top-1/2 size-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-nova-cyan/10 blur-3xl" />
        <span className="absolute left-1/2 top-1/2 size-64 -translate-x-1/2 -translate-y-[60%] rounded-full bg-nova-green/10 blur-3xl" />
      </div>

      <motion.div
        className="relative flex size-36 items-center justify-center"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Halo que respira */}
        <motion.span
          aria-hidden
          className="absolute inset-4 rounded-full bg-gradient-to-br from-nova-cyan/40 to-nova-green/30 blur-2xl"
          animate={reduce ? undefined : { opacity: [0.5, 1, 0.5], scale: [0.9, 1.08, 0.9] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Anillo de progreso: arco con degradado de marca que gira */}
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0%,theme(colors.nova.cyan)_55%,theme(colors.nova.green)_80%,transparent_100%)] [mask:radial-gradient(farthest-side,transparent_calc(100%-3px),#000_calc(100%-2px))]"
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
        />
        <span
          aria-hidden
          className="absolute inset-0 rounded-full border-[3px] border-nova-cyan/10"
        />

        <img src={logoMark} alt="" className="relative h-16 w-auto drop-shadow-lg" />
      </motion.div>

      <motion.div
        className="relative flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
      >
        <p className="text-h3 font-bold tracking-tight text-primary">NovaCash</p>

        {/* Barra indeterminada */}
        <div className="relative h-1 w-40 overflow-hidden rounded-full bg-secondary">
          <motion.span
            aria-hidden
            className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-nova-cyan via-nova-green to-nova-cyan"
            initial={{ left: '-35%' }}
            animate={reduce ? { left: '33%' } : { left: ['-35%', '100%'] }}
            transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <p className="text-caption font-medium text-muted-foreground">Cargando…</p>
      </motion.div>
    </div>
  );
}
