-- Supabase Storage RLS Policies for card-images bucket
-- This migration sets up Row Level Security policies for image storage

-- Allow public read access to card-images
-- (Anyone can view images)
DROP POLICY IF EXISTS "Public read access for card-images" ON storage.objects;
CREATE POLICY "Public read access for card-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'card-images');

-- Allow authenticated users to upload to card-images
-- (Only logged-in users can upload)
DROP POLICY IF EXISTS "Authenticated users can upload to card-images" ON storage.objects;
CREATE POLICY "Authenticated users can upload to card-images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'card-images'
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to update their own uploads
-- (Users can update files they uploaded)
DROP POLICY IF EXISTS "Authenticated users can update card-images" ON storage.objects;
CREATE POLICY "Authenticated users can update card-images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'card-images'
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to delete their own uploads
-- (Users can delete files they uploaded)
DROP POLICY IF EXISTS "Authenticated users can delete card-images" ON storage.objects;
CREATE POLICY "Authenticated users can delete card-images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'card-images'
    AND auth.role() = 'authenticated'
  );