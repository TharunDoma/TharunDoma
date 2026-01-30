-- Create training_documents table
CREATE TABLE IF NOT EXISTS training_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name TEXT NOT NULL,
  file_type VARCHAR(50), -- 'pdf', 'docx', 'image', 'text'
  extracted_text TEXT, -- Full extracted text from document
  file_size INT,
  category VARCHAR(50), -- 'resume', 'project', 'certification', 'achievement', 'general'
  document_data TEXT, -- Base64 for backup
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_history table
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_message TEXT NOT NULL,
  ai_response TEXT,
  relevant_documents TEXT[], -- IDs of documents used for context
  session_id VARCHAR(255), -- Group conversations by session
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create knowledge_base table (for manual achievements/updates)
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50), -- 'achievement', 'update', 'skill', 'experience'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE training_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- Public read, authenticated write on training_documents
CREATE POLICY "Allow public read docs" ON training_documents
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated insert docs" ON training_documents
  FOR INSERT WITH CHECK (true);

-- Public read on chat history (just metadata, not sensitive)
CREATE POLICY "Allow public read chat" ON chat_history
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert chat" ON chat_history
  FOR INSERT WITH CHECK (true);

-- Public read on knowledge_base
CREATE POLICY "Allow public read kb" ON knowledge_base
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated insert kb" ON knowledge_base
  FOR INSERT WITH CHECK (true);
