-- Habit recurrence, prayer settings, and cached daily prayer times.
CREATE TYPE habit_kind AS ENUM ('boolean', 'measurable', 'scheduled', 'flexible');
CREATE TYPE habit_category AS ENUM ('worship', 'health', 'fitness', 'work', 'learning', 'personal', 'family', 'reflection', 'sleep');
CREATE TYPE habit_priority AS ENUM ('core', 'important', 'optional');
CREATE TYPE prayer_juristic_school AS ENUM ('standard', 'hanafi');

ALTER TABLE public.habits
  ADD COLUMN kind habit_kind NOT NULL DEFAULT 'boolean',
  ADD COLUMN category habit_category NOT NULL DEFAULT 'personal',
  ADD COLUMN priority habit_priority NOT NULL DEFAULT 'important',
  ADD COLUMN schedule_weekdays SMALLINT[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',
  ADD COLUMN target_time TIME,
  ADD COLUMN target_end_time TIME,
  ADD COLUMN target_value NUMERIC(12,2),
  ADD COLUMN target_unit TEXT,
  ADD CONSTRAINT habits_schedule_weekdays_valid CHECK (schedule_weekdays <@ ARRAY[0,1,2,3,4,5,6]::SMALLINT[]),
  ADD CONSTRAINT habits_measurable_target CHECK ((kind <> 'measurable') OR (target_value IS NOT NULL AND target_unit IS NOT NULL));

CREATE INDEX idx_habits_user_schedule ON public.habits(user_id, is_archived, priority);

CREATE TABLE public.prayer_settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  location_label TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  calculation_method INTEGER NOT NULL DEFAULT 3,
  juristic_school prayer_juristic_school NOT NULL DEFAULT 'standard',
  minute_adjustments JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT prayer_settings_coordinates_pair CHECK ((latitude IS NULL) = (longitude IS NULL))
);
CREATE TRIGGER trigger_prayer_settings_updated_at BEFORE UPDATE ON public.prayer_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE public.daily_prayer_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  prayer_date DATE NOT NULL,
  timezone TEXT NOT NULL,
  settings_fingerprint TEXT NOT NULL,
  fajr TIME NOT NULL,
  dhuhr TIME NOT NULL,
  asr TIME NOT NULL,
  maghrib TIME NOT NULL,
  isha TIME NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT daily_prayer_times_unique_settings UNIQUE(user_id, prayer_date, settings_fingerprint)
);
CREATE INDEX idx_daily_prayer_times_lookup ON public.daily_prayer_times(user_id, prayer_date DESC);

ALTER TABLE public.prayer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_prayer_times ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own prayer settings" ON public.prayer_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage their own daily prayer times" ON public.daily_prayer_times FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

GRANT ALL ON public.prayer_settings, public.daily_prayer_times TO authenticated, service_role;
