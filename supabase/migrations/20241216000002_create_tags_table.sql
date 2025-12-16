-- Create tags table for skills and interests
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('skill', 'interest')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create member_tags junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.member_tags (
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (member_id, tag_id)
);

-- Create indexes for faster lookups
CREATE INDEX idx_tags_category ON public.tags(category);
CREATE INDEX idx_member_tags_member_id ON public.member_tags(member_id);
CREATE INDEX idx_member_tags_tag_id ON public.member_tags(tag_id);

-- Add comments
COMMENT ON TABLE public.tags IS 'Skills and interests tags';
COMMENT ON TABLE public.member_tags IS 'Many-to-many relationship between members and tags';

-- Enable Row Level Security
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_tags ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read tags
CREATE POLICY "Tags are viewable by everyone"
  ON public.tags FOR SELECT
  USING (true);

-- Policy: Anyone can create new tags
CREATE POLICY "Anyone can create tags"
  ON public.tags FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can read member_tags
CREATE POLICY "Member tags are viewable by everyone"
  ON public.member_tags FOR SELECT
  USING (true);

-- Policy: Members can manage their own tags
CREATE POLICY "Members can manage own tags"
  ON public.member_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.members
      WHERE members.id = member_tags.member_id
      AND members.zitadel_id = auth.jwt() ->> 'sub'
    )
  );
