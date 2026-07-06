import { motion } from 'framer-motion';
import logo from '@/shared/assets/logo.png';

/** Splash de arranque mientras se resuelve la sesión (Cap. 6.2). Nunca pantalla en blanco. */
export function SplashScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <motion.img
        src={logo}
        alt="Nova Cash"
        className="size-24 rounded-lg"
        initial={{ opacity: 0.6, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
      />
    </div>
  );
}
