import type { Session } from '@supabase/supabase-js';
import {
  authRepository,
  mapSupabaseUser,
  type IAuthRepository,
} from '../repositories/AuthRepository';
import type { AuthSession, AuthUser, SignInDTO, SignUpDTO } from '../types/auth.types';

/**
 * AuthService — lógica de negocio de autenticación (ADR-009).
 * Agnóstico de Supabase: solo conoce IAuthRepository. Inyección para testeo.
 */
export class AuthService {
  constructor(private readonly repo: IAuthRepository = authRepository) {}

  async login(dto: SignInDTO): Promise<AuthSession> {
    const session = await this.repo.signIn(dto);
    return { session, user: mapSupabaseUser(session.user) };
  }

  /** Registro. Si el proyecto exige confirmación de correo, session llega null. */
  async register(dto: SignUpDTO): Promise<{ session: Session | null; needsConfirmation: boolean }> {
    const session = await this.repo.signUp(dto);
    return { session, needsConfirmation: session === null };
  }

  async sendMagicLink(email: string, redirectTo: string): Promise<void> {
    await this.repo.sendMagicLink(email, redirectTo);
  }

  async sendPasswordReset(email: string, redirectTo: string): Promise<void> {
    await this.repo.sendPasswordReset(email, redirectTo);
  }

  async resetPassword(password: string): Promise<void> {
    await this.repo.updatePassword(password);
  }

  async updateProfileName(name: string): Promise<AuthUser> {
    return this.repo.updateName(name.trim());
  }

  async logout(): Promise<void> {
    await this.repo.signOut();
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    const session = await this.repo.getSession();
    if (!session) return null;
    return { session, user: mapSupabaseUser(session.user) };
  }

  /** Suscribe a cambios de sesión (login, logout, refresh). Devuelve la función de baja. */
  subscribeToAuthChanges(callback: (auth: AuthSession | null) => void): () => void {
    return this.repo.onAuthStateChange((session) => {
      callback(session ? { session, user: mapSupabaseUser(session.user) } : null);
    });
  }
}

export const authService = new AuthService();
