-- Add Multiple Themes including Tibetan Flag Colors
-- This creates several theme variations for users to choose from

-- Theme 1: "Tibetan Flag Classic" - Bold use of all flag colors
INSERT INTO themes (name, description, is_default, is_system, colors, created_by)
VALUES (
  'Tibetan Flag Classic',
  'Bold theme using all traditional Tibetan flag colors',
  false,
  true,
  '{
    "bgPrimary": "linear-gradient(135deg, #240D70 0%, #DB2014 50%, #F5E202 100%)",
    "bgSecondary": "rgba(245, 226, 2, 0.2)",
    "bgCard": "#ffffff",
    "bgOverlay": "rgba(36, 13, 112, 0.85)",
    "textPrimary": "#240D70",
    "textSecondary": "#666666",
    "textOnGradient": "#F5E202",
    "textHint": "rgba(245, 226, 2, 0.95)",
    "btnPrimary": "linear-gradient(135deg, #DB2014 0%, #240D70 100%)",
    "btnSecondary": "#F5E202",
    "btnHover": "rgba(245, 226, 2, 0.4)",
    "btnActive": "#64AB71",
    "cardFrontBg": "#ffffff",
    "cardBackBg": "#64AB71",
    "cardBorder": "#240D70",
    "cardShadow": "rgba(36, 13, 112, 0.25)",
    "accentSuccess": "#64AB71",
    "accentWarning": "#F5E202",
    "accentError": "#DB2014",
    "accentInfo": "#240D70",
    "ratingForgot": "#DB2014",
    "ratingPartial": "#F5E202",
    "ratingHard": "#64AB71",
    "ratingEasy": "#240D70",
    "border": "rgba(245, 226, 2, 0.5)",
    "borderDark": "#240D70",
    "shadow": "rgba(36, 13, 112, 0.2)",
    "shadowHover": "rgba(36, 13, 112, 0.4)"
  }'::jsonb,
  NULL
) ON CONFLICT (name) DO UPDATE SET colors = EXCLUDED.colors;

-- Theme 2: "Tibetan Flag Subtle" - More subtle use of flag colors
INSERT INTO themes (name, description, is_default, is_system, colors, created_by)
VALUES (
  'Tibetan Flag Subtle',
  'Subtle theme inspired by Tibetan flag colors',
  false,
  true,
  '{
    "bgPrimary": "linear-gradient(135deg, #64AB71 0%, #240D70 100%)",
    "bgSecondary": "rgba(100, 171, 113, 0.2)",
    "bgCard": "#ffffff",
    "bgOverlay": "rgba(36, 13, 112, 0.5)",
    "textPrimary": "#240D70",
    "textSecondary": "#666666",
    "textOnGradient": "#ffffff",
    "textHint": "rgba(255, 255, 255, 0.9)",
    "btnPrimary": "linear-gradient(135deg, #64AB71 0%, #240D70 100%)",
    "btnSecondary": "#e5e7eb",
    "btnHover": "rgba(100, 171, 113, 0.3)",
    "btnActive": "#F5E202",
    "cardFrontBg": "#ffffff",
    "cardBackBg": "#f9fafb",
    "cardBorder": "#64AB71",
    "cardShadow": "rgba(36, 13, 112, 0.1)",
    "accentSuccess": "#64AB71",
    "accentWarning": "#F5E202",
    "accentError": "#DB2014",
    "accentInfo": "#240D70",
    "ratingForgot": "#DB2014",
    "ratingPartial": "#F5E202",
    "ratingHard": "#64AB71",
    "ratingEasy": "#240D70",
    "border": "rgba(100, 171, 113, 0.3)",
    "borderDark": "#240D70",
    "shadow": "rgba(36, 13, 112, 0.1)",
    "shadowHover": "rgba(36, 13, 112, 0.2)"
  }'::jsonb,
  NULL
) ON CONFLICT (name) DO UPDATE SET colors = EXCLUDED.colors;

-- Theme 3: "Tibetan Mountain" - Green and blue mountain theme
INSERT INTO themes (name, description, is_default, is_system, colors, created_by)
VALUES (
  'Tibetan Mountain',
  'Inspired by Tibetan mountains - green and blue',
  false,
  true,
  '{
    "bgPrimary": "linear-gradient(135deg, #64AB71 0%, #240D70 100%)",
    "bgSecondary": "rgba(36, 13, 112, 0.15)",
    "bgCard": "#ffffff",
    "bgOverlay": "rgba(36, 13, 112, 0.7)",
    "textPrimary": "#240D70",
    "textSecondary": "#555555",
    "textOnGradient": "#ffffff",
    "textHint": "rgba(255, 255, 255, 0.95)",
    "btnPrimary": "linear-gradient(135deg, #64AB71 0%, #240D70 100%)",
    "btnSecondary": "#e8f5e9",
    "btnHover": "rgba(100, 171, 113, 0.25)",
    "btnActive": "#ffffff",
    "cardFrontBg": "#ffffff",
    "cardBackBg": "#f1f8f4",
    "cardBorder": "#64AB71",
    "cardShadow": "rgba(36, 13, 112, 0.15)",
    "accentSuccess": "#64AB71",
    "accentWarning": "#F5E202",
    "accentError": "#DB2014",
    "accentInfo": "#240D70",
    "ratingForgot": "#DB2014",
    "ratingPartial": "#F5E202",
    "ratingHard": "#64AB71",
    "ratingEasy": "#240D70",
    "border": "rgba(100, 171, 113, 0.3)",
    "borderDark": "#240D70",
    "shadow": "rgba(36, 13, 112, 0.12)",
    "shadowHover": "rgba(36, 13, 112, 0.25)"
  }'::jsonb,
  NULL
) ON CONFLICT (name) DO UPDATE SET colors = EXCLUDED.colors;

