-- Migration: Add theme management support
-- Creates tables for themes (admin-managed presets) and user theme preferences

-- Themes table (admin-created presets)
CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false, -- System themes cannot be deleted
  colors JSONB NOT NULL, -- Store all CSS variable values
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User theme preferences
CREATE TABLE IF NOT EXISTS user_theme_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_id UUID REFERENCES themes(id) ON DELETE SET NULL, -- NULL = custom theme
  custom_colors JSONB, -- User's custom color scheme (if theme_id is NULL)
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_themes_is_default ON themes(is_default);
CREATE INDEX IF NOT EXISTS idx_themes_is_system ON themes(is_system);
CREATE INDEX IF NOT EXISTS idx_user_theme_preferences_user_id ON user_theme_preferences(user_id);

-- RLS Policies
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_theme_preferences ENABLE ROW LEVEL SECURITY;

-- Everyone can read themes
CREATE POLICY "Anyone can read themes" ON themes FOR SELECT USING (true);

-- Only admins can manage themes
CREATE POLICY "Admins can manage themes" ON themes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Users can read/write their own preferences
CREATE POLICY "Users can manage own preferences" ON user_theme_preferences FOR ALL
  USING (user_id = auth.uid());

-- Create default theme from current colors
INSERT INTO themes (name, description, is_default, is_system, colors, created_by)
VALUES (
  'Default Purple',
  'The default purple gradient theme',
  true,
  true,
  '{
    "bgPrimary": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "bgSecondary": "rgba(255, 255, 255, 0.1)",
    "bgCard": "#ffffff",
    "bgOverlay": "rgba(0, 0, 0, 0.5)",
    "textPrimary": "#333333",
    "textSecondary": "#666666",
    "textOnGradient": "#ffffff",
    "textHint": "rgba(255, 255, 255, 0.9)",
    "btnPrimary": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "btnSecondary": "#e5e7eb",
    "btnHover": "rgba(255, 255, 255, 0.3)",
    "btnActive": "#ffffff",
    "cardFrontBg": "#ffffff",
    "cardBackBg": "#f9fafb",
    "cardBorder": "#e5e7eb",
    "cardShadow": "rgba(0, 0, 0, 0.1)",
    "accentSuccess": "#10b981",
    "accentWarning": "#fbbf24",
    "accentError": "#ef4444",
    "accentInfo": "#3b82f6",
    "ratingForgot": "#ef4444",
    "ratingPartial": "#f59e0b",
    "ratingHard": "#10b981",
    "ratingEasy": "#3b82f6",
    "border": "rgba(255, 255, 255, 0.3)",
    "borderDark": "#e5e7eb",
    "shadow": "rgba(0, 0, 0, 0.1)",
    "shadowHover": "rgba(0, 0, 0, 0.2)"
  }'::jsonb,
  NULL
) ON CONFLICT (name) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_themes_updated_at
  BEFORE UPDATE ON themes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_theme_preferences_updated_at
  BEFORE UPDATE ON user_theme_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

