import { supabase } from '@/lib/supabase';
import { toAppError } from '@/shared/types/db-error';
import type { CreateGoalDTO, Goal, GoalStatus, UpdateGoalDTO } from '../types/goal.types';

const COLS = 'id,workspace_id,emoji,name,target_amount,current_amount,target_date,status';

interface GoalRow {
  id: string;
  workspace_id: string;
  emoji: string;
  name: string;
  target_amount: number | string;
  current_amount: number | string;
  target_date: string | null;
  status: GoalStatus;
}

function mapGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    emoji: row.emoji,
    name: row.name,
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    targetDate: row.target_date,
    status: row.status,
  };
}

export interface IGoalRepository {
  list(workspaceId: string): Promise<Goal[]>;
  create(workspaceId: string, dto: CreateGoalDTO): Promise<Goal>;
  update(id: string, dto: UpdateGoalDTO): Promise<Goal>;
  setStatus(id: string, status: GoalStatus): Promise<void>;
  softDelete(id: string): Promise<void>;
  addContribution(workspaceId: string, goalId: string, amount: number): Promise<void>;
}

export class GoalRepository implements IGoalRepository {
  async list(workspaceId: string): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select(COLS)
      .eq('workspace_id', workspaceId)
      .order('status', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) throw toAppError(error, 'No pudimos cargar tus metas.');
    return ((data ?? []) as GoalRow[]).map(mapGoal);
  }

  async create(workspaceId: string, dto: CreateGoalDTO): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .insert({
        workspace_id: workspaceId,
        name: dto.name,
        emoji: dto.emoji,
        target_amount: dto.targetAmount,
        target_date: dto.targetDate ?? null,
      })
      .select(COLS)
      .single();
    if (error || !data) throw toAppError(error, 'No pudimos crear la meta.');
    return mapGoal(data as GoalRow);
  }

  async update(id: string, dto: UpdateGoalDTO): Promise<Goal> {
    const patch: Record<string, unknown> = {};
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.emoji !== undefined) patch.emoji = dto.emoji;
    if (dto.targetAmount !== undefined) patch.target_amount = dto.targetAmount;
    if (dto.targetDate !== undefined) patch.target_date = dto.targetDate;

    const { data, error } = await supabase
      .from('goals')
      .update(patch)
      .eq('id', id)
      .select(COLS)
      .single();
    if (error || !data) throw toAppError(error, 'No pudimos actualizar la meta.');
    return mapGoal(data as GoalRow);
  }

  async setStatus(id: string, status: GoalStatus): Promise<void> {
    const { error } = await supabase.from('goals').update({ status }).eq('id', id);
    if (error) throw toAppError(error, 'No pudimos actualizar la meta.');
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw toAppError(error, 'No pudimos eliminar la meta.');
  }

  async addContribution(workspaceId: string, goalId: string, amount: number): Promise<void> {
    const { error } = await supabase
      .from('goal_contributions')
      .insert({ workspace_id: workspaceId, goal_id: goalId, amount });
    if (error) throw toAppError(error, 'No pudimos registrar el aporte.');
  }
}

export const goalRepository = new GoalRepository();
