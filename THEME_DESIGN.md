# Theme Management System Design

## Overview
Implement a flexible theme management system that allows:
1. **Admin**: Create and manage preset themes (3-4 default themes)
2. **Users**: Select from preset themes OR create custom color schemes
3. **Persistence**: User preferences stored per-user

## Approach Options

### Option 1: CSS Variables + React Context + Supabase (Recommended)
**Best for: Flexibility, maintainability, performance**

#### Architecture:
- **CSS Variables**: Use CSS custom properties (`--color-primary`, `--color-secondary`, etc.)
- **React Context**: Theme state management (`ThemeContext`)
- **Supabase**: Store admin themes in `themes` table, user preferences in `user_preferences` table
- **localStorage**: Cache user preference for instant load

#### Color Tokens (What to theme):
```css
/* Background */
--theme-bg-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--theme-bg-secondary: rgba(255, 255, 255, 0.1);
--theme-bg-card: white;

/* Text */
--theme-text-primary: #333;
--theme-text-secondary: #666;
--theme-text-on-gradient: white;

/* Buttons */
--theme-btn-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--theme-btn-secondary: #e5e7eb;
--theme-btn-hover: rgba(255, 255, 255, 0.3);

/* Accents */
--theme-accent-success: #10b981;
--theme-accent-warning: #fbbf24;
--theme-accent-error: #ef4444;
--theme-accent-info: #3b82f6;

/* Borders & Shadows */
--theme-border: rgba(255, 255, 255, 0.3);
--theme-shadow: rgba(0, 0, 0, 0.1);
```

#### Implementation Steps:
1. **Database Schema**
   ```sql
   -- Themes table (admin-created presets)
   CREATE TABLE themes (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     name TEXT NOT NULL,
     description TEXT,
     is_default BOOLEAN DEFAULT false,
     colors JSONB NOT NULL, -- Store all CSS variable values
     created_by UUID REFERENCES auth.users(id),
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- User theme preferences
   CREATE TABLE user_theme_preferences (
     user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
     theme_id UUID REFERENCES themes(id) ON DELETE SET NULL, -- NULL = custom
     custom_colors JSONB, -- User's custom color scheme (if theme_id is NULL)
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

2. **React Context**
   ```javascript
   // src/contexts/ThemeContext.jsx
   - ThemeProvider component
   - useTheme hook
   - Load theme from DB/localStorage
   - Apply CSS variables to document root
   ```

3. **Admin Panel**
   ```javascript
   // AdminPage.jsx - new "Themes" tab
   - List all themes
   - Create new theme
   - Edit theme
   - Delete theme
   - Set default theme
   ```

4. **User Settings**
   ```javascript
   // Settings page (new component)
   - Preview themes
   - Select preset theme
   - Custom color picker for each element
   - Save preference
   ```

5. **CSS Migration**
   - Replace all hardcoded colors with CSS variables
   - Update all `.css` files to use `var(--theme-*)`

#### Pros:
✅ Maximum flexibility
✅ Easy to add new colorable elements
✅ Works with CSS preprocessors
✅ Can preview themes instantly
✅ Minimal performance impact
✅ Easy to maintain

#### Cons:
⚠️ Requires migrating all CSS files
⚠️ Need to identify all colorable elements upfront

---

### Option 2: CSS Classes + Dynamic Class Toggle
**Best for: Quick implementation, fewer colors to theme**

#### Architecture:
- Define theme classes (`.theme-dark`, `.theme-light`, `.theme-ocean`, etc.)
- Toggle class on `<body>` or root element
- Store preference in localStorage + Supabase

#### Implementation:
```css
/* src/themes.css */
.theme-default {
  --color-primary: #667eea;
  --color-secondary: #764ba2;
  /* ... */
}

.theme-dark {
  --color-primary: #1a202c;
  --color-secondary: #2d3748;
  /* ... */
}

