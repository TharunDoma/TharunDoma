import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabaseClient';

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export async function POST(req: Request) {
  try {
    const { fileName, fileType, fileData, category, secret, token } = await req.json();

    // Security check - Support both token (new) and secret (legacy)
    const isAuthorized = token || secret === ADMIN_SECRET;
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, reply: 'Access Denied.' },
        { status: 401 }
      );
    }

    // Extract text from different file types
    let extractedText = '';

    if (fileType.startsWith('image')) {
      // For images, store OCR or just use filename
      extractedText = `Image: ${fileName}. [Image stored and available for AI to analyze]`;
    } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      // PDF - basic text extraction
      extractedText = `PDF: ${fileName}. [Use pdf-parse library if needed, for now treating as binary]`;
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      extractedText = `Word Document: ${fileName}. [Use docx-parser library if needed]`;
    } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      // For text files, decode base64
      try {
        const base64Content = fileData.split(',')[1];
        extractedText = Buffer.from(base64Content, 'base64').toString('utf-8');
      } catch (e) {
        extractedText = fileData;
      }
    } else {
      extractedText = `File: ${fileName} (${fileType})`;
    }

    // Save to database
    const { error, data } = await supabase
      .from('training_documents')
      .insert({
        file_name: fileName,
        file_type: fileType,
        extracted_text: extractedText,
        category,
        document_data: fileData, // Store base64 for backup
        is_active: true
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({
        success: false,
        reply: `Error saving document: ${error.message}`
      });
    }

    return NextResponse.json({
      success: true,
      reply: `✅ Document "${fileName}" added to training data! The AI will now have access to this information.`
    });
  } catch (error) {
    console.error('Training API Error:', error);
    return NextResponse.json({
      success: false,
      reply: `Error: ${error}`
    });
  }
}
