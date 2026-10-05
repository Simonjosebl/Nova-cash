import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Session, User } from '@supabase/supabase-js';
import { LEGAL_INFO } from '@/shared/constants/legal';
import { AuthService } from '../services/AuthService';
import type { IAuthRepository } from '../repositories/AuthRepository';

function fakeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u1',
    email: 'ana@nova.com',
    user_metadata: { name: 'Ana Pérez' },
    app_metadata: {},
    aud: 'authenticated',
    created_at: '2026-01-01',
    ...overrides,
  } as User;
}

function fakeSession(user: User = fakeUser()): Session {
  return { access_token: 'tok', refresh_token: 'ref', user } as unknown as Session;
}

function createRepoMock(): IAuthRepository {
  return {
    signIn: vi.fn(),
    signUp: vi.fn(),
    signInWithGoogle: vi.fn(),
    sendPasswordReset: vi.fn(),
    updatePassword: vi.fn(),
    updateName: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
  };
}

describe('AuthService', () => {
  let repo: IAuthRepository;
  let service: AuthService;

  beforeEach(() => {
    repo = createRepoMock();
    service = new AuthService(repo);
  });

  it('login mapea la sesión a AuthUser', async () => {
    vi.mocked(repo.signIn).mockResolvedValue(fakeSession());
    const result = await service.login({ email: 'ana@nova.com', password: 'x' });
    expect(result.user).toEqual({
      id: 'u1',
      email: 'ana@nova.com',
      name: 'Ana Pérez',
      avatarUrl: null,
    });
  });

  it('register marca needsConfirmation cuando no hay sesión', async () => {
    vi.mocked(repo.signUp).mockResolvedValue(null);
    const result = await service.register({ name: 'Ana', email: 'a@b.com', password: '12345678' });
    expect(result.needsConfirmation).toBe(true);
  });

  it('register guarda la versión y fecha de aceptación de políticas', async () => {
    vi.mocked(repo.signUp).mockResolvedValue(null);
    await service.register({ name: 'Ana', email: 'a@b.com', password: '12345678' });
    expect(repo.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        policiesVersion: LEGAL_INFO.version,
        policiesAcceptedAt: expect.any(String),
      }),
    );
  });

  it('register no requiere confirmación si hay sesión', async () => {
    vi.mocked(repo.signUp).mockResolvedValue(fakeSession());
    const result = await service.register({ name: 'Ana', email: 'a@b.com', password: '12345678' });
    expect(result.needsConfirmation).toBe(false);
  });

  it('updateProfileName recorta el nombre', async () => {
    vi.mocked(repo.updateName).mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      name: 'Ana',
      avatarUrl: null,
    });
    await service.updateProfileName('  Ana  ');
    expect(repo.updateName).toHaveBeenCalledWith('Ana');
  });

  it('loginWithGoogle delega con la URL de retorno', async () => {
    vi.mocked(repo.signInWithGoogle).mockResolvedValue();
    await service.loginWithGoogle('http://localhost:5173/');
    expect(repo.signInWithGoogle).toHaveBeenCalledWith('http://localhost:5173/');
  });

  it('login usa full_name de Google cuando no hay name', async () => {
    vi.mocked(repo.signIn).mockResolvedValue(
      fakeSession(fakeUser({ user_metadata: { full_name: 'Ana Google' } })),
    );
    const result = await service.login({ email: 'ana@nova.com', password: 'x' });
    expect(result.user.name).toBe('Ana Google');
  });

  it('getCurrentSession devuelve null sin sesión', async () => {
    vi.mocked(repo.getSession).mockResolvedValue(null);
    expect(await service.getCurrentSession()).toBeNull();
  });

  it('logout delega en el repositorio', async () => {
    vi.mocked(repo.signOut).mockResolvedValue();
    await service.logout();
    expect(repo.signOut).toHaveBeenCalledOnce();
  });

  it('subscribeToAuthChanges mapea sesión y null', () => {
    let captured: ((session: Session | null) => void) | undefined;
    vi.mocked(repo.onAuthStateChange).mockImplementation((cb) => {
      captured = cb;
      return () => {};
    });
    const received: Array<string | null> = [];
    service.subscribeToAuthChanges((auth) => received.push(auth?.user.name ?? null));

    captured?.(fakeSession());
    captured?.(null);
    expect(received).toEqual(['Ana Pérez', null]);
  });
});
