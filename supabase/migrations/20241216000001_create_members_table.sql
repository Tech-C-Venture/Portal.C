-- Create members table
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- ZITADEL user ID (sub claim from OIDC)
  zitadel_id TEXT UNIQUE NOT NULL,

  -- Basic information
  name TEXT NOT NULL,
  school_email TEXT NOT NULL,
  gmail_address TEXT,

  -- Academic information
  enrollment_year INTEGER NOT NULL,
  is_repeating BOOLEAN DEFAULT false,
  major TEXT,

  -- Current status (24-hour limited)
  current_status TEXT,
  status_updated_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on zitadel_id for faster lookups
CREATE INDEX idx_members_zitadel_id ON public.members(zitadel_id);

-- Create index on enrollment_year for filtering
CREATE INDEX idx_members_enrollment_year ON public.members(enrollment_year);

-- Create function to automatically calculate current grade
CREATE OR REPLACE FUNCTION calculate_current_grade(
  enrollment_year INTEGER,
  is_repeating BOOLEAN
) RETURNS INTEGER AS $$
DECLARE
  current_year INTEGER;
  base_grade INTEGER;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  base_grade := current_year - enrollment_year + 1;

  -- If repeating, add 1 year
  IF is_repeating THEN
    base_grade := base_grade - 1;
  END IF;

  RETURN base_grade;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add comment to table
COMMENT ON TABLE public.members IS 'Tech.C Venture members information';
COMMENT ON COLUMN public.members.zitadel_id IS 'ZITADEL user ID (sub claim from OIDC)';
COMMENT ON COLUMN public.members.school_email IS 'School email address (public)';
COMMENT ON COLUMN public.members.gmail_address IS 'Gmail address (private, admin only)';
COMMENT ON COLUMN public.members.current_status IS 'Current status message (24-hour limited)';
COMMENT ON COLUMN public.members.status_updated_at IS 'Timestamp when status was last updated';

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read member profiles (except gmail_address)
CREATE POLICY "Members are viewable by everyone"
  ON public.members FOR SELECT
  USING (true);

-- Policy: Members can update their own profile
CREATE POLICY "Members can update own profile"
  ON public.members FOR UPDATE
  USING (zitadel_id = auth.jwt() ->> 'sub');

-- Policy: Only admins can insert new members
CREATE POLICY "Only admins can insert members"
  ON public.members FOR INSERT
  WITH CHECK (
    (auth.jwt() -> 'roles') ? 'admin'
  );
