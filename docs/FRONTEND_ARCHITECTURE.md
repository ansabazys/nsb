# NSB Frontend Architecture & Guide

This document defines the frontend architectural foundation, conventions, and module expansion guide for **NSB** (Personal Life Operating System).

---

## 1. Architectural Philosophy

1. **Structure Over Decoration**:
   - The foundation emphasizes clean domain boundaries, strong TypeScript typing, Server vs. Client component separation, and form validation over decorative UI styling.
   - UI styling and themes can be applied cleanly on top of this foundation without refactoring business logic or data pipelines.

2. **Domain-Driven Modularity**:
   - Each Life OS domain (Habits, Expenses, Goals, Tasks, Dashboard, Settings) is encapsulated in its own module inside `src/modules/<module-name>/`.
   - Domain logic, mutations, and domain-specific UI components reside strictly within the module directory.

3. **Separation of Presentation & Business Logic**:
   ```text
   UI Component (View / Presentational)
             ↓
   Module Hook (useHabits, useExpenses, etc.)
             ↓
   Server Action / Service (habits.actions.ts / habits.service.ts)
             ↓
   Module Repository (habits.repository.ts)
             ↓
   Supabase Database / PostgreSQL
   ```

4. **Server vs. Client Boundaries**:
   - **Server Components (Default)**: Route pages (`page.tsx`), layout wrappers (`layout.tsx`), and initial data fetchers.
   - **Client Components (`"use client"`)**: Interactive views, modals, forms (`react-hook-form`), and state management hooks.

---

## 2. Directory Structure

```text
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Unauthenticated route group
│   │   ├── layout.tsx            # Centered auth card layout
│   │   ├── login/page.tsx        # Sign-in route
│   │   └── signup/page.tsx       # Sign-up route
│   ├── (app)/                    # Authenticated route group
│   │   ├── layout.tsx            # AppShell layout with navigation
│   │   ├── loading.tsx           # App group loading boundary
│   │   ├── error.tsx             # App group error boundary
│   │   ├── dashboard/page.tsx    # Dashboard entry point
│   │   ├── habits/page.tsx       # Habits entry point
│   │   ├── expenses/page.tsx     # Expenses entry point
│   │   ├── goals/page.tsx        # Goals entry point
│   │   ├── tasks/page.tsx        # Tasks entry point
│   │   └── settings/page.tsx     # Settings entry point
│   ├── api/                      # Route handlers
│   ├── error.tsx                 # Root error boundary
│   ├── globals.css               # Global Tailwind CSS
│   ├── layout.tsx                # Root HTML layout
│   ├── loading.tsx               # Root loading boundary
│   ├── not-found.tsx             # Global 404 page
│   └── page.tsx                  # Root landing page / redirect
│
├── components/                   # Shared and generic components
│   ├── layout/                   # Application shell & header components
│   │   ├── app-header.tsx
│   │   ├── app-nav.tsx
│   │   ├── app-shell.tsx
│   │   └── user-nav.tsx
│   ├── shared/                   # Cross-cutting UI structural components
│   │   ├── confirm-dialog.tsx
│   │   ├── empty-state.tsx
│   │   ├── error-state.tsx
│   │   ├── loading-state.tsx
│   │   └── page-header.tsx
│   └── ui/                       # Unstyled / structural UI primitives
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── select.tsx
│       └── textarea.tsx
│
├── lib/                          # Core infrastructure
│   ├── errors/                   # AppError and domain error classes
│   ├── supabase/                 # Browser, server, admin, and middleware clients
│   │   ├── client.ts             # Browser Supabase client
│   │   ├── server.ts             # Server Supabase client (cookie-based SSR)
│   │   ├── admin.ts              # Service-role Supabase client
│   │   ├── auth.ts               # getCurrentUser & requireCurrentUser
│   │   └── middleware.ts         # Session refresh middleware
│   └── utils/                    # Shared pure utility functions
│       ├── cn.ts                 # ClassName merging
│       └── date.utils.ts         # Date format & calculation helpers
│
├── modules/                      # Domain Modules
│   ├── dashboard/                # Daily summary & productivity scoring
│   ├── expenses/                 # Expense tracking & monthly category breakdown
│   ├── goals/                    # Milestones & progress tracking
│   ├── habits/                   # Daily rituals & streak calculation
│   ├── settings/                 # Profile & user preferences
│   └── tasks/                    # Action items & priority queues
│
├── types/                        # Core & cross-cutting TypeScript types
│   ├── actions.types.ts          # Standardized ActionResult<T>
│   ├── database.types.ts         # Generated Supabase schema types
│   └── navigation.types.ts       # Navigation config & route definitions
│
└── middleware.ts                 # Next.js Edge Auth Middleware
```

