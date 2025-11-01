/**
 * Theme Color Tokens
 * Defines all colorable elements in the application
 * These values are used as CSS variable names and in the theme editor
 */

export const THEME_TOKENS = {
  // Background colors
  bgPrimary: {
    label: 'Background Primary',
    description: 'Main app background gradient',
    category: 'Background',
    default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    type: 'gradient' // gradient | color
  },
  bgSecondary: {
    label: 'Background Secondary',
    description: 'Secondary background (cards, stats box)',
    category: 'Background',
    default: 'rgba(255, 255, 255, 0.1)',
    type: 'color'
  },
  bgCard: {
    label: 'Card Background',
    description: 'Background for cards and forms',
    category: 'Background',
    default: '#ffffff',
    type: 'color'
  },
  bgOverlay: {
    label: 'Overlay Background',
    description: 'Modal and overlay backgrounds',
    category: 'Background',
    default: 'rgba(0, 0, 0, 0.5)',
    type: 'color'
  },

  // Text colors
  textPrimary: {
    label: 'Text Primary',
    description: 'Main text color',
    category: 'Text',
    default: '#333333',
    type: 'color'
  },
  textSecondary: {
    label: 'Text Secondary',
    description: 'Secondary text color',
    category: 'Text',
    default: '#666666',
    type: 'color'
  },
  textOnGradient: {
    label: 'Text on Gradient',
    description: 'Text color over gradient background',
    category: 'Text',
    default: '#ffffff',
    type: 'color'
  },
  textHint: {
    label: 'Hint Text',
    description: 'Hint and helper text color',
    category: 'Text',
    default: 'rgba(255, 255, 255, 0.9)',
    type: 'color'
  },

  // Button colors
  btnPrimary: {
    label: 'Button Primary',
    description: 'Primary button background',
    category: 'Buttons',
    default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    type: 'gradient'
  },
  btnSecondary: {
    label: 'Button Secondary',
    description: 'Secondary button background',
    category: 'Buttons',
    default: '#e5e7eb',
    type: 'color'
  },
  btnHover: {
    label: 'Button Hover',
    description: 'Button hover state',
    category: 'Buttons',
    default: 'rgba(255, 255, 255, 0.3)',
    type: 'color'
  },
  btnActive: {
    label: 'Button Active',
    description: 'Active button state',
    category: 'Buttons',
    default: '#ffffff',
    type: 'color'
  },

  // Flashcard colors
  cardFrontBg: {
    label: 'Flashcard Front Background',
    description: 'Front side of flashcard',
    category: 'Flashcard',
    default: '#ffffff',
    type: 'color'
  },
  cardBackBg: {
    label: 'Flashcard Back Background',
    description: 'Back side of flashcard',
    category: 'Flashcard',
    default: '#f9fafb',
    type: 'color'
  },
  cardBorder: {
    label: 'Flashcard Border',
    description: 'Flashcard border color',
    category: 'Flashcard',
    default: '#e5e7eb',
    type: 'color'
  },
  cardShadow: {
    label: 'Flashcard Shadow',
    description: 'Flashcard shadow color',
    category: 'Flashcard',
    default: 'rgba(0, 0, 0, 0.1)',
    type: 'color'
  },

  // Accent colors
  accentSuccess: {
    label: 'Success Accent',
    description: 'Success messages and badges',
    category: 'Accents',
    default: '#10b981',
    type: 'color'
  },
  accentWarning: {
    label: 'Warning Accent',
    description: 'Warning messages and badges',
    category: 'Accents',
    default: '#fbbf24',
    type: 'color'
  },
  accentError: {
    label: 'Error Accent',
    description: 'Error messages and badges',
    category: 'Accents',
    default: '#ef4444',
    type: 'color'
  },
  accentInfo: {
    label: 'Info Accent',
    description: 'Info messages and badges',
    category: 'Accents',
    default: '#3b82f6',
    type: 'color'
  },

  // Rating button colors
  ratingForgot: {
    label: 'Forgot Rating',
    description: 'Forgot button color',
    category: 'Rating Buttons',
    default: '#ef4444',
    type: 'color'
  },
  ratingPartial: {
    label: 'Partial Recall Rating',
    description: 'Partial recall button color',
    category: 'Rating Buttons',
    default: '#f59e0b',
    type: 'color'
  },
  ratingHard: {
    label: 'Hard Recall Rating',
    description: 'Hard recall button color',
    category: 'Rating Buttons',
    default: '#10b981',
    type: 'color'
  },
  ratingEasy: {
    label: 'Easy Recall Rating',
    description: 'Easy recall button color',
    category: 'Rating Buttons',
    default: '#3b82f6',
    type: 'color'
  },

  // Borders and shadows
  border: {
    label: 'Border',
    description: 'Default border color',
    category: 'Borders & Shadows',
    default: 'rgba(255, 255, 255, 0.3)',
    type: 'color'
  },
  borderDark: {
    label: 'Border Dark',
    description: 'Dark border color',
    category: 'Borders & Shadows',
    default: '#e5e7eb',
    type: 'color'
  },
  shadow: {
    label: 'Shadow',
    description: 'Default shadow color',
    category: 'Borders & Shadows',
    default: 'rgba(0, 0, 0, 0.1)',
    type: 'color'
  },
  shadowHover: {
    label: 'Shadow Hover',
    description: 'Hover shadow color',
    category: 'Borders & Shadows',
    default: 'rgba(0, 0, 0, 0.2)',
    type: 'color'
  }
};

/**
 * Get default theme colors
 * @returns {Object} Object with all token keys and default values
 */
export function getDefaultThemeColors() {
  const colors = {};
  Object.keys(THEME_TOKENS).forEach(key => {
    colors[key] = THEME_TOKENS[key].default;
  });
  return colors;
}

/**
 * Get CSS variable name for a token
 * @param {string} tokenKey - The token key
 * @returns {string} CSS variable name
 */
export function getCSSVariableName(tokenKey) {
  return `--theme-${tokenKey.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
}

/**
 * Apply theme colors to document root
 * @param {Object} colors - Theme colors object
 */
export function applyThemeToDocument(colors) {
  const root = document.documentElement;
  Object.keys(colors).forEach(key => {
    const cssVar = getCSSVariableName(key);
    root.style.setProperty(cssVar, colors[key]);
  });
}

/**
 * Get tokens by category
 * @returns {Object} Tokens grouped by category
 */
export function getTokensByCategory() {
  const categories = {};
  Object.keys(THEME_TOKENS).forEach(key => {
    const token = THEME_TOKENS[key];
    if (!categories[token.category]) {
      categories[token.category] = [];
    }
    categories[token.category].push({
      key,
      ...token
    });
  });
  return categories;
}

