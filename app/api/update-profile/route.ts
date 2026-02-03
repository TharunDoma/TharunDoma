import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabaseClient';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  try {
    const { message, image, secret, token, imageType, title, description, splineUrl, fileName } = await req.json();

    // Security Check - Support both token (new) and secret (legacy)
    const isAuthorized = token || secret === process.env.ADMIN_SECRET;
    if (!isAuthorized) {
      return NextResponse.json({ success: false, reply: "Access Denied." }, { status: 401 });
    }

    // Handle Spline avatar URL
    if (splineUrl && imageType === 'spline_avatar') {
      try {
        const { error } = await supabase
          .from('portfolio_images')
          .insert({
            title: title || 'AI Assistant',
            description: splineUrl, // Store Spline URL in description field
            image_data: '', // Empty for Spline avatars
            image_type: 'spline_avatar',
            is_active: true
          });

        if (error) {
          console.error('Database insert error:', error);
          return NextResponse.json({ 
            success: false, 
            reply: `Database error: ${error.message}` 
          });
        }

        revalidatePath('/', 'layout');
        return NextResponse.json({ 
          success: true, 
          reply: '✅ 3D Spline avatar saved! 🎮' 
        });
      } catch (err) {
        console.error('Spline save error:', err);
        return NextResponse.json({ success: false, reply: `Error: ${err}` });
      }
    }

    // Handle FBX avatar (including ZIP files with textures)
    if (image && imageType === 'fbx_avatar') {
      try {
        // If it's a ZIP file, we store it as-is and extract on the client side
        // If it's just FBX, we store it directly
        const isZipFile = fileName && (fileName.endsWith('.zip') || fileName.endsWith('.ZIP'));
        
        // Ensure ZIP files have proper MIME type in base64
        let imageData = image;
        if (isZipFile && !image.startsWith('data:application/')) {
          imageData = `data:application/zip;base64,${image.split(',').pop() || image}`;
        }
        
        const { error } = await supabase
          .from('portfolio_images')
          .insert({
            title: title || 'Avatar',
            description: isZipFile ? 'FBX 3D Avatar with textures (ZIP)' : 'FBX 3D Avatar',
            image_data: imageData, // Store as base64 with proper MIME type for ZIP
            image_type: 'fbx_avatar',
            is_active: true
          });

        if (error) {
          console.error('Database insert error:', error);
          return NextResponse.json({ 
            success: false, 
            reply: `Database error: ${error.message}` 
          });
        }

        revalidatePath('/', 'layout');
        const message = isZipFile 
          ? '✅ FBX avatar with textures uploaded! Your 3D roaming avatar is live! 🎬' 
          : '✅ FBX avatar uploaded! Your 3D roaming avatar is live! 🎬';
        
        return NextResponse.json({ 
          success: true, 
          reply: message
        });
      } catch (err) {
        console.error('FBX save error:', err);
        return NextResponse.json({ success: false, reply: `Error: ${err}` });
      }
    }

    // Handle image upload (save base64 directly to database)
    if (image && title) {
      try {
        const { error } = await supabase
          .from('portfolio_images')
          .insert({
            title: title,
            description: description || '',
            image_data: image, // Save base64 directly
            image_type: imageType || 'gallery',
            is_active: true
          });

        if (error) {
          console.error('Database insert error:', error);
          return NextResponse.json({ 
            success: false, 
            reply: `Database error: ${error.message}` 
          });
        }

        revalidatePath('/', 'layout');
        return NextResponse.json({ 
          success: true, 
          reply: `✅ ${imageType === 'profile' ? 'Profile picture' : imageType === 'background' ? 'Background image' : 'Gallery image'} saved! 📸` 
        });
        
      } catch (err) {
        console.error('Image save error:', err);
        return NextResponse.json({ success: false, reply: `Error: ${err}` });
      }
    }

    // Handle text updates
    if (message && message.trim()) {
      const messageLower = message.toLowerCase();
      let section_name = '';
      let content = '';

      if (messageLower.includes('name') || messageLower.includes('full name')) {
        section_name = 'full_name';
        const match = message.match(/to ['"]?([^'"]+)['"]?/i) || message.match(/['"]([^'"]+)['"]/);
        content = match ? match[1].trim() : message.split('to')[1]?.trim() || '';
      } 
      else if (messageLower.includes('job') || messageLower.includes('title')) {
        section_name = 'job_title';
        const match = message.match(/to ['"]?([^'"]+)['"]?/i) || message.match(/['"]([^'"]+)['"]/);
        content = match ? match[1].trim() : message.split('to')[1]?.trim() || '';
      }
      else if (messageLower.includes('headline') || messageLower.includes('hero')) {
        section_name = 'hero_headline';
        const match = message.match(/to ['"]?([^'"]+)['"]?/i) || message.match(/['"]([^'"]+)['"]/);
        content = match ? match[1].trim() : message.split('to')[1]?.trim() || '';
      }
      else if (messageLower.includes('bio') || messageLower.includes('about')) {
        section_name = 'about_bio';
        const match = message.match(/to ['"]?([^'"]+)['"]?/i) || message.match(/['"]([^'"]+)['"]/);
        content = match ? match[1].trim() : message.split('to')[1]?.trim() || '';
      }

      if (section_name && content) {
        const { error } = await supabase
          .from('profile')
          .update({ content })
          .eq('section_name', section_name);

        if (error) {
          return NextResponse.json({ success: false, reply: `Update failed: ${error.message}` });
        }

        revalidatePath('/', 'layout');
        return NextResponse.json({ 
          success: true, 
          reply: `✅ Updated ${section_name}! ✨`
        });
      }
    }

    return NextResponse.json({ 
      success: false, 
      reply: "Please provide either an image with title or a text update command." 
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, reply: `Error: ${error}` });
  }
}
