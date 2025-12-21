-- Link timetables to time slot master
ALTER TABLE public.timetables
  ADD COLUMN IF NOT EXISTS time_slot_id UUID;

-- Backfill time_slot_id based on period
UPDATE public.timetables t
SET time_slot_id = s.id
FROM public.timetable_time_slots s
WHERE t.time_slot_id IS NULL
  AND t.period = s.period;

-- Add foreign key constraint
ALTER TABLE public.timetables
  ADD CONSTRAINT timetables_time_slot_id_fkey
  FOREIGN KEY (time_slot_id)
  REFERENCES public.timetable_time_slots(id)
  ON DELETE SET NULL;

-- Optional index for lookups
CREATE INDEX IF NOT EXISTS idx_timetables_time_slot_id
  ON public.timetables(time_slot_id);
