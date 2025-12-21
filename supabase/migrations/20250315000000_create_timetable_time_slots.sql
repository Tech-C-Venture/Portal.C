-- Create timetable time slots master table
CREATE TABLE IF NOT EXISTS public.timetable_time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period INTEGER NOT NULL CHECK (period BETWEEN 1 AND 10),
  label TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (period)
);

-- Add comments
COMMENT ON TABLE public.timetable_time_slots IS 'Master list of class time slots';
COMMENT ON COLUMN public.timetable_time_slots.period IS 'Class period number';
COMMENT ON COLUMN public.timetable_time_slots.label IS 'Display label for the time slot';
COMMENT ON COLUMN public.timetable_time_slots.start_time IS 'Start time';
COMMENT ON COLUMN public.timetable_time_slots.end_time IS 'End time';
COMMENT ON COLUMN public.timetable_time_slots.is_active IS 'Whether this slot is currently active';

-- Create updated_at trigger
CREATE TRIGGER update_timetable_time_slots_updated_at
  BEFORE UPDATE ON public.timetable_time_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.timetable_time_slots ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read time slots
CREATE POLICY "Time slots are viewable by everyone"
  ON public.timetable_time_slots FOR SELECT
  USING (true);
