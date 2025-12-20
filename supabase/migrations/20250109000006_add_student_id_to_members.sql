-- Add student_id column for later input by members
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS student_id TEXT;

COMMENT ON COLUMN public.members.student_id IS 'Student ID entered by member later';

CREATE UNIQUE INDEX IF NOT EXISTS idx_members_student_id
  ON public.members(student_id);