---

## 3. Component Architecture & Boundaries

Components are organized into four distinct tiers:

| Tier | Directory | Responsibility | Domain Knowledge? |
|---|---|---|---|
| **UI Primitives** | `src/components/ui/` | Reusable structural elements (`Button`, `Input`, `Select`, `Textarea`, `Card`, `Badge`, `Dialog`) | ❌ None |
| **Shared Components** | `src/components/shared/` | Shared UX states (`PageHeader`, `EmptyState`, `LoadingState`, `ErrorState`, `ConfirmDialog`) | ❌ Generic |
| **Layout Components** | `src/components/layout/` | Shell, navigation, user menu (`AppHeader`, `AppNav`, `AppShell`, `UserNav`) | ❌ App-level only |
| **Domain Components** | `src/modules/<module>/components/` | Domain-specific widgets, lists, forms, and item views | ✅ Domain-specific |

---

## 4. Data Flow & Mutation Pattern

### 1. Data Fetching (Server Components)
Server components fetch data directly using domain services and the cookie-authenticated server Supabase client:

```tsx
// src/app/(app)/habits/page.tsx
export default async function HabitsPage() {
  const user = await requireCurrentUser();
  const supabase = await createServerSupabaseClient();
  const habitsService = new HabitsService(supabase);
  const habits = await habitsService.getUserHabits(user.id);

  return <HabitsView initialHabits={habits} />;
}
```

### 2. Mutations (Server Actions)
Mutations execute in `src/modules/<module>/<module>.actions.ts`:
- Authenticate via `requireCurrentUser()`
- Validate inputs using Zod schemas (`.schema.ts`)
- Invoke domain service logic (`.service.ts`)
- Revalidate paths with `revalidatePath`
- Return standardized `ActionResult<T>`:

```ts
type ActionResult<T = void> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[] | undefined> };
```

### 3. Forms (React Hook Form + Zod)
Interactive forms use `react-hook-form` paired with `@hookform/resolvers/zod`:

```tsx
const { register, handleSubmit, formState: { errors } } = useForm<CreateHabitInput>({
  resolver: zodResolver(CreateHabitSchema),
  defaultValues: { name: "", frequency: "daily", targetPerPeriod: 1 },
});
```

---

## 5. Step-by-Step Guide: Adding a New Frontend Module

To add a new domain module (e.g. `journal` or `fitness`):

### Step 1: Create the Module Directory
Create `src/modules/<module-name>/`:
```text
src/modules/<module-name>/
├── components/
│   ├── <module-name>-view.tsx    # Main interactive client view container
│   ├── <module-name>-list.tsx    # List presentation component
│   ├── <module-name>-item.tsx    # Item row / card component
│   └── <module-name>-form.tsx    # Zod + React Hook Form component
├── hooks/
│   └── use-<module-name>.ts      # Client hook managing state & optimistic updates
├── <module-name>.actions.ts      # Server actions (mutations & revalidation)
├── <module-name>.errors.ts       # Domain error classes (extends AppError)
├── <module-name>.repository.ts   # Database CRUD operations
├── <module-name>.schema.ts       # Zod validation schemas
├── <module-name>.service.ts      # Business logic orchestration
├── <module-name>.types.ts        # Domain models & DTOs
└── <module-name>.utils.ts        # Pure domain calculations & pure functions
```

### Step 2: Create the Route Page
Create `src/app/(app)/<module-name>/page.tsx`:
```tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ModuleService } from "@/modules/<module-name>/<module-name>.service";
import { ModuleView } from "@/modules/<module-name>/components/<module-name>-view";

export const dynamic = "force-dynamic";

export default async function ModulePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createServerSupabaseClient();
  const service = new ModuleService(supabase);
  const data = await service.getUserItems(user.id);

  return <ModuleView initialItems={data} />;
}
```

### Step 3: Register in Navigation
Update `src/types/navigation.types.ts`:
```ts
export const APP_NAV_ITEMS: NavItem[] = [
  ...
  { title: "Journal", href: "/journal" },
];
```

### Step 4: Verify Implementation
Run automated verification:
```powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```
