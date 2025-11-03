-- Supabase Storage RLS Policies for card-audio bucket
-- This migration sets up Row Level Security policies for audio storage
-- Feature: Audio Pronunciation for Cards (002-audio-pronunciation)

-- Allow public read access to card-audio
-- (Anyone can listen to audio files for playback)
DROP POLICY IF EXISTS "Public read access for card-audio" ON storage.objects;
CREATE POLICY "Public read access for card-audio"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'card-audio');

-- Allow only admin users to upload to card-audio
-- (Only admins can upload pronunciation audio files)
DROP POLICY IF EXISTS "Admins can upload to card-audio" ON storage.objects;
CREATE POLICY "Admins can upload to card-audio"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'card-audio'
    AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Allow only admin users to update audio files
-- (Only admins can update pronunciation audio files)
DROP POLICY IF EXISTS "Admins can update card-audio" ON storage.objects;
CREATE POLICY "Admins can update card-audio"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'card-audio'
    AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Allow only admin users to delete audio files
-- (Only admins can delete pronunciation audio files)
DROP POLICY IF EXISTS "Admins can delete card-audio" ON storage.objects;
CREATE POLICY "Admins can delete card-audio"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'card-audio'
    AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

