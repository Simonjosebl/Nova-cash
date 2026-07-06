import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { ROUTES } from '@/shared/constants/routes';
import { SplashScreen } from '@/app/screens/SplashScreen';

/** Protege rutas privadas: exige sesión (Cap. 9 — Zero Trust en cliente + backend). */
export function RequireAuth() {
  const { isLoading, isAuthenticated } = useAuth();
  if (isLoading) return <SplashScreen />;
  if (!isAuthenticated) return <Navigate to={ROUTES.login} replace />;
  return <Outlet />;
}

/** Rutas solo para invitados (login, registro): si ya hay sesión, va al inicio. */
export function RedirectIfAuth() {
  const { isLoading, isAuthenticated } = useAuth();
  if (isLoading) return <SplashScreen />;
  if (isAuthenticated) return <Navigate to={ROUTES.home} replace />;
  return <Outlet />;
}
