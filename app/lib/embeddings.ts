import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabaseServer as supabase } from './supabaseServer';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Generate embeddings for text using Gemini API
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'embedding-001' });
    
    const result = await model.embedContent(text);
    const embedding = result.embedding.values;
    
    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

/**
 * Store embedding for a document chunk
 */
export async function storeEmbedding(
  documentId: string,
  chunkText: string,
  chunkIndex: number,
  metadata?: Record<string, any>
) {
  try {
    const embedding = await generateEmbedding(chunkText);
    
    const { error } = await supabase
      .from('document_embeddings')
      .insert([
        {
          document_id: documentId,
          embedding,
          chunk_text: chunkText,
          chunk_index: chunkIndex,
          metadata
        }
      ]);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error storing embedding:', error);
    throw error;
  }
}

/**
 * Semantic search - find relevant documents based on query
 */
export async function semanticSearch(
  query: string,
  limit: number = 5,
  threshold: number = 0.7
): Promise<any[]> {
  try {
    const queryEmbedding = await generateEmbedding(query);
    
    // Use Supabase vector similarity search (pgvector)
    const { data, error } = await supabase.rpc(
      'match_documents',
      {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: limit
      }
    );
    
    if (error) {
      console.warn('Vector search failed, using keyword search instead:', error);
      return await keywordSearch(query, limit);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in semantic search:', error);
    // Fallback to keyword search
    return await keywordSearch(query, limit);
  }
}

/**
 * Fallback keyword search
 */
export async function keywordSearch(query: string, limit: number = 5) {
  try {
    const { data, error } = await supabase
      .from('training_documents')
      .select('*')
      .eq('is_active', true)
      .textSearch('extracted_text', query)
      .limit(limit);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error in keyword search:', error);
    return [];
  }
}

/**
 * Get current status from database
 */
export async function getCurrentStatus(): Promise<{
  status: string;
  message: string;
  endDate?: string;
} | null> {
  try {
    const { data, error } = await supabase
      .from('profile_status_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data) return null;
    
    // Check if status is still active
    if (data.end_date && new Date(data.end_date) < new Date()) {
      return null; // Status expired
    }
    
    return {
      status: data.status,
      message: data.status_message,
      endDate: data.end_date
    };
  } catch (error) {
    console.error('Error getting current status:', error);
    return null;
  }
}

/**
 * Create SQL function for vector search (run once in Supabase)
 */
export const createVectorSearchFunction = `
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  chunk_text text,
  similarity float
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    de.id,
    de.document_id,
    de.chunk_text,
    1 - (de.embedding <=> query_embedding) as similarity
  FROM document_embeddings de
  WHERE 1 - (de.embedding <=> query_embedding) > match_threshold
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
$$;
`;
