-- Migration: Add audio_url column to cards table
-- Created: 2025-11-03
-- Feature: Audio Pronunciation for Cards (002-audio-pronunciation)

-- Add audio_url column to cards table
ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS audio_url TEXT NULL;

-- Add index for filtering cards with audio
CREATE INDEX IF NOT EXISTS idx_cards_audio_url 
ON cards(audio_url) 
WHERE audio_url IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN cards.audio_url IS 'Optional URL to pronunciation audio file in Supabase Storage (card-audio bucket). MP3 format, 64-96 kbps, max 30 seconds.';

