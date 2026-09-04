import type { AppSupabaseClient } from "@/types/database.types";
import { HabitsService } from "@/modules/habits/habits.service";
import { TasksService } from "@/modules/tasks/tasks.service";
import { ExpensesService } from "@/modules/expenses/expenses.service";
import { GoalsService } from "@/modules/goals/goals.service";
import { calculateDailyProductivityScore } from "./dashboard.utils";
import { getTodayDateString } from "@/lib/utils/date.utils";
import type { DashboardTodaySummary } from "./dashboard.types";

export class DashboardService {
  private readonly habitsService: HabitsService;
  private readonly tasksService: TasksService;
  private readonly expensesService: ExpensesService;
  private readonly goalsService: GoalsService;

  constructor(supabase: AppSupabaseClient) {
    this.habitsService = new HabitsService(supabase);
    this.tasksService = new TasksService(supabase);
    this.expensesService = new ExpensesService(supabase);
    this.goalsService = new GoalsService(supabase);
  }

  async getTodaySummary(userId: string): Promise<DashboardTodaySummary> {
    const today = getTodayDateString();

    // Fetch all domain summaries in parallel with graceful fallbacks
    const [habitsSummary, tasksSummary, expensesSummary, goalsSummary] =
      await Promise.all([
        this.habitsService.getTodayHabits(userId).catch(() => ({
          date: today,
          totalCount: 0,
          completedCount: 0,
          completionPercentage: 0,
          habits: [],
        })),
        this.tasksService.getTodayTasks(userId).catch(() => ({
          date: today,
          totalCount: 0,
          completedCount: 0,
          pendingCount: 0,
          overdueCount: 0,
          tasks: [],
        })),
        this.expensesService.getTodayExpenses(userId).catch(() => ({
          date: today,
          totalAmount: 0,
          currency: "USD",
          transactionCount: 0,
          expenses: [],
        })),
        this.goalsService.getActiveGoalsProgress(userId).catch(() => ({
          totalActiveCount: 0,
          averageProgressPercentage: 0,
          goals: [],
        })),
      ]);

    const overallScore = calculateDailyProductivityScore(
      habitsSummary,
      tasksSummary,
      goalsSummary
    );

    return {
      date: today,
      habits: habitsSummary,
      tasks: tasksSummary,
      expenses: expensesSummary,
      goals: goalsSummary,
      overallScore,
    };
  }
}
