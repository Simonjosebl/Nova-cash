import { AppError } from '@/shared/types/app-error';
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
 * Normaliza según el tipo (R-15): solo ingreso/gasto, siempre sin cuenta destino.
 * La cascada de saldos y la auditoría ocurren en la base de datos (triggers, Cap. 5.10/5.11).
 */
export class TransactionService {
  constructor(private readonly repo: ITransactionRepository = transactionRepository) {}

  list(workspaceId: string, filters: TransactionFilters = {}): Promise<Transaction[]> {
    return this.repo.list(workspaceId, filters);
  }

  async create(workspaceId: string, dto: CreateTransactionDTO): Promise<Transaction> {
    return this.repo.create(workspaceId, this.normalize(dto));
  }

  async update(id: string, dto: CreateTransactionDTO): Promise<Transaction> {
    return this.repo.update(id, this.normalize(dto));
  }

  remove(id: string): Promise<void> {
    return this.repo.softDelete(id);
  }

  /** Solo gastos e ingresos (R-15): sin cuenta destino; las transferencias se rechazan. */
  private normalize(dto: CreateTransactionDTO): CreateTransactionDTO {
    if (dto.type !== 'income' && dto.type !== 'expense') {
      throw new AppError('TYPE_NOT_SUPPORTED', 'Solo puedes registrar gastos o ingresos.');
    }
    return { ...dto, toAccountId: null };
  }
}

export const transactionService = new TransactionService();
