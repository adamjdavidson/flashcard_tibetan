-- Add Tibetan Flag Themes
-- These themes use the colors of the Tibetan flag: #240D70, #DB2014, #F5E202, #64AB71

-- Theme 1: "Tibetan Flag" - Uses flag colors prominently
INSERT INTO themes (name, description, is_default, is_system, colors, created_by)
VALUES (
  'Tibetan Flag',
  'A theme using the traditional colors of the Tibetan flag',
  false,
  true,
  '{
    "bgPrimary": "linear-gradient(135deg, #240D70 0%, #DB2014 100%)",
    "bgSecondary": "rgba(245, 226, 2, 0.15)",
    "bgCard": "#ffffff",
    "bgOverlay": "rgba(36, 13, 112, 0.8)",
    "textPrimary": "#240D70",
    "textSecondary": "#666666",
    "textOnGradient": "#F5E202",
    "textHint": "rgba(245, 226, 2, 0.95)",
    "btnPrimary": "linear-gradient(135deg, #DB2014 0%, #240D70 100%)",
    "btnSecondary": "#F5E202",
    "btnHover": "rgba(245, 226, 2, 0.3)",
    "btnActive": "#64AB71",
    "cardFrontBg": "#ffffff",
    "cardBackBg": "#64AB71",
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
    "border": "rgba(245, 226, 2, 0.4)",
    "borderDark": "#240D70",
    "shadow": "rgba(36, 13, 112, 0.15)",
    "shadowHover": "rgba(36, 13, 112, 0.3)"
  }'::jsonb,
  NULL
) ON CONFLICT (name) DO UPDATE SET colors = EXCLUDED.colors;

-- Theme 2: "Tibetan Flag Subtle" - Uses flag colors more subtly
INSERT INTO themes (name, description, is_default, is_system, colors, created_by)
VALUES (
  'Tibetan Flag Subtle',
  'A subtle theme inspired by Tibetan flag colors',
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

