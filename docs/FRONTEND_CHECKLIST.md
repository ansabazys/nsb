# NSB Frontend Foundation Checklist

## Phase 1 — Frontend Audit
- [x] Inspect existing Next.js structure
- [x] Inspect existing components
- [x] Inspect existing routes
- [x] Inspect existing dependencies
- [x] Inspect existing Supabase integration
- [x] Document current frontend structure

## Phase 2 — Application Architecture
- [x] Define route structure
- [x] Define layout hierarchy
- [x] Define module boundaries
- [x] Define shared component boundaries
- [x] Define frontend data flow
- [x] Define server/client boundaries

## Phase 3 — Route Structure
- [x] Create application route structure
- [x] Create dashboard route (`/dashboard`)
- [x] Create habits route (`/habits`)
- [x] Create expenses route (`/expenses`)
- [x] Create goals route (`/goals`)
- [x] Create tasks route (`/tasks`)
- [x] Create settings route (`/settings`)
- [x] Create future-module route strategy

## Phase 4 — Layout Structure
- [x] Create root layout (`src/app/layout.tsx`)
- [x] Create authenticated application layout (`src/app/(app)/layout.tsx` + `AppShell`)
- [x] Create module-level layout strategy
- [x] Create loading boundaries (`src/app/loading.tsx`, `src/app/(app)/loading.tsx`)
- [x] Create error boundaries (`src/app/error.tsx`, `src/app/(app)/error.tsx`)
- [x] Create not-found strategy (`src/app/not-found.tsx`)

## Phase 5 — Module Structure
- [x] Create habits frontend module (`components`, `hooks`, `habits.actions.ts`)
- [x] Create expenses frontend module (`components`, `hooks`, `expenses.actions.ts`)
- [x] Create goals frontend module (`components`, `hooks`, `goals.actions.ts`)
- [x] Create tasks frontend module (`components`, `hooks`, `tasks.actions.ts`)
- [x] Create dashboard frontend module (`components`, `hooks`, `dashboard.service.ts`)
- [x] Create settings frontend module (`components`, `hooks`, `settings.actions.ts`)

## Phase 6 — Components
- [x] Define shared component structure (`src/components/ui/`, `src/components/shared/`, `src/components/layout/`)
- [x] Define module-specific component structure (`src/modules/*/components/`)
- [x] Separate reusable components from domain components
- [x] Avoid premature generic components

## Phase 7 — Data Layer
- [x] Define frontend data access pattern (Server Components direct fetch via Service)
- [x] Define Supabase access pattern (`AppSupabaseClient`, SSR cookie syncing)
- [x] Define server/client data boundaries
- [x] Define mutation pattern (Server Actions returning `ActionResult<T>` with `revalidatePath`)
- [x] Define loading/error/empty state structure (`LoadingState`, `ErrorState`, `EmptyState`)

## Phase 8 — State Management
- [x] Identify server state (Server Components + cache invalidation)
- [x] Identify local UI state (React hooks `useState`, `useTransition`)
- [x] Avoid unnecessary global state
- [x] Define state ownership
- [x] Define future state-management strategy

## Phase 9 — Forms & Validation
- [x] Define form structure
- [x] Define Zod schema location (`src/modules/*/*.schema.ts`)
- [x] Define React Hook Form pattern (`@hookform/resolvers/zod`)
- [x] Define server-side validation boundary (Server Actions + Zod error formatting)

## Phase 10 — Types
- [x] Define domain types
- [x] Define API/data types where necessary (`src/types/actions.types.ts`, `src/types/navigation.types.ts`)
- [x] Avoid duplicate types
- [x] Establish type ownership (`src/modules/*/*.types.ts` and `src/types/database.types.ts`)

## Phase 11 — Verification
- [x] Verify TypeScript (`pnpm typecheck` — 0 errors)
- [x] Verify linting (`pnpm lint` — 0 warnings, 0 errors)
- [x] Verify imports (clean `@/*` paths)
- [x] Verify route structure (all 10 route bundles generated)
- [x] Verify build (`pnpm build` — successful production build)
- [x] Verify pnpm test (`pnpm test` — 36/36 tests passed)

## Phase 12 — Documentation
- [x] Document frontend architecture (`docs/FRONTEND_ARCHITECTURE.md`)
- [x] Document route structure
- [x] Document module structure
- [x] Document component conventions
- [x] Document naming conventions
- [x] Document how to add a new module

---

## Architectural Decisions & Audit Notes
1. **Server vs. Client Balance**:
   - Every page (`/dashboard`, `/habits`, `/expenses`, `/goals`, `/tasks`, `/settings`) is a Server Component that authenticates the user, creates a scoped Supabase server client, loads domain data, and passes it to an interactive client view component (`HabitsView`, `ExpensesView`, etc.).
2. **Standardized Mutation Envelope**:
   - All server actions return `ActionResult<T>` (`ActionSuccess<T> | ActionError`) with typed field errors for instant form feedback.
3. **Form Validation Strategy**:
   - `react-hook-form` paired with `@hookform/resolvers/zod` validates user input on the client using the exact same Zod schema that enforces security on the server in `*.actions.ts`.
4. **Clean Component Hierarchy**:
   - `src/components/ui/`: Base unstyled semantic components (`Button`, `Input`, `Select`, `Textarea`, `Card`, `Badge`, `Dialog`).
   - `src/components/shared/`: Cross-module state components (`PageHeader`, `EmptyState`, `LoadingState`, `ErrorState`, `ConfirmDialog`).
   - `src/components/layout/`: App shell, navigation, and auth layouts (`AppShell`, `AppHeader`, `AppNav`, `UserNav`).
   - `src/modules/<domain>/components/`: Pure domain-specific UI.
