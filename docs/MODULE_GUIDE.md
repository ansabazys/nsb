# NSB Module Expansion Guide

This guide explains how to add a new domain module to **NSB** (e.g., *Journal*, *Fitness*, *Time Tracking*, *Subscriptions*).

---

## 1. Domain Directory Structure

Create a folder under `src/modules/<module-name>/`:

```text
src/modules/<module-name>/
├── <module-name>.types.ts         # Domain models, DTOs, and input interfaces
├── <module-name>.schema.ts        # Zod validation schemas
├── <module-name>.errors.ts        # Domain-specific error classes (extends AppError / NotFoundError)
├── <module-name>.utils.ts         # Pure domain calculations and helpers (no DB side-effects)
├── <module-name>.repository.ts    # Supabase SQL queries and row mappers
└── <module-name>.service.ts       # Domain service orchestrating validation and logic
```

---

## 2. Step-by-Step Implementation Workflow

### Step 1: Database Migration
1. Create a migration file in `supabase/migrations/` (e.g. `20260902000000_add_journal_module.sql`).
2. Define the table with:
   - UUID primary key (`DEFAULT gen_random_uuid()`)
   - `user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE`
   - `created_at` and `updated_at` with the `trigger_updated_at` hook
   - Appropriate indexes on `user_id` and query columns
   - Row Level Security (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`)
   - Granular RLS policies (`auth.uid() = user_id`)

### Step 2: Update Database Types
Add the new table row and insert/update definitions to `src/types/database.types.ts`.

### Step 3: Define Domain Types & Zod Schemas
1. Create `<module-name>.types.ts` with clean camelCase types.
2. Create `<module-name>.schema.ts` with Zod validation rules.

### Step 4: Write Pure Business Logic & Utils
Implement calculations and domain rules in `<module-name>.utils.ts` as pure, unit-testable functions.

### Step 5: Implement Repository & Service
1. In `<module-name>.repository.ts`, write queries using `this.supabase.from(...)` and map rows to domain objects.
2. In `<module-name>.service.ts`, validate input with Zod, apply business logic, and delegate storage to the repository.

### Step 6: Connect to Dashboard (If applicable)
If the new module provides daily metrics, update `src/modules/dashboard/dashboard.service.ts` to consume the new service's summary method without tightly coupling database queries.

### Step 7: Add Verification Tests
Add test cases in `scripts/verify-foundation.ts` to assert calculations and schema rules.