-- Theme 4: "Tibetan Sunset" - Red and yellow warm theme
INSERT INTO themes (name, description, is_default, is_system, colors, created_by)
VALUES (
  'Tibetan Sunset',
  'Warm red and yellow theme inspired by Tibetan sunsets',
  false,
  true,
  '{
    "bgPrimary": "linear-gradient(135deg, #DB2014 0%, #F5E202 100%)",
    "bgSecondary": "rgba(245, 226, 2, 0.25)",
    "bgCard": "#ffffff",
    "bgOverlay": "rgba(219, 32, 20, 0.8)",
    "textPrimary": "#240D70",
    "textSecondary": "#555555",
    "textOnGradient": "#ffffff",
    "textHint": "rgba(255, 255, 255, 0.95)",
    "btnPrimary": "linear-gradient(135deg, #DB2014 0%, #F5E202 100%)",
    "btnSecondary": "#fff3cd",
    "btnHover": "rgba(245, 226, 2, 0.35)",
    "btnActive": "#ffffff",
    "cardFrontBg": "#ffffff",
    "cardBackBg": "#fffef5",
    "cardBorder": "#F5E202",
    "cardShadow": "rgba(219, 32, 20, 0.15)",
    "accentSuccess": "#64AB71",
    "accentWarning": "#F5E202",
    "accentError": "#DB2014",
    "accentInfo": "#240D70",
    "ratingForgot": "#DB2014",
    "ratingPartial": "#F5E202",
    "ratingHard": "#64AB71",
    "ratingEasy": "#240D70",
    "border": "rgba(245, 226, 2, 0.4)",
    "borderDark": "#DB2014",
    "shadow": "rgba(219, 32, 20, 0.15)",
    "shadowHover": "rgba(219, 32, 20, 0.3)"
  }'::jsonb,
  NULL
) ON CONFLICT (name) DO UPDATE SET colors = EXCLUDED.colors;

-- Theme 5: "Tibetan Blue" - Deep blue theme
INSERT INTO themes (name, description, is_default, is_system, colors, created_by)
VALUES (
  'Tibetan Blue',
  'Deep blue theme using Tibetan flag blue',
  false,
  true,
  '{
    "bgPrimary": "linear-gradient(135deg, #240D70 0%, #1a0a50 100%)",
    "bgSecondary": "rgba(36, 13, 112, 0.2)",
    "bgCard": "#ffffff",
    "bgOverlay": "rgba(36, 13, 112, 0.85)",
    "textPrimary": "#240D70",
    "textSecondary": "#555555",
    "textOnGradient": "#F5E202",
    "textHint": "rgba(245, 226, 2, 0.95)",
    "btnPrimary": "linear-gradient(135deg, #240D70 0%, #1a0a50 100%)",
    "btnSecondary": "#e5e7eb",
    "btnHover": "rgba(36, 13, 112, 0.3)",
    "btnActive": "#ffffff",
    "cardFrontBg": "#ffffff",
    "cardBackBg": "#f9fafb",
    "cardBorder": "#240D70",
    "cardShadow": "rgba(36, 13, 112, 0.2)",
    "accentSuccess": "#64AB71",
    "accentWarning": "#F5E202",
    "accentError": "#DB2014",
    "accentInfo": "#240D70",
    "ratingForgot": "#DB2014",
    "ratingPartial": "#F5E202",
    "ratingHard": "#64AB71",
    "ratingEasy": "#240D70",
    "border": "rgba(36, 13, 112, 0.3)",
    "borderDark": "#240D70",
    "shadow": "rgba(36, 13, 112, 0.15)",
    "shadowHover": "rgba(36, 13, 112, 0.3)"
  }'::jsonb,
  NULL
) ON CONFLICT (name) DO UPDATE SET colors = EXCLUDED.colors;

