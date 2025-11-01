-- Test queries for Phase 1 Migration (T012)
-- Run these in Supabase SQL Editor to verify the migration

-- 1. Verify tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('categories', 'instruction_levels', 'card_categories');

-- 2. Verify instruction_level_id column added to cards
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'cards' AND column_name = 'instruction_level_id';

-- 3. Verify default instruction levels seeded
SELECT name, "order", is_default, description 
FROM instruction_levels 
ORDER BY "order";

-- Expected result: 3 rows
-- Beginner (order: 1, is_default: true)
-- Intermediate (order: 2, is_default: true)
-- Advanced (order: 3, is_default: true)

-- 4. Verify indexes created
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('categories', 'instruction_levels', 'card_categories', 'cards')
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Expected indexes:
-- idx_categories_name (on categories)
-- idx_instruction_levels_order (on instruction_levels)
-- idx_card_categories_card_id (on card_categories)
-- idx_card_categories_category_id (on card_categories)
-- idx_cards_instruction_level_id (on cards)

-- 5. Verify RLS policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('categories', 'instruction_levels')
ORDER BY tablename, policyname;

-- Expected policies:
-- categories: "Anyone can read categories" (SELECT)
-- categories: "Admins can manage categories" (ALL)
-- instruction_levels: "Anyone can read instruction_levels" (SELECT)
-- instruction_levels: "Admins can manage instruction_levels" (ALL)

-- 6. Test reading categories (should work for anyone)
SELECT * FROM categories LIMIT 5;

-- 7. Test reading instruction levels (should work for anyone)
SELECT * FROM instruction_levels ORDER BY "order";

