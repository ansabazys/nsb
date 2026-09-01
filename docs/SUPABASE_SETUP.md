# Supabase Setup Guide

This guide walks through setting up Supabase PostgreSQL, Authentication, and Row Level Security for **NSB**.

---

## 1. Creating a Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project.
2. Choose your preferred database region and set a strong database password.
3. Once provisioned, navigate to **Project Settings -> API**:
   - Copy **Project URL** -> `NEXT_PUBLIC_SUPABASE_URL`
   - Copy **anon public** key -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy **service_role secret** key -> `SUPABASE_SERVICE_ROLE_KEY`

---

## 2. Applying Schema & Migrations

### Option A: Using Supabase SQL Editor (Quickest)
1. In the Supabase Dashboard, open the **SQL Editor**.
2. Open [`supabase/migrations/20260901000000_initial_nsb_schema.sql`](file:///d:/nsb/supabase/migrations/20260901000000_initial_nsb_schema.sql).
3. Paste the entire SQL script and click **Run**.
4. This will create:
   - Enum types (`habit_frequency`, `goal_status`, `task_status`, `task_priority`)
   - Tables (`profiles`, `habits`, `habit_completions`, `expense_categories`, `expenses`, `goals`, `tasks`)
   - Triggers for user registration sync and `updated_at` timestamps
   - Row Level Security (RLS) policies for all tables
   - B-Tree indexes for fast querying

### Option B: Using Supabase CLI
```bash
# Link your local project to Supabase
supabase link --project-ref <your-project-ref>

# Push the migration
supabase db push
```

---

## 3. Seeding Test Data

Once migrations are applied and `.env.local` is configured with `SUPABASE_SERVICE_ROLE_KEY`, run:
```bash
pnpm seed
```
This populates the database with sample profiles, habits, expense categories, expenses, goals, and tasks.

---

## 4. Authentication Configuration

NSB is configured with Supabase SSR cookie synchronization:
- When users sign up or log in, `@supabase/ssr` stores access and refresh tokens in HTTP-only cookies.
- Next.js middleware at `src/middleware.ts` automatically refreshes active sessions on every page/route request.
- Database triggers automatically provision a record in `public.profiles` upon `auth.users` creation.
