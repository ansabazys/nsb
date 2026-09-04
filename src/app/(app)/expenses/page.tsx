import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ExpensesService } from "@/modules/expenses/expenses.service";
import { ExpensesView } from "@/modules/expenses/components/expenses-view";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createServerSupabaseClient();
  const expensesService = new ExpensesService(supabase);

  const [categories, summary, recent] = await Promise.all([
    expensesService.getExpenseCategories(user.id),
    expensesService.getMonthlyExpenses(user.id),
    expensesService.getTodayExpenses(user.id),
  ]);

  return (
    <ExpensesView
      initialExpenses={recent.expenses}
      categories={categories}
      summary={summary}
    />
  );
}
