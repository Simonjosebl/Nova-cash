import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, LogOut } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { TextField } from '@/shared/ui/text-field';
import { ThemeSwitch } from '@/shared/ui/theme-switch';
import { Avatar } from '@/shared/ui/avatar';
import { MyWorkspaces } from '@/modules/workspace/components/MyWorkspaces';
import { getErrorMessage } from '@/shared/types/app-error';
import { ROUTES } from '@/shared/constants/routes';
import { useAuth } from '../hooks/useAuth';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import { useLogout } from '../hooks/useLogout';
import { FormError } from '../components/FormError';
import { FormSuccess } from '../components/FormSuccess';
import { updateProfileSchema, type UpdateProfileInput } from '../schemas/auth.schema';

/** Perfil del usuario (Cap. 6.17). Nombre editable, correo y cierre de sesión. */
export function ProfilePage() {
  const { user } = useAuth();
  const update = useUpdateProfile();
  const logout = useLogout();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    values: { name: user?.name ?? '' },
  });

  const onSubmit = handleSubmit((data) => update.mutate(data));

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild aria-label="Volver">
          <Link to={ROUTES.home}>
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-h3 font-bold text-primary">Perfil</h1>
      </header>

      <div className="flex flex-col items-center gap-3">
        <Avatar name={user?.name ?? ''} src={user?.avatarUrl} className="size-20 text-h2" />
        <p className="text-caption text-muted-foreground">{user?.email}</p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        {update.isError ? <FormError message={getErrorMessage(update.error)} /> : null}
        {update.isSuccess ? <FormSuccess message="Perfil actualizado." /> : null}

        <TextField
          label="Nombre"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />
        <Button type="submit" disabled={update.isPending}>
          {update.isPending ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </form>

      <div className="flex items-center gap-3 rounded-md border border-input bg-card px-4 py-3 text-body text-foreground shadow-card-glow dark:shadow-card-glow-dark">
        <span className="text-xl">🌓</span>
        <span className="flex-1">Apariencia</span>
        <ThemeSwitch />
      </div>

      <MyWorkspaces />

      <nav className="flex flex-col gap-2">
        <ProfileLink to={ROUTES.accounts} emoji="🏦" label="Cuentas" />
        <ProfileLink to={ROUTES.categories} emoji="🏷️" label="Categorías" />
        <ProfileLink to={ROUTES.budgets} emoji="📊" label="Presupuestos" />
        <ProfileLink to={ROUTES.goals} emoji="🎯" label="Metas" />
        <ProfileLink to={ROUTES.members} emoji="👥" label="Colaboradores" />
        <ProfileLink to={ROUTES.history} emoji="🧾" label="Historial" />
        <ProfileLink to={ROUTES.workspaceSettings} emoji="⚙️" label="Configuración del espacio" />
      </nav>

      <Button variant="ghost" onClick={() => logout.mutate()} disabled={logout.isPending}>
        <LogOut />
        Cerrar sesión
      </Button>
    </div>
  );
}

function ProfileLink({ to, emoji, label }: { to: string; emoji: string; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-md border border-input bg-card px-4 py-3 text-body text-foreground shadow-card-glow active:scale-[0.99] dark:shadow-card-glow-dark"
    >
      <span className="text-xl">{emoji}</span>
      <span className="flex-1">{label}</span>
      <ChevronRight className="size-4 text-muted-foreground" />
    </Link>
  );
}
