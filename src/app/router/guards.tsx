import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { ROUTES } from '@/shared/constants/routes';
import { consumeReturnPath, saveReturnPath } from '@/shared/utils/returnPath';
import { SplashScreen } from '@/app/screens/SplashScreen';

/**
 * Protege rutas privadas: exige sesión (Cap. 9 — Zero Trust en cliente + backend).
 * Recuerda la ruta pedida (p. ej. una invitación) para volver a ella tras ingresar.
 */
export function RequireAuth() {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();
  if (isLoading) return <SplashScreen />;

  if (!isAuthenticated) {
    if (location.pathname !== ROUTES.home) saveReturnPath(location.pathname + location.search);
    return <Navigate to={ROUTES.login} replace />;
  }

  const returnPath = consumeReturnPath();
  if (returnPath && returnPath !== location.pathname) return <Navigate to={returnPath} replace />;
  return <Outlet />;
}

/** Rutas solo para invitados (login, registro): si ya hay sesión, va al inicio. */
export function RedirectIfAuth() {
  const { isLoading, isAuthenticated } = useAuth();
  if (isLoading) return <SplashScreen />;
  if (isAuthenticated) return <Navigate to={ROUTES.home} replace />;
  return <Outlet />;
}
