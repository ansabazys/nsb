import type { AppSupabaseClient, GoalStatus } from "@/types/database.types";
import { GoalsRepository } from "./goals.repository";
import {
  CreateGoalSchema,
  UpdateGoalSchema,
  UpdateGoalProgressSchema,
  GoalIdSchema,
} from "./goals.schema";
import { GoalNotFoundError } from "./goals.errors";
import { calculateGoalProgress } from "./goals.utils";
import type {
  GoalWithProgress,
  CreateGoalInput,
  UpdateGoalInput,
  UpdateGoalProgressInput,
} from "./goals.types";

export class GoalsService {
  private readonly repository: GoalsRepository;

  constructor(supabase: AppSupabaseClient) {
    this.repository = new GoalsRepository(supabase);
  }

  async getGoalById(goalId: string, userId: string): Promise<GoalWithProgress> {
    GoalIdSchema.parse(goalId);
    const goal = await this.repository.findById(goalId, userId);
    if (!goal) {
      throw new GoalNotFoundError(goalId);
    }

    const progress = calculateGoalProgress(
      goal.targetValue,
      goal.currentValue,
      goal.status,
      goal.deadline
    );

    return {
      ...goal,
      progress,
    };
  }

  async getUserGoals(
    userId: string,
    statusFilter?: GoalStatus
  ): Promise<GoalWithProgress[]> {
    const goals = await this.repository.findAllByUser(userId, statusFilter);

    return goals.map((goal) => {
      const progress = calculateGoalProgress(
        goal.targetValue,
        goal.currentValue,
        goal.status,
        goal.deadline
      );
      return {
        ...goal,
        progress,
      };
    });
  }

  async getActiveGoalsProgress(userId: string): Promise<{
    goals: GoalWithProgress[];
    totalActiveCount: number;
    averageProgressPercentage: number;
  }> {
    const allGoals = await this.getUserGoals(userId);
    const activeGoals = allGoals.filter(
      (g) => g.status === "in_progress" || g.status === "not_started"
    );

    const totalActiveCount = activeGoals.length;
    const totalPercentage = activeGoals.reduce(
      (acc, g) => acc + Math.min(100, g.progress.percentage),
      0
    );
    const averageProgressPercentage =
      totalActiveCount > 0 ? Math.round(totalPercentage / totalActiveCount) : 0;

    return {
      goals: activeGoals,
      totalActiveCount,
      averageProgressPercentage,
    };
  }

  async createGoal(userId: string, rawInput: CreateGoalInput): Promise<GoalWithProgress> {
    const validated = CreateGoalSchema.parse(rawInput);
    const goal = await this.repository.create(userId, validated);

    const progress = calculateGoalProgress(
      goal.targetValue,
      goal.currentValue,
      goal.status,
      goal.deadline
    );

    return {
      ...goal,
      progress,
    };
  }

  async updateGoal(
    goalId: string,
    userId: string,
    rawInput: UpdateGoalInput
  ): Promise<GoalWithProgress> {
    GoalIdSchema.parse(goalId);
    const validated = UpdateGoalSchema.parse(rawInput);

    const existing = await this.repository.findById(goalId, userId);
    if (!existing) {
      throw new GoalNotFoundError(goalId);
    }

    const updated = await this.repository.update(goalId, userId, validated);
    if (!updated) {
      throw new GoalNotFoundError(goalId);
    }

    const progress = calculateGoalProgress(
      updated.targetValue,
      updated.currentValue,
      updated.status,
      updated.deadline
    );

    return {
      ...updated,
      progress,
    };
  }

  async updateProgress(
    goalId: string,
    userId: string,
    rawInput: UpdateGoalProgressInput
  ): Promise<GoalWithProgress> {
    GoalIdSchema.parse(goalId);
    const validated = UpdateGoalProgressSchema.parse(rawInput);

    const existing = await this.repository.findById(goalId, userId);
    if (!existing) {
      throw new GoalNotFoundError(goalId);
    }

    // Auto-advance status if reached target or if starting from not_started
    let newStatus = existing.status;
    if (validated.currentValue >= existing.targetValue) {
      newStatus = "completed";
    } else if (existing.status === "not_started" && validated.currentValue > 0) {
      newStatus = "in_progress";
    }

    const updated = await this.repository.update(goalId, userId, {
      currentValue: validated.currentValue,
      status: newStatus,
    });

    if (!updated) {
      throw new GoalNotFoundError(goalId);
    }

    const progress = calculateGoalProgress(
      updated.targetValue,
      updated.currentValue,
      updated.status,
      updated.deadline
    );

    return {
      ...updated,
      progress,
    };
  }

  async deleteGoal(goalId: string, userId: string): Promise<boolean> {
    GoalIdSchema.parse(goalId);
    const existing = await this.repository.findById(goalId, userId);
    if (!existing) {
      throw new GoalNotFoundError(goalId);
    }
    return await this.repository.delete(goalId, userId);
  }
}