.theme-ocean {
  --color-primary: #0ea5e9;
  --color-secondary: #06b6d4;
  /* ... */
}
```

```javascript
// Apply theme
document.documentElement.className = `theme-${themeName}`;
```

#### Pros:
✅ Simple to implement
✅ Easy to switch themes
✅ Can still use CSS variables under the hood

#### Cons:
⚠️ Limited customization (only preset themes)
⚠️ Adding custom colors requires new CSS class per user (not scalable)

---

### Option 3: Inline Styles + Styled Components
**Best for: Maximum control, dynamic themes**

#### Architecture:
- Use `styled-components` or similar
- Generate styles dynamically from theme object
- Store theme JSON in database

#### Implementation:
```javascript
import styled, { ThemeProvider } from 'styled-components';

const Button = styled.button`
  background: ${props => props.theme.primary};
  color: ${props => props.theme.text};
`;
```

#### Pros:
✅ Full programmatic control
✅ Can generate themes algorithmically
✅ TypeScript support

#### Cons:
⚠️ Requires major refactor (styled-components)
⚠️ Larger bundle size
⚠️ More complex setup

---

## Recommended Approach: Option 1 (CSS Variables + React Context)

### Implementation Plan:

#### Phase 1: Foundation
1. Create database tables (`themes`, `user_theme_preferences`)
2. Create ThemeContext with React Context API
3. Define color token structure (all CSS variables)
4. Create migration script to extract current colors to "Default" theme

#### Phase 2: CSS Migration
1. Replace hardcoded colors in `App.css` with CSS variables
2. Replace colors in component CSS files (Flashcard, CardManager, etc.)
3. Test all components still render correctly

#### Phase 3: Admin Theme Management
1. Add "Themes" tab to AdminPage
2. Theme CRUD operations:
   - List themes
   - Create theme (color picker UI)
   - Edit theme
   - Delete theme
   - Set as default
3. Preview theme in real-time

#### Phase 4: User Theme Selection
1. Create Settings page/component
2. Theme selector UI (grid of theme previews)
3. Save user preference to database + localStorage
4. Apply theme on app load

#### Phase 5: Custom Color Picker
1. Color picker component for each element
2. Live preview while customizing
3. Save custom theme as JSON
4. Share custom theme option (future feature?)

### Color Token Structure:
```javascript
const themeTokens = {
  // Backgrounds
  bgPrimary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  bgSecondary: 'rgba(255, 255, 255, 0.1)',
  bgCard: '#ffffff',
  bgOverlay: 'rgba(0, 0, 0, 0.5)',
  
  // Text
  textPrimary: '#333333',
  textSecondary: '#666666',
  textOnGradient: '#ffffff',
  textHint: 'rgba(255, 255, 255, 0.9)',
  
  // Buttons
  btnPrimary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  btnSecondary: '#e5e7eb',
  btnHover: 'rgba(255, 255, 255, 0.3)',
  btnActive: '#ffffff',
  
  // Flashcard
  cardFrontBg: '#ffffff',
  cardBackBg: '#f9fafb',
  cardBorder: '#e5e7eb',
  cardShadow: 'rgba(0, 0, 0, 0.1)',
  
  // Accents
  accentSuccess: '#10b981',
  accentWarning: '#fbbf24',
  accentError: '#ef4444',
  accentInfo: '#3b82f6',
  
  // Rating Buttons
  ratingForgot: '#ef4444',
  ratingPartial: '#f59e0b',
  ratingHard: '#10b981',
  ratingEasy: '#3b82f6',
  
  // Borders & Shadows
  border: 'rgba(255, 255, 255, 0.3)',
  borderDark: '#e5e7eb',
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowHover: 'rgba(0, 0, 0, 0.2)',
};
```

### Database Schema:
```sql
-- Migration file
CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false, -- System themes cannot be deleted
  colors JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_theme_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_id UUID REFERENCES themes(id) ON DELETE SET NULL,
  custom_colors JSONB, -- NULL unless custom theme
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
```

### Components to Create:
1. **`src/contexts/ThemeContext.jsx`** - Theme state management
2. **`src/components/ThemeSelector.jsx`** - Theme selection UI
3. **`src/components/CustomThemeEditor.jsx`** - Color picker for custom themes
4. **`src/components/Settings.jsx`** - User settings page
5. **`src/components/admin/ThemeManager.jsx`** - Admin theme CRUD
6. **`src/services/themeService.js`** - API calls for themes

### Next Steps:
1. Review and approve this approach
2. Create initial database migration
3. Define complete color token list
4. Start Phase 1 implementation

