export type GoalStatus = 'active' | 'completed' | 'cancelled';

export interface Goal {
  id: string;
  workspaceId: string;
  emoji: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  status: GoalStatus;
}

/** Meta con avance calculado (Cap. 6.13). */
export interface GoalProgress extends Goal {
  remaining: number;
  percent: number;
}

export interface CreateGoalDTO {
  name: string;
  emoji: string;
  targetAmount: number;
  targetDate?: string | null;
}

export interface UpdateGoalDTO {
  name?: string;
  emoji?: string;
  targetAmount?: number;
  targetDate?: string | null;
}
