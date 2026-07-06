import {
  transactionRepository,
  type ITransactionRepository,
} from '../repositories/TransactionRepository';
import type {
  CreateTransactionDTO,
  Transaction,
  TransactionFilters,
} from '../types/transaction.types';

/**
 * TransactionService — motor financiero (ADR-009 / Cap. 4.10).
 * Normaliza según el tipo (RB-007/015): transferencia sin categoría; ingreso/gasto sin destino.
 * La cascada de saldos y la auditoría ocurren en la base de datos (triggers, Cap. 5.10/5.11).
 */
export class TransactionService {
  constructor(private readonly repo: ITransactionRepository = transactionRepository) {}

  list(workspaceId: string, filters: TransactionFilters = {}): Promise<Transaction[]> {
    return this.repo.list(workspaceId, filters);
  }

  create(workspaceId: string, dto: CreateTransactionDTO): Promise<Transaction> {
    return this.repo.create(workspaceId, this.normalize(dto));
  }

  update(id: string, dto: CreateTransactionDTO): Promise<Transaction> {
    return this.repo.update(id, this.normalize(dto));
  }

  remove(id: string): Promise<void> {
    return this.repo.softDelete(id);
  }

  /** Coherencia por tipo antes de persistir. */
  private normalize(dto: CreateTransactionDTO): CreateTransactionDTO {
    if (dto.type === 'transfer') {
      return { ...dto, categoryId: null };
    }
    return { ...dto, toAccountId: null };
  }
}

export const transactionService = new TransactionService();
