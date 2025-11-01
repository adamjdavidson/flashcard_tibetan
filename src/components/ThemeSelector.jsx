import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { THEME_TOKENS, getTokensByCategory, getDefaultThemeColors } from '../data/themeTokens.js';
import './ThemeSelector.css';

/**
 * ThemeSelector component
 * Allows users to select preset themes or create custom themes
 */
export default function ThemeSelector() {
  const { themes, currentTheme, customColors, setUserTheme, loading } = useTheme();
  const [selectedThemeId, setSelectedThemeId] = useState(null);
  const [showCustomEditor, setShowCustomEditor] = useState(false);

  useEffect(() => {
    if (currentTheme) {
      setSelectedThemeId(currentTheme.id);
      setShowCustomEditor(false);
    } else if (customColors) {
      setSelectedThemeId('custom');
      setShowCustomEditor(true);
    } else if (themes.length > 0) {
      const defaultTheme = themes.find(t => t.is_default) || themes[0];
      if (defaultTheme) {
        setSelectedThemeId(defaultTheme.id);
      }
    }
  }, [currentTheme, customColors, themes]);

  function handleThemeSelect(themeId) {
    if (themeId === 'custom') {
      setShowCustomEditor(true);
      setSelectedThemeId('custom');
    } else {
      setShowCustomEditor(false);
      setSelectedThemeId(themeId);
      const theme = themes.find(t => t.id === themeId);
      if (theme) {
        setUserTheme(themeId);
      }
    }
  }

  function handleCustomThemeSave(customColorsData) {
    setUserTheme(null, customColorsData);
    setShowCustomEditor(true);
  }

  if (loading) {
    return <div>Loading themes...</div>;
  }

  return (
    <div className="theme-selector">
      <h2>Theme Settings</h2>
      
      <div className="theme-presets">
        <h3>Preset Themes</h3>
        <div className="themes-grid">
          {themes.map(theme => (
            <ThemePreviewCard
              key={theme.id}
              theme={theme}
              isSelected={selectedThemeId === theme.id}
              onClick={() => handleThemeSelect(theme.id)}
            />
          ))}
          <CustomThemeCard
            isSelected={selectedThemeId === 'custom'}
            onClick={() => handleThemeSelect('custom')}
          />
        </div>
      </div>

      {showCustomEditor && (
        <CustomThemeEditor
          initialColors={customColors}
          onSave={handleCustomThemeSave}
          onCancel={() => {
            if (currentTheme) {
              setSelectedThemeId(currentTheme.id);
            } else if (themes.length > 0) {
              const defaultTheme = themes.find(t => t.is_default) || themes[0];
              if (defaultTheme) {
                setSelectedThemeId(defaultTheme.id);
                handleThemeSelect(defaultTheme.id);
              }
            }
            setShowCustomEditor(false);
          }}
        />
      )}
    </div>
  );
}

/**
 * ThemePreviewCard - shows a preview of a preset theme
 */
function ThemePreviewCard({ theme, isSelected, onClick }) {
  const colors = theme.colors || {};
  
  return (
    <div
      className={`theme-preview-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="preview-header" style={{ background: colors.bgPrimary || '#667eea' }}>
        <div className="preview-mini-card" style={{ background: colors.bgCard || '#ffffff' }}>
          <div className="preview-dot" style={{ background: colors.textPrimary || '#333' }}></div>
        </div>
      </div>
      <div className="preview-info">
        <h4>{theme.name}</h4>
        {theme.description && <p>{theme.description}</p>}
      </div>
    </div>
  );
}

/**
 * CustomThemeCard - card to open custom theme editor
 */
function CustomThemeCard({ isSelected, onClick }) {
  return (
    <div
      className={`theme-preview-card custom-theme-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="preview-header custom-gradient">
        <div className="preview-mini-card">
          <div className="custom-icon">🎨</div>
        </div>
      </div>
      <div className="preview-info">
        <h4>Custom Theme</h4>
        <p>Create your own color scheme</p>
      </div>
    </div>
  );
}

/**
 * CustomThemeEditor - full editor for creating custom themes
 */
function CustomThemeEditor({ initialColors, onSave, onCancel }) {
  const [colors, setColors] = useState(initialColors || getDefaultThemeColors());
  const tokensByCategory = getTokensByCategory();

  function updateColor(key, value) {
    setColors(prev => ({
      ...prev,
      [key]: value
    }));
  }

  function handleSave() {
    onSave(colors);
  }

  function handleReset() {
    setColors(getDefaultThemeColors());
  }

  return (
    <div className="custom-theme-editor">
      <h3>Custom Theme Editor</h3>
      <p className="editor-description">
        Customize colors for each element. Changes apply immediately.
      </p>

      <div className="editor-categories">
        {Object.entries(tokensByCategory).map(([category, tokens]) => (
          <div key={category} className="editor-category">
            <h4>{category}</h4>
            <div className="category-colors">
              {tokens.map(({ key, label, description, type, default: defaultValue }) => {
                const isGradient = type === 'gradient' || (colors[key] && colors[key].includes('gradient'));
                return (
                  <div key={key} className="color-editor-item">
                    <label>
                      <span className="color-label">{label}</span>
                      {description && <span className="color-desc">{description}</span>}
                    </label>
                    <div className="color-inputs">
                      {isGradient ? (
                        <input
                          type="text"
                          value={colors[key] || defaultValue}
                          onChange={(e) => updateColor(key, e.target.value)}
                          placeholder={defaultValue}
                          className="color-text-input"
                        />
                      ) : (
                        <>
                          <input
                            type="color"
                            value={colors[key] || defaultValue}
                            onChange={(e) => updateColor(key, e.target.value)}
                            className="color-picker"
                          />
                          <input
                            type="text"
                            value={colors[key] || defaultValue}
                            onChange={(e) => updateColor(key, e.target.value)}
                            placeholder={defaultValue}
                            className="color-text-input"
                          />
                        </>
                      )}
                    </div>
                    <div
                      className="color-preview"
                      style={{ background: colors[key] || defaultValue }}
                    ></div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="editor-actions">
        <button className="btn-primary" onClick={handleSave}>
          Save Custom Theme
        </button>
        <button className="btn-secondary" onClick={handleReset}>
          Reset to Defaults
        </button>
        <button className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

