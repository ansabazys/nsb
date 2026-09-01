import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
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

  constructor(supabase: SupabaseClient<Database>) {
    this.habitsService = new HabitsService(supabase);
    this.tasksService = new TasksService(supabase);
    this.expensesService = new ExpensesService(supabase);
    this.goalsService = new GoalsService(supabase);
  }

  async getTodaySummary(userId: string): Promise<DashboardTodaySummary> {
    const today = getTodayDateString();

    // Fetch all domain summaries in parallel without tight DB coupling
    const [habitsSummary, tasksSummary, expensesSummary, goalsSummary] =
      await Promise.all([
        this.habitsService.getTodayHabits(userId),
        this.tasksService.getTodayTasks(userId),
        this.expensesService.getTodayExpenses(userId),
        this.goalsService.getActiveGoalsProgress(userId),
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
