-- Migration: Migrate existing word/phrase cards to bidirectional fields
-- Created: 2025-11-03
-- Feature: Bidirectional Cards (003-bidirectional-cards)
-- Description: Populates tibetan_text and english_text from existing front/backEnglish/backTibetanScript fields

-- IMPORTANT: Run this migration AFTER the schema changes are applied
-- This migration populates new fields from old fields based on card subcategory and content

-- Case 1: English-to-Tibetan cards
-- These have English on front, Tibetan on back
UPDATE cards 
SET 
  tibetan_text = back_tibetan_script,
  english_text = front
WHERE type IN ('word', 'phrase')
  AND subcategory = 'english_to_tibetan'
  AND front IS NOT NULL
  AND back_tibetan_script IS NOT NULL
  AND (tibetan_text IS NULL OR english_text IS NULL);

-- Case 2: Tibetan-to-English cards
-- These have Tibetan on front, English on back
UPDATE cards 
SET 
  tibetan_text = front,
  english_text = back_english
WHERE type IN ('word', 'phrase')
  AND subcategory = 'tibetan_to_english'
  AND front IS NOT NULL
  AND back_english IS NOT NULL
  AND (tibetan_text IS NULL OR english_text IS NULL);

-- Case 3: Cards without subcategory - detect based on content
-- Tibetan Unicode range: U+0F00 to U+0FFF
-- If front contains Tibetan, treat as Tibetan-to-English
UPDATE cards 
SET 
  tibetan_text = front,
  english_text = back_english
WHERE type IN ('word', 'phrase')
  AND subcategory IS NULL
  AND front ~ '[\u0F00-\u0FFF]'  -- Front contains Tibetan (Unicode range check)
  AND back_english IS NOT NULL
  AND (tibetan_text IS NULL OR english_text IS NULL);

-- Case 4: Cards without subcategory where front is English
-- If front does NOT contain Tibetan, treat as English-to-Tibetan
UPDATE cards 
SET 
  tibetan_text = back_tibetan_script,
  english_text = front
WHERE type IN ('word', 'phrase')
  AND subcategory IS NULL
  AND front !~ '[\u0F00-\u0FFF]'  -- Front does NOT contain Tibetan
  AND back_tibetan_script IS NOT NULL
  AND (tibetan_text IS NULL OR english_text IS NULL);

-- Validation query (for manual verification)
-- Run this after migration to check results:
-- SELECT 
--   type,
--   COUNT(*) as total,
--   COUNT(tibetan_text) as has_tibetan_text,
--   COUNT(english_text) as has_english_text,
--   COUNT(*) FILTER (WHERE tibetan_text IS NOT NULL AND english_text IS NOT NULL) as migrated
-- FROM cards
-- WHERE type IN ('word', 'phrase')
-- GROUP BY type;

