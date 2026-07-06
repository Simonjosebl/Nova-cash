import { accountRepository, type IAccountRepository } from '../repositories/AccountRepository';
import type { Account, CreateAccountDTO, UpdateAccountDTO } from '../types/account.types';

/**
 * AccountService — lógica de cuentas (ADR-009).
 * Posición automática al crear, archivar/desarchivar, reordenar y soft delete.
 */
export class AccountService {
  constructor(private readonly repo: IAccountRepository = accountRepository) {}

  list(workspaceId: string): Promise<Account[]> {
    return this.repo.list(workspaceId, false);
  }

  listArchived(workspaceId: string): Promise<Account[]> {
    return this.repo.list(workspaceId, true);
  }

  async create(workspaceId: string, currency: string, dto: CreateAccountDTO): Promise<Account> {
    const existing = await this.repo.list(workspaceId, false);
    const position = existing.length;
    return this.repo.create(workspaceId, { ...dto, currency, position });
  }

  update(id: string, dto: UpdateAccountDTO): Promise<Account> {
    return this.repo.update(id, dto);
  }

  archive(id: string): Promise<void> {
    return this.repo.setArchived(id, true);
  }

  unarchive(id: string): Promise<void> {
    return this.repo.setArchived(id, false);
  }

  remove(id: string): Promise<void> {
    return this.repo.softDelete(id);
  }

  /** Reordena según el nuevo orden de ids (posición = índice). */
  async reorder(orderedIds: string[]): Promise<void> {
    await Promise.all(orderedIds.map((id, index) => this.repo.setPosition(id, index)));
  }
}

export const accountService = new AccountService();
