import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local or .env
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

import { createAdminClient } from "../src/lib/supabase/admin";
import { getTodayDateString, addDays } from "../src/lib/utils/date.utils";

async function seed() {
  console.log("🌱 Starting NSB database seeding...");

  const supabase = createAdminClient();
  const today = getTodayDateString();

  const testUserId = "00000000-0000-0000-0000-000000000001";
  const testUserEmail = "test.user@nsb.local";

  // 1. Create or upsert test profile
  console.log("1️⃣ Seeding test profile...");
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: testUserId,
      email: testUserEmail,
      full_name: "NSB Test User",
      timezone: "UTC",
    },
    { onConflict: "id" }
  );

  if (profileError) {
    console.error("Failed to seed profile:", profileError.message);
  } else {
    console.log("✅ Profile seeded.");
  }

  // 2. Seed Habits
  console.log("2️⃣ Seeding habits & completions...");
  const { data: habit1, error: h1Error } = await supabase
    .from("habits")
    .upsert({
      id: "10000000-0000-0000-0000-000000000001",
      user_id: testUserId,
      name: "Morning Meditation (15 mins)",
      description: "Mindfulness and breathwork to start the day.",
      frequency: "daily",
      target_per_period: 1,
      is_archived: false,
    })
    .select()
    .single();

  if (!h1Error && habit1) {
    // Add completions for past 3 days
    await supabase.from("habit_completions").upsert([
      {
        habit_id: habit1.id,
        user_id: testUserId,
        completed_date: addDays(today, -2),
        notes: "Great calm session.",
      },
      {
        habit_id: habit1.id,
        user_id: testUserId,
        completed_date: addDays(today, -1),
        notes: "Morning 15 min session.",
      },
      {
        habit_id: habit1.id,
        user_id: testUserId,
        completed_date: today,
        notes: "Done before breakfast.",
      },
    ]);
  }

  const { data: habit2 } = await supabase
    .from("habits")
    .upsert({
      id: "10000000-0000-0000-0000-000000000002",
      user_id: testUserId,
      name: "Daily Exercise / Gym",
      description: "Strength training or cardio.",
      frequency: "daily",
      target_per_period: 1,
      is_archived: false,
    })
    .select()
    .single();

  if (habit2) {
    await supabase.from("habit_completions").upsert([
      {
        habit_id: habit2.id,
        user_id: testUserId,
        completed_date: addDays(today, -1),
        notes: "Leg day workout completed.",
      },
    ]);
  }
  console.log("✅ Habits & completions seeded.");

  // 3. Seed Goals
  console.log("3️⃣ Seeding goals...");
  await supabase.from("goals").upsert([
    {
      id: "20000000-0000-0000-0000-000000000001",
      user_id: testUserId,
      name: "Run 100km Total",
      description: "Build marathon endurance across this quarter.",
      target_value: 100,
      current_value: 42.5,
      unit: "km",
      deadline: addDays(today, 30),
      status: "in_progress",
    },
    {
      id: "20000000-0000-0000-0000-000000000002",
      user_id: testUserId,
      name: "Emergency Fund $5,000",
      description: "Liquid savings buffer in high yield savings account.",
      target_value: 5000,
      current_value: 3500,
      unit: "USD",
      deadline: addDays(today, 60),
      status: "in_progress",
    },
  ]);
  console.log("✅ Goals seeded.");

  // 4. Seed Tasks
  console.log("4️⃣ Seeding tasks...");
  await supabase.from("tasks").upsert([
    {
      id: "30000000-0000-0000-0000-000000000001",
      user_id: testUserId,
      title: "Review weekly goals and plan upcoming sprint",
      description: "Align priorities for tasks and habits.",
      status: "pending",
      priority: "high",
      due_date: new Date().toISOString(),
    },
    {
      id: "30000000-0000-0000-0000-000000000002",
      user_id: testUserId,
      title: "Grocery shopping for healthy meal prep",
      description: "Buy fruits, veggies, and lean protein.",
      status: "completed",
      priority: "medium",
      due_date: new Date().toISOString(),
    },
  ]);
  console.log("✅ Tasks seeded.");

  console.log("🎉 Seeding finished successfully!");
}

seed().catch((err) => {
  console.error("Error during seed execution:", err);
});
