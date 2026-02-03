import { NextResponse } from 'next/server';
import { supabaseServer } from '../../lib/supabaseServer';
import pdfParse from 'pdf-parse';

export const runtime = 'nodejs';

export async function POST() {
  try {
    // Fetch docs needing extraction (null extracted_text OR placeholder text)
    const { data: docs, error } = await supabaseServer
      .from('training_documents')
      .select('id, file_name, file_type, document_data, extracted_text')
      .or('extracted_text.is.null,extracted_text.like.PDF:%,extracted_text.like.Word Document:%');

    if (error) {
      return NextResponse.json({ success: false, message: 'Failed to fetch documents', error }, { status: 500 });
    }

    if (!docs || docs.length === 0) {
      return NextResponse.json({ success: true, processed: 0, message: 'No documents require processing' });
    }

    let processed = 0;
    const results: Array<{ id: string; file_name: string; status: string }> = [];

    for (const doc of docs) {
      try {
        let text = '';
        const fileType = doc.file_type?.toLowerCase() || '';
        
        if (fileType.includes('pdf')) {
          if (!doc.document_data) {
            results.push({ id: doc.id, file_name: doc.file_name, status: 'skipped: no document_data' });
            continue;
          }
          // Remove data URL prefix if present (data:application/pdf;base64,...)
          const base64Data = doc.document_data.includes(',') 
            ? doc.document_data.split(',')[1] 
            : doc.document_data;
          const buffer = Buffer.from(base64Data, 'base64');
          const parsed = await pdfParse(buffer);
          text = parsed.text?.trim() || '';
        } else if (fileType.includes('text')) {
          if (!doc.document_data) {
            results.push({ id: doc.id, file_name: doc.file_name, status: 'skipped: no document_data' });
            continue;
          }
          const decoded = Buffer.from(doc.document_data, 'base64').toString('utf8');
          text = decoded.trim();
        } else {
          results.push({ id: doc.id, file_name: doc.file_name, status: `skipped: unsupported type ${doc.file_type}` });
          continue;
        }

        if (!text) {
          results.push({ id: doc.id, file_name: doc.file_name, status: 'skipped: empty extracted text' });
          continue;
        }

        const { error: updateError } = await supabaseServer
          .from('training_documents')
          .update({ extracted_text: text, updated_at: new Date().toISOString() })
          .eq('id', doc.id);

        if (updateError) {
          results.push({ id: doc.id, file_name: doc.file_name, status: `error: ${updateError.message}` });
        } else {
          processed += 1;
          results.push({ id: doc.id, file_name: doc.file_name, status: 'processed' });
        }
      } catch (e: any) {
        results.push({ id: doc.id, file_name: doc.file_name, status: `error: ${e?.message || 'unknown'}` });
      }
    }

    return NextResponse.json({ success: true, processed, results });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Unexpected error', error: (err as any)?.message }, { status: 500 });
  }
}
