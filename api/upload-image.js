/**
 * Image Upload API endpoint
 * Vercel serverless function
 * Uploads images to Supabase Storage
 */

// Vercel serverless function handler
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get Supabase service role key for server-side uploads
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    // Handle multipart/form-data (file upload)
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      // Note: Vercel serverless functions handle FormData differently
      // You may need to use a library like 'formidable' or 'multer'
      // For now, this is a placeholder
      
      // TODO: Implement multipart form data parsing
      // const form = new FormData();
      // const file = req.files?.image;
      
      return res.status(501).json({ error: 'File upload not yet implemented. Please use base64.' });
    }

    // Handle base64 image
    const { image: base64Image } = req.body;

    if (!base64Image || typeof base64Image !== 'string') {
      return res.status(400).json({ error: 'Image is required (base64 string)' });
    }

    // Validate base64 format
    if (!base64Image.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image format. Must be base64 data URL' });
    }

    // Extract image data
    const matches = base64Image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'Invalid base64 image format' });
    }

    const [, imageType, imageData] = matches;
    const validTypes = ['jpeg', 'jpg', 'png', 'gif', 'webp'];
    
    if (!validTypes.includes(imageType.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid image type. Must be JPEG, PNG, GIF, or WebP' });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(imageData, 'base64');

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (buffer.length > maxSize) {
      return res.status(400).json({ error: 'Image size must be less than 5MB' });
    }

    // Generate filename
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${imageType}`;
    const filePath = `card-images/${fileName}`;

    // Upload to Supabase Storage using service role key
    // Import Supabase at top level (will be available in Node.js environment)
    let supabase;
    try {
      const { createClient } = await import('@supabase/supabase-js');
      supabase = createClient(supabaseUrl, supabaseServiceKey);
    } catch (importError) {
      console.error('Error importing Supabase:', importError);
      return res.status(500).json({ error: 'Supabase client initialization failed' });
    }

    const { error } = await supabase.storage
      .from('card-images')
      .upload(filePath, buffer, {
        contentType: `image/${imageType}`,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ error: error.message || 'Upload failed' });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('card-images')
      .getPublicUrl(filePath);

    return res.status(200).json({
      imageUrl: urlData.publicUrl,
      size: buffer.length
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return res.status(500).json({ 
      error: error.message || 'Image upload failed' 
    });
  }
}

