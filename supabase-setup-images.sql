-- Create a table to store image metadata
CREATE TABLE IF NOT EXISTS portfolio_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  description TEXT,
  aspect_ratio TEXT,
  placement TEXT,
  alt_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE portfolio_images ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Public can view images"
  ON portfolio_images
  FOR SELECT
  TO public
  USING (true);

-- Create policy to allow authenticated inserts
CREATE POLICY "Authenticated can insert images"
  ON portfolio_images
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Instructions for Supabase Storage:
-- 1. Go to Supabase Dashboard -> Storage
-- 2. Click "New Bucket"
-- 3. Name it: portfolio-images
-- 4. Make it PUBLIC (check the "Public bucket" option)
-- 5. Click "Create bucket"

-- That's it! Your storage is ready for images.
