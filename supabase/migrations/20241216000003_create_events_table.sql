-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  capacity INTEGER,
  created_by UUID REFERENCES public.members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create event_participants junction table
CREATE TABLE IF NOT EXISTS public.event_participants (
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  participated BOOLEAN DEFAULT false,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (event_id, member_id)
);

-- Create indexes
CREATE INDEX idx_events_event_date ON public.events(event_date);
CREATE INDEX idx_event_participants_event_id ON public.event_participants(event_id);
CREATE INDEX idx_event_participants_member_id ON public.event_participants(member_id);

-- Add comments
COMMENT ON TABLE public.events IS 'Tech.C Venture events';
COMMENT ON TABLE public.event_participants IS 'Event participation tracking';
COMMENT ON COLUMN public.event_participants.participated IS 'Whether the member actually participated (checked by admin)';

-- Create updated_at trigger for events
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read events
CREATE POLICY "Events are viewable by everyone"
  ON public.events FOR SELECT
  USING (true);

-- Policy: Only admins can create/update events
CREATE POLICY "Only admins can create events"
  ON public.events FOR INSERT
  WITH CHECK (
    (auth.jwt() -> 'roles') ? 'admin'
  );

CREATE POLICY "Only admins can update events"
  ON public.events FOR UPDATE
  USING (
    (auth.jwt() -> 'roles') ? 'admin'
  );

-- Policy: Anyone can read event participants
CREATE POLICY "Event participants are viewable by everyone"
  ON public.event_participants FOR SELECT
  USING (true);

-- Policy: Members can register themselves for events
CREATE POLICY "Members can register for events"
  ON public.event_participants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.members
      WHERE members.id = event_participants.member_id
      AND members.zitadel_id = auth.jwt() ->> 'sub'
    )
  );

-- Policy: Members can unregister themselves from events
CREATE POLICY "Members can unregister from events"
  ON public.event_participants FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.members
      WHERE members.id = event_participants.member_id
      AND members.zitadel_id = auth.jwt() ->> 'sub'
    )
  );

-- Policy: Only admins can update participation status
CREATE POLICY "Only admins can update participation"
  ON public.event_participants FOR UPDATE
  USING (
    (auth.jwt() -> 'roles') ? 'admin'
  );

-- Create view for event participation stats
CREATE OR REPLACE VIEW public.event_participation_stats AS
SELECT
  e.id AS event_id,
  e.title,
  e.event_date,
  e.capacity,
  COUNT(ep.member_id) AS registered_count,
  COUNT(ep.member_id) FILTER (WHERE ep.participated = true) AS participated_count,
  CASE
    WHEN e.capacity IS NOT NULL THEN e.capacity - COUNT(ep.member_id)
    ELSE NULL
  END AS available_spots
FROM public.events e
LEFT JOIN public.event_participants ep ON e.id = ep.event_id
GROUP BY e.id, e.title, e.event_date, e.capacity;

-- Grant read access to the view
GRANT SELECT ON public.event_participation_stats TO authenticated, anon;
