import { accountRepository, type IAccountRepository } from '../repositories/AccountRepository';
import type { Account, CreateAccountDTO, UpdateAccountDTO } from '../types/account.types';

/**
 * AccountService — lógica de cuentas (ADR-009 / R-09).
 * Toda cuenta nace con saldo 0: sube con ingresos y baja con gastos (negativo solo si se
 * gasta más de lo que tiene). Posición automática al crear y soft delete.
 */
export class AccountService {
  constructor(private readonly repo: IAccountRepository = accountRepository) {}

  list(workspaceId: string): Promise<Account[]> {
    return this.repo.list(workspaceId);
  }

  async create(workspaceId: string, dto: CreateAccountDTO): Promise<Account> {
    const existing = await this.repo.list(workspaceId);
    return this.repo.create(workspaceId, { ...dto, position: existing.length });
  }

  update(id: string, dto: UpdateAccountDTO): Promise<Account> {
    return this.repo.update(id, dto);
  }

  /** Elimina la cuenta y sus movimientos (soft delete en el servidor). */
  remove(id: string): Promise<void> {
    return this.repo.softDelete(id);
  }
}

export const accountService = new AccountService();
