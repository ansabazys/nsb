import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { HabitsService } from "@/modules/habits/habits.service";
import { ExpensesService } from "@/modules/expenses/expenses.service";
import { HabitWidget } from "@/modules/dashboard/components/habit-widget";
import { ExpenseWidget } from "@/modules/dashboard/components/expense-widget";
import { MorningRunWidget } from "@/modules/dashboard/components/morning-run-widget";
import { mapHabitToWidgetItem } from "@/modules/dashboard/dashboard.utils";
import type { HabitWidgetItem } from "@/modules/dashboard/dashboard.types";
import type { ExpenseWithCategory, ExpenseCategory } from "@/modules/expenses/expenses.types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  let habitItems: HabitWidgetItem[] = [];
  let morningRunStreak = 0;
  let monthExpenses: ExpenseWithCategory[] = [];
  let expenseCategories: ExpenseCategory[] = [];
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  try {
    const supabase = await createServerSupabaseClient();
    const habitsService = new HabitsService(supabase);
    const { habits } = await habitsService.getTodayHabits(user.id);
    habitItems = habits.map((h, i) => mapHabitToWidgetItem(h, i));
    const allHabits = await habitsService.getUserHabits(user.id);
    morningRunStreak = allHabits.find((habit) => /morning run/i.test(habit.name))?.streak.currentStreak ?? 0;
  } catch (error) {
    console.error("Failed to load dashboard habits:", error);
    habitItems = [];
  }

  try {
    const supabase = await createServerSupabaseClient();
    const expensesService = new ExpensesService(supabase);
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(new Date(year, month, 0).getDate()).padStart(2, "0")}`;
    const [result, categories] = await Promise.all([
      expensesService.getExpensesByDateRange(user.id, startDate, endDate),
      expensesService.getExpenseCategories(user.id),
    ]);
    monthExpenses = result.expenses;
    expenseCategories = categories;
  } catch (error) {
    console.error("Failed to load dashboard expenses:", error);
  }

  return (
    <div className="flex w-full flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
      {/* Dashboard Canvas */}
      <ExpenseWidget
        expenses={monthExpenses}
        categories={expenseCategories}
        year={year}
        month={month}
      />
      <HabitWidget initialHabits={habitItems} className="hidden lg:flex lg:ml-auto" />
      {/* <MorningRunWidget streak={morningRunStreak} /> */}
    </div>
  );
}
