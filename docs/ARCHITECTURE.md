# NSB Architecture Guide

This document outlines the architectural foundation of **NSB** (Life Operating System).

---

## 1. Architectural Principles

1. **Domain-Driven Modularity**:
   - Each domain resides within `src/modules/[module_name]`.
   - Domains contain their own types, schemas, repositories, services, errors, and domain-specific utilities.
   - Domains do NOT reach into other domains' internal database tables directly; cross-module composition is coordinated through domain services (e.g. Dashboard service).

2. **Clean Separation of Concerns**:
   ```text
   UI / Route Handler / Server Action (Presentation Layer)
             ↓
   Module Service (Business Logic & Validation Layer)
             ↓
   Module Repository (Data Access Layer)
             ↓
   Supabase Client / PostgreSQL (Persistence Layer)
   ```

3. **Server vs. Client Responsibilities**:
   - **Server Components & Server Actions / Route Handlers**: Perform data fetching, database mutations, session validation, and strict Zod schema validation.
   - **Client Components**: Handle local UI interactions and form state (React Hook Form). Client code never accesses raw database credentials or service-role keys.
   - **Supabase SSR**: Uses `@supabase/ssr` cookies strategy to synchronize session tokens seamlessly across Server Components, Server Actions, Route Handlers, and Browser clients.

4. **Predictable Domain Vocabulary**:
   - `Habit` & `HabitCompletion`
   - `Expense` & `ExpenseCategory`
   - `Goal`
   - `Task`
   - `Dashboard`
   - `Settings` / `Profile`

---

## 2. Directory Structure

```text
src/
├── app/                      # Next.js App Router (pages, layouts, API routes)
│   ├── api/                  # Route handlers (health, webhooks)
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Minimal placeholder entry point
├── lib/                      # Core cross-cutting infrastructure
│   ├── errors/               # Domain and Application error classes & handlers
│   │   ├── app-error.ts
│   │   └── error-handler.ts
│   ├── supabase/             # Supabase clients & auth helpers
│   │   ├── client.ts         # Browser client
│   │   ├── server.ts         # Server client (SSR cookies)
│   │   ├── admin.ts          # Service role client (server-only tasks)
│   │   └── middleware.ts     # Auth token refresh middleware
│   └── utils/                # Pure shared utility functions
│       ├── cn.ts             # Tailwind class merging
│       └── date.utils.ts     # Date manipulation helpers
├── modules/                  # Domain-driven modules
│   ├── habits/
│   │   ├── habits.types.ts
│   │   ├── habits.schema.ts
│   │   ├── habits.errors.ts
│   │   ├── habits.repository.ts
│   │   ├── habits.service.ts
│   │   └── habits.utils.ts
│   ├── expenses/
│   │   ├── expenses.types.ts
│   │   ├── expenses.schema.ts
│   │   ├── expenses.errors.ts
│   │   ├── expenses.repository.ts
│   │   ├── expenses.service.ts
│   │   └── expenses.utils.ts
│   ├── goals/
│   │   ├── goals.types.ts
│   │   ├── goals.schema.ts
│   │   ├── goals.errors.ts
│   │   ├── goals.repository.ts
│   │   ├── goals.service.ts
│   │   └── goals.utils.ts
│   ├── tasks/
│   │   ├── tasks.types.ts
│   │   ├── tasks.schema.ts
│   │   ├── tasks.errors.ts
│   │   ├── tasks.repository.ts
│   │   ├── tasks.service.ts
│   │   └── tasks.utils.ts
│   ├── dashboard/
│   │   ├── dashboard.types.ts
│   │   ├── dashboard.service.ts
│   │   └── dashboard.utils.ts
│   └── settings/
│       ├── settings.types.ts
│       ├── settings.schema.ts
│       ├── settings.errors.ts
│       ├── settings.repository.ts
│       └── settings.service.ts
├── types/                    # Generated and global database types
│   └── database.types.ts
└── middleware.ts             # Next.js edge middleware
```

---

## 3. Error Handling Strategy

1. **Standardized Hierarchy**:
   - All known errors extend `AppError`.
   - Specific domain errors: `HabitNotFoundError`, `ExpenseNotFoundError`, `GoalNotFoundError`, `TaskNotFoundError`, `ProfileNotFoundError`.
   - Security errors: `UnauthorizedError`, `ForbiddenError`.
   - Validation errors: `ValidationError` wrapping Zod error formatting.

2. **Result Pattern**:
   Services return standard result objects or throw domain errors caught by upper presentation/action layers, guaranteeing consistent API response structures:
   ```ts
   type Result<T> = { success: true; data: T } | { success: false; error: ErrorPayload };
   ```
