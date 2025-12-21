ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.members.onboarding_completed IS 'Whether member completed onboarding flow';
