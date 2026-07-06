import type { Session, User, Subscription } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AppError } from '@/shared/types/app-error';
import { mapAuthError } from '../constants/auth.errors';
import type { AuthUser, SignInDTO, SignUpDTO } from '../types/auth.types';

/**
 * AuthRepository — única capa que habla con Supabase Auth (ADR-010).
 * Aísla Supabase: traduce User → AuthUser y errores → AppError.
 * No contiene reglas de negocio.
 */
export interface IAuthRepository {
  signIn(dto: SignInDTO): Promise<Session>;
  signUp(dto: SignUpDTO): Promise<Session | null>;
  sendMagicLink(email: string, redirectTo: string): Promise<void>;
  sendPasswordReset(email: string, redirectTo: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
  updateName(name: string): Promise<AuthUser>;
  signOut(): Promise<void>;
  getSession(): Promise<Session | null>;
  onAuthStateChange(callback: (session: Session | null) => void): () => void;
}

export function mapSupabaseUser(user: User): AuthUser {
  const metadata = user.user_metadata ?? {};
  const name =
    typeof metadata.name === 'string' && metadata.name.trim().length > 0
      ? metadata.name
      : (user.email?.split('@')[0] ?? 'Usuario');
  const avatarUrl = typeof metadata.avatar_url === 'string' ? metadata.avatar_url : null;
  return { id: user.id, email: user.email ?? '', name, avatarUrl };
}

function fail(error: { message?: string; status?: number } | null): never {
  const mapped = mapAuthError(error);
  throw new AppError(mapped.code, mapped.message, { status: error?.status, details: error });
}

export class AuthRepository implements IAuthRepository {
  async signIn({ email, password }: SignInDTO): Promise<Session> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) fail(error);
    return data.session;
  }

  async signUp({ name, email, password }: SignUpDTO): Promise<Session | null> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) fail(error);
    return data.session;
  }

  async sendMagicLink(email: string, redirectTo: string): Promise<void> {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) fail(error);
  }

  async sendPasswordReset(email: string, redirectTo: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) fail(error);
  }

  async updatePassword(password: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) fail(error);
  }

  async updateName(name: string): Promise<AuthUser> {
    const { data, error } = await supabase.auth.updateUser({ data: { name } });
    if (error || !data.user) fail(error);
    return mapSupabaseUser(data.user);
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) fail(error);
  }

  async getSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession();
    if (error) fail(error);
    return data.session;
  }

  onAuthStateChange(callback: (session: Session | null) => void): () => void {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
    const subscription: Subscription = data.subscription;
    return () => subscription.unsubscribe();
  }
}

export const authRepository = new AuthRepository();
