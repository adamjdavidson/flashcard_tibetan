-- Migration: Advanced Card Classification
-- Adds categories and instruction levels tables for card classification
-- Created: 2025-11-01
-- Feature: Advanced Admin Card Management

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create instruction_levels table first (needed for foreign key in cards table)
CREATE TABLE IF NOT EXISTS instruction_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  "order" INTEGER NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add instruction_level_id column to cards table (after instruction_levels table exists)
ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS instruction_level_id UUID REFERENCES instruction_levels(id) ON DELETE SET NULL;

-- Create card_categories junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS card_categories (
  card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (card_id, category_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_instruction_levels_order ON instruction_levels("order");
CREATE INDEX IF NOT EXISTS idx_card_categories_card_id ON card_categories(card_id);
CREATE INDEX IF NOT EXISTS idx_card_categories_category_id ON card_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_cards_instruction_level_id ON cards(instruction_level_id);

-- Seed default instruction levels
INSERT INTO instruction_levels (name, "order", description, is_default) VALUES
  ('Beginner', 1, 'Beginning level for students new to Tibetan language', true),
  ('Intermediate', 2, 'Intermediate level for students with basic knowledge', true),
  ('Advanced', 3, 'Advanced level for students with strong proficiency', true)
ON CONFLICT (name) DO UPDATE SET
  "order" = EXCLUDED."order",
  description = EXCLUDED.description,
  is_default = EXCLUDED.is_default;

-- Row Level Security (RLS) Policies

-- Enable RLS on new tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE instruction_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_categories ENABLE ROW LEVEL SECURITY;

-- Categories policies

-- Anyone can read categories (for card display)
DROP POLICY IF EXISTS "Anyone can read categories" ON categories;
CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  USING (true);

-- Only admins can manage categories (INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Instruction levels policies

-- Anyone can read instruction levels (for card display)
DROP POLICY IF EXISTS "Anyone can read instruction_levels" ON instruction_levels;
CREATE POLICY "Anyone can read instruction_levels"
  ON instruction_levels FOR SELECT
  USING (true);

-- Only admins can manage instruction levels (INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Admins can manage instruction_levels" ON instruction_levels;
CREATE POLICY "Admins can manage instruction_levels"
  ON instruction_levels FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Card categories policies (inherited from cards and categories policies)
-- RLS is inherited, but we can add explicit policies if needed
-- Admins can manage all associations through their card/category management permissions

-- Function to update updated_at timestamp for categories
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at for categories
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();

