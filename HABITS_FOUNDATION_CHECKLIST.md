# NSB Habits Foundation Checklist

## Phase 1
- [x] Inspect existing habit architecture, schema, and dashboard timeline input.

## Phase 2
- [x] Define extensible types, categories, priorities, schedules, and measurable targets in the database migration.

## Phase 3
- [x] Define prayer settings, location fallback requirements, and AlAdhan-backed prayer-time service.

## Phase 4
- [x] Add database migration, indexes, ownership constraints, and RLS policies.

## Phase 5
- [x] Add daily and weekly default habit definitions for later user-specific seeding.

## Phase 6
- [x] Implement date/location/settings-aware prayer fetching.
- [ ] Wire the daily-prayer cache repository after applying the migration.

## Phase 7
- [x] Define normalized TimelineItem contract for habits, prayers, tasks, and events.
- [ ] Connect the contract to the existing dashboard after the migrated data is available.

## Phase 8
- [ ] Apply migration to Supabase and test RLS with authenticated users.

## Phase 9
- [ ] Run typecheck, lint, build, and development-server verification after generating Supabase database types.
