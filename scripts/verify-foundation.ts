/**
 * NSB Foundation Automated Verification Suite
 * Executes unit-level business logic, schema validation, and integration tests.
 */

import {
  formatDateISO,
  getDaysDifference,
  isSameDay,
  isYesterday,
  getMonthDateRange,
  addDays,
} from "../src/lib/utils/date.utils";

import { calculateHabitStreak } from "../src/modules/habits/habits.utils";
import {
  CreateHabitSchema,
  LogHabitCompletionSchema,
} from "../src/modules/habits/habits.schema";

import {
  calculateExpenseTotal,
  calculateCategoryBreakdown,
  calculateMonthlySummary,
} from "../src/modules/expenses/expenses.utils";
import { CreateExpenseSchema } from "../src/modules/expenses/expenses.schema";
import type { ExpenseWithCategory } from "../src/modules/expenses/expenses.types";

import { calculateGoalProgress } from "../src/modules/goals/goals.utils";
import { CreateGoalSchema } from "../src/modules/goals/goals.schema";

import {
  sortTasks,
  isTaskOverdue,
  isTaskDueToday,
} from "../src/modules/tasks/tasks.utils";
import { CreateTaskSchema } from "../src/modules/tasks/tasks.schema";
import type { Task } from "../src/modules/tasks/tasks.types";

import { calculateDailyProductivityScore } from "../src/modules/dashboard/dashboard.utils";

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, failureDetails?: unknown) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    if (failureDetails !== undefined) {
      console.error(`     Details:`, failureDetails);
    }
  }
}

