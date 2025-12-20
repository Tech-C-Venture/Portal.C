ALTER TABLE public.timetables
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS grade INTEGER,
  ADD COLUMN IF NOT EXISTS major TEXT,
  ADD COLUMN IF NOT EXISTS classroom TEXT,
  ADD COLUMN IF NOT EXISTS instructor TEXT;

CREATE INDEX IF NOT EXISTS idx_timetables_is_public ON public.timetables(is_public);

COMMENT ON COLUMN public.timetables.is_public IS 'Public timetable entry flag';
COMMENT ON COLUMN public.timetables.grade IS 'Target grade for public timetable';
COMMENT ON COLUMN public.timetables.major IS 'Target major for public timetable';
COMMENT ON COLUMN public.timetables.classroom IS 'Classroom for public timetable';
COMMENT ON COLUMN public.timetables.instructor IS 'Instructor name for public timetable';
