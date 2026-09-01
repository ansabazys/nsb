# NSB Database Schema

This document details the PostgreSQL database schema, data relationships, integrity constraints, and Row Level Security (RLS) policies for **NSB**.

---

## 1. Entity Relationship Overview

```text
auth.users (Supabase Auth)
   │
   ▼ (1:1)
profiles ──┬── (1:N) ── habits ────────── (1:N) ── habit_completions
           │
           ├── (1:N) ── expense_categories (1:N) ── expenses
           │                                          │
           ├── (1:N) ─────────────────────────────────┘
           │
           ├── (1:N) ── goals ────────── (1:N nullable) ── tasks
           │                                                │
           └── (1:N) ───────────────────────────────────────┘
```

---

## 2. Entities & Field Definitions

### `profiles`
Mirrors authenticated Supabase user accounts (`auth.users`). Auto-created on user sign-up via database trigger.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, REFERENCES `auth.users(id)` ON DELETE CASCADE | User UUID |
| `email` | TEXT | NOT NULL | User email address |
| `full_name` | TEXT | NULLABLE | Display name |
| `avatar_url` | TEXT | NULLABLE | Profile picture URL |
| `timezone` | TEXT | NOT NULL DEFAULT 'UTC' | User timezone preference |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Registration timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Last update timestamp |

---

### `habits`
Stores habit definitions configured by the user.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Unique habit identifier |
| `user_id` | UUID | NOT NULL REFERENCES `profiles(id)` ON DELETE CASCADE | Owner ID |
| `name` | TEXT | NOT NULL | Habit title |
| `description` | TEXT | NULLABLE | Optional notes / motivation |
| `frequency` | habit_frequency | NOT NULL DEFAULT 'daily' | `daily`, `weekly`, `custom` |
| `target_per_period` | INTEGER | NOT NULL DEFAULT 1 CHECK (> 0) | Target frequency count |
| `is_archived` | BOOLEAN | NOT NULL DEFAULT FALSE | Soft archive flag |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Last update timestamp |

---

### `habit_completions`
Stores individual daily completion logs for habits.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Log ID |
| `habit_id` | UUID | NOT NULL REFERENCES `habits(id)` ON DELETE CASCADE | Associated habit |
| `user_id` | UUID | NOT NULL REFERENCES `profiles(id)` ON DELETE CASCADE | Owner ID |
| `completed_date` | DATE | NOT NULL | Calendar date (YYYY-MM-DD) |
| `notes` | TEXT | NULLABLE | Optional log notes |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Timestamp of log creation |

*Unique Constraint*: `(habit_id, completed_date)` ensures idempotency and prevents duplicate completion records on the same day.

---

### `expense_categories`
Hierarchical spending categories, supporting both system presets and user-defined custom categories.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Category ID |
| `user_id` | UUID | NULLABLE REFERENCES `profiles(id)` ON DELETE CASCADE | NULL for system categories |
| `name` | TEXT | NOT NULL | Category name |
| `icon` | TEXT | NULLABLE | Lucide icon identifier |
| `color` | TEXT | NULLABLE | Hex color code |
| `is_system` | BOOLEAN | NOT NULL DEFAULT FALSE | True if built-in category |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Last update timestamp |

---

### `expenses`
Stores individual financial transactions.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Transaction ID |
| `user_id` | UUID | NOT NULL REFERENCES `profiles(id)` ON DELETE CASCADE | Owner ID |
| `expense_category_id` | UUID | NOT NULL REFERENCES `expense_categories(id)` ON DELETE RESTRICT | Category FK |
| `amount` | NUMERIC(12,2) | NOT NULL CHECK (amount >= 0) | Monetary value |
| `currency` | TEXT | NOT NULL DEFAULT 'USD' | ISO 4217 currency code |
| `date` | DATE | NOT NULL | Transaction date |
| `description` | TEXT | NULLABLE | Merchant / memo description |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Last update timestamp |

---

### `goals`
Tracks long-term and short-term personal objectives.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Goal ID |
| `user_id` | UUID | NOT NULL REFERENCES `profiles(id)` ON DELETE CASCADE | Owner ID |
| `name` | TEXT | NOT NULL | Goal title |
| `description` | TEXT | NULLABLE | Detailed goal vision |
| `target_value` | NUMERIC(12,2) | NOT NULL CHECK (> 0) | Target quantitative target |
| `current_value` | NUMERIC(12,2) | NOT NULL DEFAULT 0 CHECK (>= 0) | Progress recorded |
| `unit` | TEXT | NULLABLE | Measurement unit (e.g. 'kg', 'books', '$') |
| `deadline` | DATE | NULLABLE | Target completion date |
| `status` | goal_status | NOT NULL DEFAULT 'not_started' | `not_started`, `in_progress`, `completed`, `abandoned` |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Last update timestamp |

---

### `tasks`
Atomic actionable items with priority and status.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Task ID |
| `user_id` | UUID | NOT NULL REFERENCES `profiles(id)` ON DELETE CASCADE | Owner ID |
| `goal_id` | UUID | NULLABLE REFERENCES `goals(id)` ON DELETE SET NULL | Optional parent goal |
| `title` | TEXT | NOT NULL | Task description |
| `description` | TEXT | NULLABLE | Extended notes |
| `status` | task_status | NOT NULL DEFAULT 'pending' | `pending`, `in_progress`, `completed`, `cancelled` |
| `priority` | task_priority | NOT NULL DEFAULT 'medium' | `low`, `medium`, `high`, `urgent` |
| `due_date` | TIMESTAMPTZ | NULLABLE | Due date and time |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Last update timestamp |

---

## 3. Row Level Security (RLS) Rules

All tables have RLS explicitly enabled:
1. **Isolated Tenancy**: All user rows are filtered by `auth.uid() = user_id`.
2. **System Presets**: `expense_categories` permits reading where `is_system = TRUE OR auth.uid() = user_id`.
3. **Safety**: Mutation policies enforce `WITH CHECK (auth.uid() = user_id)` preventing cross-user data insertion or alteration.