async function runVerification() {
  console.log("\n========================================================");
  console.log("   🧪 NSB FOUNDATION VERIFICATION TEST SUITE");
  console.log("========================================================\n");

  // ---------------------------------------------------------------------------
  // 1. DATE UTILITIES
  // ---------------------------------------------------------------------------
  console.log("1️⃣ Testing Date Utilities...");
  const dateStr = formatDateISO(new Date("2026-09-01T12:00:00Z"));
  assert(dateStr === "2026-09-01", "formatDateISO formats to YYYY-MM-DD");

  const daysDiff = getDaysDifference("2026-09-01", "2026-09-05");
  assert(daysDiff === 4, "getDaysDifference calculates accurate day count");

  const yesterdayCheck = isYesterday("2026-08-31", "2026-09-01");
  assert(yesterdayCheck === true, "isYesterday identifies preceding day");

  const sameDayCheck = isSameDay("2026-09-01", "2026-09-01");
  assert(sameDayCheck === true, "isSameDay identifies same calendar day");

  const monthRange = getMonthDateRange(2026, 2); // February
  assert(
    monthRange.startDate === "2026-02-01" && monthRange.endDate === "2026-02-28",
    "getMonthDateRange handles standard February correctly"
  );

  const addedDays = addDays("2026-09-01", 5);
  assert(addedDays === "2026-09-06", "addDays increments date by N days");

  // ---------------------------------------------------------------------------
  // 2. HABITS BUSINESS LOGIC & STREAKS
  // ---------------------------------------------------------------------------
  console.log("\n2️⃣ Testing Habits Business Logic & Streaks...");
  const refDate = "2026-09-10";

  // Scenario A: 3 consecutive days ending today (Sept 8, 9, 10)
  const streakA = calculateHabitStreak(
    ["2026-09-08", "2026-09-09", "2026-09-10"],
    "2026-09-01",
    refDate
  );
  assert(streakA.currentStreak === 3, "Habit streak active today is 3");
  assert(streakA.longestStreak === 3, "Longest streak is 3");
  assert(streakA.isCompletedToday === true, "isCompletedToday is true");
  assert(streakA.totalCompletions === 3, "Total completions count is 3");

  // Scenario B: Completed yesterday, not yet today (Sept 7, 8, 9)
  const streakB = calculateHabitStreak(
    ["2026-09-07", "2026-09-08", "2026-09-09"],
    "2026-09-01",
    refDate
  );
  assert(streakB.currentStreak === 3, "Streak maintained from yesterday is 3");
  assert(streakB.isCompletedToday === false, "isCompletedToday is false");

  // Scenario C: Broken streak (completed Sept 1, 2, 3, 5, 10)
  const streakC = calculateHabitStreak(
    ["2026-09-01", "2026-09-02", "2026-09-03", "2026-09-05", "2026-09-10"],
    "2026-09-01",
    refDate
  );
  assert(streakC.currentStreak === 1, "Current streak after gap is 1");
  assert(streakC.longestStreak === 3, "Longest streak historically is 3");

  // Scenario D: Empty completions
  const streakD = calculateHabitStreak([], "2026-09-01", refDate);
  assert(streakD.currentStreak === 0 && streakD.longestStreak === 0, "Empty completions returns 0 streak");

  // Schema checks
  const habitValidationPass = CreateHabitSchema.safeParse({
    name: "Read 10 pages",
    frequency: "daily",
    targetPerPeriod: 1,
  });
  assert(habitValidationPass.success === true, "CreateHabitSchema passes on valid input");

  const habitValidationFail = CreateHabitSchema.safeParse({
    name: "",
    targetPerPeriod: -5,
  });
  assert(habitValidationFail.success === false, "CreateHabitSchema rejects empty name and negative target");

  // ---------------------------------------------------------------------------
  // 3. EXPENSES BUSINESS LOGIC
  // ---------------------------------------------------------------------------
  console.log("\n3️⃣ Testing Expenses Business Logic & Aggregations...");
  const mockExpenses: ExpenseWithCategory[] = [
    {
      id: "e1",
      userId: "u1",
      expenseCategoryId: "cat-food",
      amount: 45.5,
      currency: "USD",
      date: "2026-09-01",
      description: "Groceries",
      createdAt: "2026-09-01T10:00:00Z",
      updatedAt: "2026-09-01T10:00:00Z",
      category: {
        id: "cat-food",
        userId: null,
        name: "Food & Dining",
        icon: "Utensils",
        color: "#EF4444",
        isSystem: true,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      },
    },
    {
      id: "e2",
      userId: "u1",
      expenseCategoryId: "cat-food",
      amount: 14.5,
      currency: "USD",
      date: "2026-09-02",
      description: "Coffee",
      createdAt: "2026-09-02T10:00:00Z",
      updatedAt: "2026-09-02T10:00:00Z",
      category: {
        id: "cat-food",
        userId: null,
        name: "Food & Dining",
        icon: "Utensils",
        color: "#EF4444",
        isSystem: true,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      },
    },
    {
      id: "e3",
      userId: "u1",
      expenseCategoryId: "cat-transport",
      amount: 40.0,
      currency: "USD",
      date: "2026-09-03",
      description: "Metro Card",
      createdAt: "2026-09-03T10:00:00Z",
      updatedAt: "2026-09-03T10:00:00Z",
      category: {
        id: "cat-transport",
        userId: null,
        name: "Transportation",
        icon: "Car",
        color: "#3B82F6",
        isSystem: true,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      },
    },
  ];

  const totalExpense = calculateExpenseTotal(mockExpenses);
  assert(totalExpense === 100, "calculateExpenseTotal accurately sums $100.00");

  const categoryBreakdown = calculateCategoryBreakdown(mockExpenses);
  assert(categoryBreakdown.length === 2, "calculateCategoryBreakdown groups into 2 categories");
  assert(
    categoryBreakdown[0].categoryName === "Food & Dining" &&
      categoryBreakdown[0].totalAmount === 60 &&
      categoryBreakdown[0].percentage === 60,
    "Food category correctly calculated at $60 (60%)"
  );
  assert(
    categoryBreakdown[1].categoryName === "Transportation" &&
      categoryBreakdown[1].totalAmount === 40 &&
      categoryBreakdown[1].percentage === 40,
    "Transport category correctly calculated at $40 (40%)"
  );

  const monthlySummary = calculateMonthlySummary(mockExpenses, 2026, 9);
  assert(
    monthlySummary.totalAmount === 100 && monthlySummary.transactionCount === 3,
    "calculateMonthlySummary correctly summarizes transactions"
  );

  // Schema checks
  const expenseValidationFail = CreateExpenseSchema.safeParse({
    expenseCategoryId: "not-a-uuid",
    amount: -10,
  });
  assert(expenseValidationFail.success === false, "CreateExpenseSchema rejects invalid UUID and negative amount");

  // ---------------------------------------------------------------------------
  // 4. GOALS BUSINESS LOGIC
  // ---------------------------------------------------------------------------
  console.log("\n4️⃣ Testing Goals Business Logic & Progress Calculations...");
  const goalProgress1 = calculateGoalProgress(100, 45, "in_progress", "2026-09-30", "2026-09-10");
  assert(goalProgress1.percentage === 45, "Goal progress calculated at 45%");
  assert(goalProgress1.remainingValue === 55, "Remaining target calculated at 55");
  assert(goalProgress1.isCompleted === false, "isCompleted is false");
  assert(goalProgress1.daysRemaining === 20, "daysRemaining calculated at 20 days");
  assert(goalProgress1.isOverdue === false, "isOverdue is false for future deadline");

  const overdueGoal = calculateGoalProgress(100, 30, "in_progress", "2026-09-01", "2026-09-10");
  assert(overdueGoal.isOverdue === true, "Goal past deadline is flagged overdue");

  const completedGoal = calculateGoalProgress(100, 120, "completed");
  assert(completedGoal.isCompleted === true, "Goal >= 100% is marked completed");

  // Schema checks
  const goalValidationPass = CreateGoalSchema.safeParse({
    name: "Save $10,000",
    targetValue: 10000,
    currentValue: 2500,
  });
  assert(goalValidationPass.success === true, "CreateGoalSchema passes valid goal");

  // ---------------------------------------------------------------------------
  // 5. TASKS BUSINESS LOGIC & SORTING
  // ---------------------------------------------------------------------------
  console.log("\n5️⃣ Testing Tasks Business Logic & Priority Ordering...");
  const mockTasks: Task[] = [
    {
      id: "t1",
      userId: "u1",
      goalId: null,
      title: "Low priority task",
      description: null,
      status: "pending",
      priority: "low",
      dueDate: "2026-09-15T12:00:00Z",
      createdAt: "2026-09-01T08:00:00Z",
      updatedAt: "2026-09-01T08:00:00Z",
    },
    {
      id: "t2",
      userId: "u1",
      goalId: null,
      title: "Urgent task",
      description: null,
      status: "pending",
      priority: "urgent",
      dueDate: "2026-09-12T12:00:00Z",
      createdAt: "2026-09-01T09:00:00Z",
      updatedAt: "2026-09-01T09:00:00Z",
    },
    {
      id: "t3",
      userId: "u1",
      goalId: null,
      title: "High priority task",
      description: null,
      status: "pending",
      priority: "high",
      dueDate: "2026-09-10T12:00:00Z",
      createdAt: "2026-09-01T10:00:00Z",
      updatedAt: "2026-09-01T10:00:00Z",
    },
  ];

  const sortedTasks = sortTasks(mockTasks);
  assert(
    sortedTasks[0].priority === "urgent" &&
      sortedTasks[1].priority === "high" &&
      sortedTasks[2].priority === "low",
    "sortTasks orders strictly by priority urgency"
  );

  const isOverdueCheck = isTaskOverdue(
    { dueDate: "2026-09-01", status: "pending" },
    "2026-09-10"
  );
  assert(isOverdueCheck === true, "isTaskOverdue flags overdue pending tasks");

  const isDueTodayCheck = isTaskDueToday(
    { dueDate: "2026-09-10" },
    "2026-09-10"
  );
  assert(isDueTodayCheck === true, "isTaskDueToday correctly detects task due on reference date");

  // Schema checks
  const taskValidationPass = CreateTaskSchema.safeParse({
    title: "Deploy NSB Foundation",
    priority: "urgent",
    status: "in_progress",
  });
  assert(taskValidationPass.success === true, "CreateTaskSchema passes valid task");

  // ---------------------------------------------------------------------------
  // 6. DASHBOARD AGGREGATION & PRODUCTIVITY SCORE
  // ---------------------------------------------------------------------------
  console.log("\n6️⃣ Testing Dashboard Score Calculations...");
  const productivityScore = calculateDailyProductivityScore(
    { habits: [], totalCount: 4, completedCount: 4, completionPercentage: 100 }, // 45 pts
    { tasks: [], totalCount: 2, completedCount: 1, pendingCount: 1 }, // 50% * 35 = 17.5 pts
    { goals: [], totalActiveCount: 2, averageProgressPercentage: 50 } // 50% * 20 = 10 pts
  );
  // Total = 45 + 17.5 + 10 = 72.5 -> rounds to 73
  assert(productivityScore === 73, `calculateDailyProductivityScore calculates score accurately (expected 73, got ${productivityScore})`);

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log("\n========================================================");
  console.log(`   🏁 RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log("========================================================\n");

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error("Verification test error:", err);
  process.exit(1);
});
