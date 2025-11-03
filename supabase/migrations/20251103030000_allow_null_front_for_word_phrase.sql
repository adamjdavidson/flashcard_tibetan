-- Migration: Allow NULL front/back_english for word/phrase cards
-- Created: 2025-11-03
-- Feature: Bidirectional Cards (003-bidirectional-cards)
-- Description: Makes front and back_english nullable for word/phrase cards that use new bidirectional fields

-- Make front nullable (number cards still require it via application logic)
ALTER TABLE cards 
ALTER COLUMN front DROP NOT NULL;

-- Make back_english nullable (already nullable, but being explicit)
-- This is already nullable in the schema, but we'll ensure it
-- (Actually, this column is already nullable, so no change needed)

-- Add comment explaining the change
COMMENT ON COLUMN cards.front IS 'Front content. Required for number cards, optional for word/phrase cards that use tibetan_text/english_text instead.';

