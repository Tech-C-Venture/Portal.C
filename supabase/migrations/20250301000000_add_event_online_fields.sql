ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS online_url TEXT,
  ADD COLUMN IF NOT EXISTS online_password TEXT;

COMMENT ON COLUMN public.events.online_url IS 'Online meeting URL (Meet/Zoom)';
COMMENT ON COLUMN public.events.online_password IS 'Online meeting password (optional)';
