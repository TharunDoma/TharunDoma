-- Create portfolio_images table
CREATE TABLE IF NOT EXISTS portfolio_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_data TEXT NOT NULL, -- Base64 encoded image
  image_type VARCHAR(50) DEFAULT 'gallery', -- 'profile', 'background', 'gallery'
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE portfolio_images ENABLE ROW LEVEL SECURITY;

-- Public read policy
CREATE POLICY "Allow public read" ON portfolio_images
  FOR SELECT USING (true);

-- Authenticated insert policy
CREATE POLICY "Allow authenticated insert" ON portfolio_images
  FOR INSERT WITH CHECK (true);

-- Authenticated update policy
CREATE POLICY "Allow authenticated update" ON portfolio_images
  FOR UPDATE USING (true);

-- Authenticated delete policy
CREATE POLICY "Allow authenticated delete" ON portfolio_images
  FOR DELETE USING (true);
