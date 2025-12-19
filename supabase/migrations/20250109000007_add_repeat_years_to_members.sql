-- Add repeat_years column for repeating members
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS repeat_years INTEGER;

COMMENT ON COLUMN public.members.repeat_years IS 'Number of years repeating (if applicable)';