-- Theme 6: "Tibetan Green" - Green nature theme
INSERT INTO themes (name, description, is_default, is_system, colors, created_by)
VALUES (
  'Tibetan Green',
  'Green nature theme using Tibetan flag green',
  false,
  true,
  '{
    "bgPrimary": "linear-gradient(135deg, #64AB71 0%, #4a8a57 100%)",
    "bgSecondary": "rgba(100, 171, 113, 0.2)",
    "bgCard": "#ffffff",
    "bgOverlay": "rgba(74, 138, 87, 0.7)",
    "textPrimary": "#1a5c2e",
    "textSecondary": "#555555",
    "textOnGradient": "#ffffff",
    "textHint": "rgba(255, 255, 255, 0.95)",
    "btnPrimary": "linear-gradient(135deg, #64AB71 0%, #4a8a57 100%)",
    "btnSecondary": "#e8f5e9",
    "btnHover": "rgba(100, 171, 113, 0.3)",
    "btnActive": "#ffffff",
    "cardFrontBg": "#ffffff",
    "cardBackBg": "#f1f8f4",
    "cardBorder": "#64AB71",
    "cardShadow": "rgba(74, 138, 87, 0.15)",
    "accentSuccess": "#64AB71",
    "accentWarning": "#F5E202",
    "accentError": "#DB2014",
    "accentInfo": "#240D70",
    "ratingForgot": "#DB2014",
    "ratingPartial": "#F5E202",
    "ratingHard": "#64AB71",
    "ratingEasy": "#240D70",
    "border": "rgba(100, 171, 113, 0.3)",
    "borderDark": "#4a8a57",
    "shadow": "rgba(74, 138, 87, 0.12)",
    "shadowHover": "rgba(74, 138, 87, 0.25)"
  }'::jsonb,
  NULL
) ON CONFLICT (name) DO UPDATE SET colors = EXCLUDED.colors;

-- Theme 7: "Ocean Blue" - Cool blue theme (non-Tibetan, variety)
INSERT INTO themes (name, description, is_default, is_system, colors, created_by)
VALUES (
  'Ocean Blue',
  'Cool ocean blue theme for a refreshing look',
  false,
  true,
  '{
    "bgPrimary": "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
    "bgSecondary": "rgba(59, 130, 246, 0.2)",
    "bgCard": "#ffffff",
    "bgOverlay": "rgba(30, 64, 175, 0.7)",
    "textPrimary": "#1e3a8a",
    "textSecondary": "#555555",
    "textOnGradient": "#ffffff",
    "textHint": "rgba(255, 255, 255, 0.95)",
    "btnPrimary": "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
    "btnSecondary": "#e0e7ff",
    "btnHover": "rgba(59, 130, 246, 0.3)",
    "btnActive": "#ffffff",
    "cardFrontBg": "#ffffff",
    "cardBackBg": "#f5f9ff",
    "cardBorder": "#3b82f6",
    "cardShadow": "rgba(30, 64, 175, 0.15)",
    "accentSuccess": "#10b981",
    "accentWarning": "#f59e0b",
    "accentError": "#ef4444",
    "accentInfo": "#3b82f6",
    "ratingForgot": "#ef4444",
    "ratingPartial": "#f59e0b",
    "ratingHard": "#10b981",
    "ratingEasy": "#3b82f6",
    "border": "rgba(59, 130, 246, 0.3)",
    "borderDark": "#1e40af",
    "shadow": "rgba(30, 64, 175, 0.12)",
    "shadowHover": "rgba(30, 64, 175, 0.25)"
  }'::jsonb,
  NULL
) ON CONFLICT (name) DO UPDATE SET colors = EXCLUDED.colors;

-- Theme 8: "Forest Green" - Natural green theme (non-Tibetan, variety)
INSERT INTO themes (name, description, is_default, is_system, colors, created_by)
VALUES (
  'Forest Green',
  'Natural forest green theme',
  false,
  true,
  '{
    "bgPrimary": "linear-gradient(135deg, #10b981 0%, #047857 100%)",
    "bgSecondary": "rgba(16, 185, 129, 0.2)",
    "bgCard": "#ffffff",
    "bgOverlay": "rgba(4, 120, 87, 0.7)",
    "textPrimary": "#065f46",
    "textSecondary": "#555555",
    "textOnGradient": "#ffffff",
    "textHint": "rgba(255, 255, 255, 0.95)",
    "btnPrimary": "linear-gradient(135deg, #10b981 0%, #047857 100%)",
    "btnSecondary": "#d1fae5",
    "btnHover": "rgba(16, 185, 129, 0.3)",
    "btnActive": "#ffffff",
    "cardFrontBg": "#ffffff",
    "cardBackBg": "#f0fdf4",
    "cardBorder": "#10b981",
    "cardShadow": "rgba(4, 120, 87, 0.15)",
    "accentSuccess": "#10b981",
    "accentWarning": "#f59e0b",
    "accentError": "#ef4444",
    "accentInfo": "#3b82f6",
    "ratingForgot": "#ef4444",
    "ratingPartial": "#f59e0b",
    "ratingHard": "#10b981",
    "ratingEasy": "#3b82f6",
    "border": "rgba(16, 185, 129, 0.3)",
    "borderDark": "#047857",
    "shadow": "rgba(4, 120, 87, 0.12)",
    "shadowHover": "rgba(4, 120, 87, 0.25)"
  }'::jsonb,
  NULL
) ON CONFLICT (name) DO UPDATE SET colors = EXCLUDED.colors;

