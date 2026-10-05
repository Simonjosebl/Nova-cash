import type { Session } from '@supabase/supabase-js';

/** Usuario de la app (proyección segura del auth.user de Supabase). */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

/** DTOs de entrada de los Services (Cap. 8). */
export interface SignInDTO {
  email: string;
  password: string;
}

export interface SignUpDTO {
  name: string;
  email: string;
  password: string;
}

/** Registro con evidencia de la autorización de tratamiento de datos (R-05). */
export interface SignUpRecordDTO extends SignUpDTO {
  policiesVersion: string;
  policiesAcceptedAt: string;
}

export interface AuthSession {
  session: Session;
  user: AuthUser;
}

export type { Session };
