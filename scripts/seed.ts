import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local or .env
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

import { createAdminClient } from "../src/lib/supabase/admin";
import { getTodayDateString, addDays } from "../src/lib/utils/date.utils";

async function seed() {
  console.log("🌱 Starting NSB database seeding for Ansab...");

  const supabase = createAdminClient();
  const today = getTodayDateString();

  const userEmail = "ansab@gmail.com";
  const userPassword = "Ansab@123";
  const userFullName = "Ansab";

  // 1. Create or retrieve auth user
  console.log(`1️⃣ Ensuring auth user exists for ${userEmail}...`);
  let userId: string;

  const { data: userListData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    throw new Error(`Failed to list users: ${listError.message}`);
  }

  const existingUser = userListData.users.find((u) => u.email?.toLowerCase() === userEmail.toLowerCase());

  if (existingUser) {
    console.log(`ℹ️ Auth user found with ID: ${existingUser.id}. Updating password...`);
    userId = existingUser.id;
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: userPassword,
      email_confirm: true,
      user_metadata: { full_name: userFullName },
    });
    if (updateError) {
      console.error("Warning: Failed to update auth user password:", updateError.message);
    } else {
      console.log("✅ Auth user password updated and confirmed.");
    }
  } else {
    console.log(`✨ Creating new auth user ${userEmail}...`);
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: userEmail,
      password: userPassword,
      email_confirm: true,
      user_metadata: {
        full_name: userFullName,
      },
    });

    if (createError || !newUser.user) {
      throw new Error(`Failed to create auth user: ${createError?.message}`);
    }

    userId = newUser.user.id;
    console.log(`✅ Auth user created with ID: ${userId}`);
  }

  // 2. Upsert profile
  console.log("2️⃣ Upserting user profile...");
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email: userEmail,
      full_name: userFullName,
      timezone: "Asia/Kolkata",
    },
    { onConflict: "id" }
  );

  if (profileError) {
    console.error("Failed to seed profile:", profileError.message);
  } else {
    console.log("✅ Profile seeded.");
  }

  // 3. Seed Expense Categories
  console.log("3️⃣ Seeding system expense categories...");
  const categories = [
    { id: "50000000-0000-0000-0000-000000000001", name: "Food & Dining", is_system: true, color: "#10B981" },
    { id: "50000000-0000-0000-0000-000000000002", name: "Transportation", is_system: true, color: "#3B82F6" },
    { id: "50000000-0000-0000-0000-000000000003", name: "Housing & Utilities", is_system: true, color: "#F59E0B" },
    { id: "50000000-0000-0000-0000-000000000004", name: "Health & Fitness", is_system: true, color: "#EC4899" },
    { id: "50000000-0000-0000-0000-000000000005", name: "Entertainment & Leisure", is_system: true, color: "#8B5CF6" },
    { id: "50000000-0000-0000-0000-000000000006", name: "Personal Development", is_system: true, color: "#06B6D4" },
  ];

  await supabase.from("expense_categories").upsert(categories, { onConflict: "id" });
  console.log("✅ Expense categories seeded.");

  // 4. Seed Habits & Completions
  console.log("4️⃣ Seeding habits & completions...");
  const habit1Id = "10000000-0000-0000-0000-000000000011";
  const habit2Id = "10000000-0000-0000-0000-000000000012";
  const habit3Id = "10000000-0000-0000-0000-000000000013";

  await supabase.from("habits").upsert([
    {
      id: habit1Id,
      user_id: userId,
      name: "Morning Meditation (15 mins)",
      description: "Mindfulness and breathwork to start the day with clarity.",
      frequency: "daily",
      target_per_period: 1,
      is_archived: false,
    },
    {
      id: habit2Id,
      user_id: userId,
      name: "Daily Workout / Gym",
      description: "Strength training, running, or high intensity cardio.",
      frequency: "daily",
      target_per_period: 1,
      is_archived: false,
    },
    {
      id: habit3Id,
      user_id: userId,
      name: "Read 20 Pages of Non-Fiction",
      description: "Expand knowledge in technology, philosophy, or business.",
      frequency: "daily",
      target_per_period: 1,
      is_archived: false,
    },
  ], { onConflict: "id" });

  // Add completions for past 3 days to build an active streak
  await supabase.from("habit_completions").upsert([
    {
      habit_id: habit1Id,
      user_id: userId,
      completed_date: addDays(today, -2),
      notes: "15 min mindful session.",
    },
    {
      habit_id: habit1Id,
      user_id: userId,
      completed_date: addDays(today, -1),
      notes: "Morning breathwork.",
    },
    {
      habit_id: habit1Id,
      user_id: userId,
      completed_date: today,
      notes: "Done before starting work.",
    },
    {
      habit_id: habit2Id,
      user_id: userId,
      completed_date: addDays(today, -1),
      notes: "Upper body strength workout.",
    },
    {
      habit_id: habit2Id,
      user_id: userId,
      completed_date: today,
      notes: "5km morning run completed.",
    },
  ]);
  console.log("✅ Habits & completions seeded.");

  // 5. Seed Goals
  console.log("5️⃣ Seeding goals...");
  await supabase.from("goals").upsert([
    {
      id: "20000000-0000-0000-0000-000000000011",
      user_id: userId,
      name: "Run 100km Total This Month",
      description: "Build cardiovascular endurance and discipline.",
      target_value: 100,
      current_value: 45,
      unit: "km",
      deadline: addDays(today, 25),
      status: "in_progress",
    },
    {
      id: "20000000-0000-0000-0000-000000000012",
      user_id: userId,
      name: "Emergency Savings Fund $10,000",
      description: "Liquid emergency buffer in a high-yield account.",
      target_value: 10000,
      current_value: 6800,
      unit: "USD",
      deadline: addDays(today, 90),
      status: "in_progress",
    },
    {
      id: "20000000-0000-0000-0000-000000000013",
      user_id: userId,
      name: "Launch NSB Life OS MVP",
      description: "Deploy complete production-ready Life OS system.",
      target_value: 100,
      current_value: 85,
      unit: "%",
      deadline: addDays(today, 14),
      status: "in_progress",
    },
  ], { onConflict: "id" });
  console.log("✅ Goals seeded.");

  // 6. Seed Tasks
  console.log("6️⃣ Seeding tasks...");
  await supabase.from("tasks").upsert([
    {
      id: "30000000-0000-0000-0000-000000000011",
      user_id: userId,
      title: "Design and polish the frontend dashboard UI",
      description: "Create sleek dark mode widgets for habits, tasks, and spending.",
      status: "in_progress",
      priority: "urgent",
      due_date: today,
    },
    {
      id: "30000000-0000-0000-0000-000000000012",
      user_id: userId,
      title: "Review monthly budget and investment allocation",
      description: "Ensure savings goals are on track for the quarter.",
      status: "pending",
      priority: "high",
      due_date: addDays(today, 2),
    },
    {
      id: "30000000-0000-0000-0000-000000000013",
      user_id: userId,
      title: "Weekly grocery and healthy meal preparation",
      description: "Restock vegetables, protein, and electrolyte drinks.",
      status: "completed",
      priority: "medium",
      due_date: addDays(today, -1),
    },
  ], { onConflict: "id" });
  console.log("✅ Tasks seeded.");

  // 7. Seed Recent Expenses
  console.log("7️⃣ Seeding recent expenses...");
  await supabase.from("expenses").upsert([
    {
      id: "40000000-0000-0000-0000-000000000011",
      user_id: userId,
      expense_category_id: "50000000-0000-0000-0000-000000000001", // Food
      amount: 45.50,
      currency: "USD",
      date: today,
      description: "Whole Foods healthy groceries",
    },
    {
      id: "40000000-0000-0000-0000-000000000012",
      user_id: userId,
      expense_category_id: "50000000-0000-0000-0000-000000000002", // Transport
      amount: 22.00,
      currency: "USD",
      date: addDays(today, -1),
      description: "Uber ride to meeting",
    },
    {
      id: "40000000-0000-0000-0000-000000000013",
      user_id: userId,
      expense_category_id: "50000000-0000-0000-0000-000000000006", // Personal Dev
      amount: 19.99,
      currency: "USD",
      date: addDays(today, -3),
      description: "Audible subscription & audiobooks",
    },
  ], { onConflict: "id" });
  console.log("✅ Expenses seeded.");

  console.log("\n========================================================");
  console.log("🎉 SEEDING COMPLETE FOR USER: ansab@gmail.com");
  console.log("📧 Email:    ansab@gmail.com");
  console.log("🔑 Password: Ansab@123");
  console.log("========================================================\n");
}

seed().catch((err) => {
  console.error("❌ Error during seed execution:", err);
  process.exit(1);
});
