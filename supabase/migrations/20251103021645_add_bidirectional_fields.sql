-- Migration: Add bidirectional fields for word/phrase cards
-- Created: 2025-11-03
-- Feature: Bidirectional Cards (003-bidirectional-cards)
-- Description: Adds tibetan_text and english_text columns to cards table for word/phrase cards

-- Add new language-specific fields for word/phrase cards
ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS tibetan_text TEXT NULL,
ADD COLUMN IF NOT EXISTS english_text TEXT NULL;

-- Add indexes for filtering word/phrase cards with new fields
CREATE INDEX IF NOT EXISTS idx_cards_tibetan_text 
ON cards(tibetan_text) 
WHERE tibetan_text IS NOT NULL AND type IN ('word', 'phrase');

CREATE INDEX IF NOT EXISTS idx_cards_english_text 
ON cards(english_text) 
WHERE english_text IS NOT NULL AND type IN ('word', 'phrase');

-- Add comments for documentation
COMMENT ON COLUMN cards.tibetan_text IS 'Tibetan text content (word/phrase cards only). Replaces position-based front/back fields.';
COMMENT ON COLUMN cards.english_text IS 'English text content (word/phrase cards only). Replaces position-based front/back fields.';

