import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabaseClient';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const secret = formData.get('secret') as string;
    const message = formData.get('message') as string;
    const mode = formData.get('mode') as 'image' | 'resume';
    const files = formData.getAll('files') as File[];

    // 1. Security Check
    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, reply: "Access Denied. Wrong Code." }, { status: 401 });
    }

    if (files.length === 0) {
      return NextResponse.json({ success: false, reply: "No files uploaded." }, { status: 400 });
    }

    // 2. Process based on mode
    if (mode === 'image') {
      return await handleImageUpload(files, message);
    } else if (mode === 'resume') {
      return await handleResumeAnalysis(files[0], message);
    }

    return NextResponse.json({ success: false, reply: "Invalid mode." });

  } catch (error) {
    console.error("Multimodal API Error:", error);
    return NextResponse.json({ 
      success: false, 
      reply: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}

// Handle image upload with AI vision
async function handleImageUpload(files: File[], instructions: string) {
  try {
    const uploadedImages = [];

    for (const file of files) {
      // Convert to base64 for AI analysis
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${file.type};base64,${base64}`;

      // 1. Analyze image with Vision AI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this image for a portfolio website. 
                User instruction: "${instructions}"
                
                Please provide:
                1. Image description
                2. Suggested aspect ratio (e.g., 16:9, 1:1, 4:3)
                3. Best placement on portfolio (hero, about, projects, gallery)
                4. SEO-friendly alt text
                
                Return as JSON: { "description": "", "aspectRatio": "", "placement": "", "altText": "" }`
              },
              {
                type: "image_url",
                image_url: { url: dataUrl }
              }
            ]
          }
        ],
        max_tokens: 500,
      });

      const analysis = JSON.parse(completion.choices[0].message.content || "{}");

      // 2. Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 3. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(fileName);

      uploadedImages.push({
        ...analysis,
        url: publicUrl,
        filename: file.name
      });
    }

    // 4. Store image metadata in database
    for (const img of uploadedImages) {
      await supabase.from('portfolio_images').insert({
        url: img.url,
        description: img.description,
        aspect_ratio: img.aspectRatio,
        placement: img.placement,
        alt_text: img.altText,
        created_at: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      reply: `✅ Uploaded ${uploadedImages.length} image(s)!\n\n` +
             uploadedImages.map((img, i) => 
               `Image ${i + 1}:\n` +
               `📸 ${img.description}\n` +
               `📐 Suggested ratio: ${img.aspectRatio}\n` +
               `📍 Best placement: ${img.placement}\n` +
               `🔗 URL: ${img.url}`
             ).join('\n\n')
    });

  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
}

// Handle resume/document analysis
async function handleResumeAnalysis(file: File, instructions: string) {
  try {
    // 1. Extract text from file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let fileText = '';

    if (file.type === 'application/pdf') {
      // For PDF, we'll use OpenAI file upload
      const uploadedFile = await openai.files.create({
        file: new File([buffer], file.name, { type: file.type }),
        purpose: 'assistants'
      });

      // Use assistant to extract and analyze
      const assistant = await openai.beta.assistants.create({
        model: "gpt-4o",
        instructions: `Extract all text from the uploaded resume/document.`
      });

      const thread = await openai.beta.threads.create();
      
      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: "Extract all text from this document",
        attachments: [{ file_id: uploadedFile.id, tools: [{ type: "file_search" }] }]
      });

      const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
        assistant_id: assistant.id
      });

      const messages = await openai.beta.threads.messages.list(thread.id);
      fileText = messages.data[0]?.content[0]?.type === 'text' 
        ? messages.data[0].content[0].text.value 
        : '';

    } else {
      // For text files
      fileText = buffer.toString('utf-8');
    }

    // 2. Analyze with AI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert resume analyzer and content generator. 
          Analyze the resume and extract key information to generate professional portfolio content.`
        },
        {
          role: "user",
          content: `Analyze this resume and ${instructions}

Resume Content:
${fileText}

Please generate:
1. Professional "About Me" bio (2-3 sentences)
2. List of top 5 skills
3. Key projects/experiences
4. Suggested job title

Return as JSON: {
  "full_name": "",
  "job_title": "",
  "about_bio": "",
  "skills": [],
  "projects": []
}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(completion.choices[0].message.content || "{}");

    // 3. Update Supabase with generated content
    const updates = [];
    
    if (analysis.full_name) {
      await supabase.from('profile').update({ content: analysis.full_name }).eq('section_name', 'full_name');
      updates.push(`Name: ${analysis.full_name}`);
    }
    
    if (analysis.job_title) {
      await supabase.from('profile').update({ content: analysis.job_title }).eq('section_name', 'job_title');
      updates.push(`Job Title: ${analysis.job_title}`);
    }
    
    if (analysis.about_bio) {
      await supabase.from('profile').update({ content: analysis.about_bio }).eq('section_name', 'about_bio');
      updates.push(`Bio: ${analysis.about_bio}`);
    }

    return NextResponse.json({
      success: true,
      reply: `✅ Resume analyzed successfully!\n\n` +
             `📋 Extracted Information:\n\n` +
             updates.join('\n\n') +
             (analysis.skills ? `\n\n🎯 Skills: ${analysis.skills.join(', ')}` : '') +
             (analysis.projects ? `\n\n💼 Projects:\n${analysis.projects.map((p: any) => `• ${p}`).join('\n')}` : '')
    });

  } catch (error) {
    console.error('Resume analysis error:', error);
    throw error;
  }
}
