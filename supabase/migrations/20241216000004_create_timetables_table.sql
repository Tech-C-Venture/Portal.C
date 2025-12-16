-- Create timetables table
CREATE TABLE IF NOT EXISTS public.timetables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
  period INTEGER NOT NULL CHECK (period BETWEEN 1 AND 7), -- 1-7 periods
  course_name TEXT NOT NULL,
  semester TEXT CHECK (semester IN ('spring', 'fall')),
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, day_of_week, period, semester, year)
);

-- Create indexes
CREATE INDEX idx_timetables_member_id ON public.timetables(member_id);
CREATE INDEX idx_timetables_day_period ON public.timetables(day_of_week, period);
CREATE INDEX idx_timetables_semester_year ON public.timetables(semester, year);

-- Add comments
COMMENT ON TABLE public.timetables IS 'Member timetables/schedules';
COMMENT ON COLUMN public.timetables.day_of_week IS 'Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)';
COMMENT ON COLUMN public.timetables.period IS 'Class period (1-7)';
COMMENT ON COLUMN public.timetables.semester IS 'Academic semester (spring/fall)';

-- Create updated_at trigger
CREATE TRIGGER update_timetables_updated_at
  BEFORE UPDATE ON public.timetables
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read timetables
CREATE POLICY "Timetables are viewable by everyone"
  ON public.timetables FOR SELECT
  USING (true);

-- Policy: Members can manage their own timetable
CREATE POLICY "Members can manage own timetable"
  ON public.timetables FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.members
      WHERE members.id = timetables.member_id
      AND members.zitadel_id = auth.jwt() ->> 'sub'
    )
  );

-- Create view for grouped timetable browsing
CREATE OR REPLACE VIEW public.timetable_by_grade_major AS
SELECT
  m.id AS member_id,
  m.name AS member_name,
  calculate_current_grade(m.enrollment_year, m.is_repeating) AS current_grade,
  m.major,
  t.day_of_week,
  t.period,
  t.course_name,
  t.semester,
  t.year
FROM public.members m
JOIN public.timetables t ON m.id = t.member_id
ORDER BY current_grade, m.major, t.day_of_week, t.period;

-- Grant read access to the view
GRANT SELECT ON public.timetable_by_grade_major TO authenticated, anon;
