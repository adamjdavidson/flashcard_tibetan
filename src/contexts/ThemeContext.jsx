import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { supabase } from '../services/supabase.js';
import { getDefaultThemeColors, applyThemeToDocument, getCSSVariableName } from '../data/themeTokens.js';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const [currentTheme, setCurrentTheme] = useState(null);
  const [customColors, setCustomColors] = useState(null);
  const [loading, setLoading] = useState(true);
  const [themes, setThemes] = useState([]);

  // Load user's theme preference
  useEffect(() => {
    loadUserTheme();
  }, [user]);

  // Apply theme when it changes
  useEffect(() => {
    if (currentTheme || customColors) {
      applyTheme();
    }
  }, [currentTheme, customColors]);

  async function loadUserTheme() {
    try {
      // Load themes list first
      const { data: themesData } = await supabase
        .from('themes')
        .select('*')
        .order('is_default', { ascending: false })
        .order('name');
      
      if (themesData) {
        setThemes(themesData);
      }

      if (!user) {
        // No user - use default theme
        const defaultTheme = themesData?.find(t => t.is_default) || themesData?.[0];
        if (defaultTheme) {
          setCurrentTheme(defaultTheme);
        } else {
          // Fallback to hardcoded default
          applyThemeToDocument(getDefaultThemeColors());
        }
        setLoading(false);
        return;
      }

      // Load user's theme preference
      const { data: preference, error: prefError } = await supabase
        .from('user_theme_preferences')
        .select('*, theme_id, custom_colors')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (prefError && prefError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.warn('Error loading theme preference:', prefError);
      }

      if (preference) {
        if (preference.custom_colors) {
          // User has custom colors
          setCustomColors(preference.custom_colors);
          setCurrentTheme(null);
        } else if (preference.theme_id) {
          // User selected a preset theme
          const selectedTheme = themesData?.find(t => t.id === preference.theme_id);
          if (selectedTheme) {
            setCurrentTheme(selectedTheme);
          }
        }
      } else {
        // No preference - use default theme
        const defaultTheme = themesData?.find(t => t.is_default) || themesData?.[0];
        if (defaultTheme) {
          setCurrentTheme(defaultTheme);
        } else {
          applyThemeToDocument(getDefaultThemeColors());
        }
      }

      // Also load from localStorage for faster initial render
      const cachedPreference = localStorage.getItem('theme_preference');
      if (cachedPreference && !preference) {
        try {
          const cached = JSON.parse(cachedPreference);
          if (cached.customColors) {
            setCustomColors(cached.customColors);
          } else if (cached.themeId) {
            const cachedTheme = themesData?.find(t => t.id === cached.themeId);
            if (cachedTheme) {
              setCurrentTheme(cachedTheme);
            }
          }
        } catch (e) {
          console.error('Failed to parse cached theme:', e);
        }
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      // Fallback to default
      applyThemeToDocument(getDefaultThemeColors());
    } finally {
      setLoading(false);
    }
  }

  function applyTheme() {
    let colors;
    if (customColors) {
      colors = customColors;
    } else if (currentTheme?.colors) {
      colors = currentTheme.colors;
    } else {
      colors = getDefaultThemeColors();
    }
    applyThemeToDocument(colors);
  }

  async function setUserTheme(themeId, customColorsData = null) {
    if (!user) {
      // For non-authenticated users, just cache locally
      if (customColorsData) {
        localStorage.setItem('theme_preference', JSON.stringify({ customColors: customColorsData }));
        setCustomColors(customColorsData);
      } else if (themeId) {
        const theme = themes.find(t => t.id === themeId);
        if (theme) {
          localStorage.setItem('theme_preference', JSON.stringify({ themeId }));
          setCurrentTheme(theme);
        }
      }
      return;
    }

    try {
      // Save to database
      const { error } = await supabase
        .from('user_theme_preferences')
        .upsert({
          user_id: user.id,
          theme_id: customColorsData ? null : themeId,
          custom_colors: customColorsData || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      // Update state
      if (customColorsData) {
        setCustomColors(customColorsData);
        setCurrentTheme(null);
        localStorage.setItem('theme_preference', JSON.stringify({ customColors: customColorsData }));
      } else if (themeId) {
        const theme = themes.find(t => t.id === themeId);
        if (theme) {
          setCurrentTheme(theme);
          setCustomColors(null);
          localStorage.setItem('theme_preference', JSON.stringify({ themeId }));
        }
      }

      // Apply theme immediately
      applyTheme();
    } catch (error) {
      console.error('Error saving theme preference:', error);
      throw error;
    }
  }

  async function loadThemes() {
    try {
      const { data } = await supabase
        .from('themes')
        .select('*')
        .order('is_default', { ascending: false })
        .order('name');
      
      if (data) {
        setThemes(data);
      }
    } catch (error) {
      console.error('Error loading themes:', error);
    }
  }

  const value = {
    currentTheme,
    customColors,
    themes,
    loading,
    setUserTheme,
    loadThemes,
    isCustomTheme: !!customColors
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

