import { useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { getErrorMessage } from '@/shared/types/app-error';
import { ROUTES } from '@/shared/constants/routes';
import { useAcceptInvitation } from '../hooks/useAcceptInvitation';

/** Aceptar invitación (Cap. 6.16). Se abre desde el enlace del correo, ya autenticado. */
export function AcceptInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const accept = useAcceptInvitation();
  const navigate = useNavigate();
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !token) return;
    started.current = true;
    accept.mutate(token, {
      onSuccess: () => navigate(ROUTES.home, { replace: true }),
    });
  }, [token, accept, navigate]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      {accept.isError ? (
        <>
          <span className="text-4xl">🙈</span>
          <h1 className="text-h3 font-bold text-primary">No pudimos unirte</h1>
          <p className="text-body text-muted-foreground">{getErrorMessage(accept.error)}</p>
          <Button asChild>
            <Link to={ROUTES.home}>Ir al inicio</Link>
          </Button>
        </>
      ) : (
        <>
          <span className="text-4xl">🤝</span>
          <h1 className="text-h3 font-bold text-primary">Uniéndote al espacio…</h1>
          <p className="text-body text-muted-foreground">Un momento por favor.</p>
        </>
      )}
    </main>
  );
}
