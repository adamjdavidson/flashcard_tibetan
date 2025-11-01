import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase.js';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { getDefaultThemeColors } from '../data/themeTokens.js';
import './AdminThemeManager.css';

/**
 * AdminThemeManager component
 * Allows admins to create, edit, and delete themes
 */
export default function AdminThemeManager() {
  const { themes: contextThemes, loadThemes } = useTheme();
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingTheme, setEditingTheme] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadThemesList();
  }, []);

  async function loadThemesList() {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('themes')
        .select('*')
        .order('is_default', { ascending: false })
        .order('name');
      
      if (fetchError) throw fetchError;
      setThemes(data || []);
    } catch (err) {
      setError('Failed to load themes: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTheme(themeData) {
    try {
      const { data, error: createError } = await supabase
        .from('themes')
        .insert([themeData])
        .select()
        .single();
      
      if (createError) throw createError;
      
      setSuccess('Theme created successfully!');
      setShowCreateForm(false);
      await loadThemesList();
      if (loadThemes) await loadThemes();
    } catch (err) {
      setError('Failed to create theme: ' + err.message);
    }
  }

  async function handleUpdateTheme(themeId, themeData) {
    try {
      const { error: updateError } = await supabase
        .from('themes')
        .update(themeData)
        .eq('id', themeId);
      
      if (updateError) throw updateError;
      
      setSuccess('Theme updated successfully!');
      setEditingTheme(null);
      await loadThemesList();
      if (loadThemes) await loadThemes();
    } catch (err) {
      setError('Failed to update theme: ' + err.message);
    }
  }

  async function handleDeleteTheme(themeId) {
    if (!window.confirm('Are you sure you want to delete this theme? This cannot be undone.')) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('themes')
        .delete()
        .eq('id', themeId);
      
      if (deleteError) throw deleteError;
      
      setSuccess('Theme deleted successfully!');
      await loadThemesList();
      if (loadThemes) await loadThemes();
    } catch (err) {
      setError('Failed to delete theme: ' + err.message);
    }
  }

  async function handleSetDefault(themeId) {
    try {
      // First, unset all other default themes
      await supabase
        .from('themes')
        .update({ is_default: false })
        .neq('id', themeId);
      
      // Then set this one as default
      const { error: updateError } = await supabase
        .from('themes')
        .update({ is_default: true })
        .eq('id', themeId);
      
      if (updateError) throw updateError;
      
      setSuccess('Default theme updated!');
      await loadThemesList();
      if (loadThemes) await loadThemes();
    } catch (err) {
      setError('Failed to set default theme: ' + err.message);
    }
  }

  if (loading) {
    return <div>Loading themes...</div>;
  }

  return (
    <div className="admin-theme-manager">
      <div className="theme-manager-header">
        <h2>Theme Management</h2>
        <button
          className="btn-primary"
          onClick={() => {
            setShowCreateForm(true);
            setEditingTheme(null);
          }}
        >
          Create New Theme
        </button>
      </div>

      {error && (
        <div className="admin-message admin-error">
          {error}
          <button onClick={() => setError('')} className="close-btn">×</button>
        </div>
      )}
      {success && (
        <div className="admin-message admin-success">
          {success}
          <button onClick={() => setSuccess('')} className="close-btn">×</button>
        </div>
      )}

      {(showCreateForm || editingTheme) && (
        <ThemeEditor
          theme={editingTheme}
          onSave={(themeData) => {
            if (editingTheme) {
              handleUpdateTheme(editingTheme.id, themeData);
            } else {
              handleCreateTheme(themeData);
            }
          }}
          onCancel={() => {
            setShowCreateForm(false);
            setEditingTheme(null);
          }}
        />
      )}

      <div className="themes-grid">
        {themes.map(theme => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            onEdit={() => setEditingTheme(theme)}
            onDelete={() => handleDeleteTheme(theme.id)}
            onSetDefault={() => handleSetDefault(theme.id)}
            isSystem={theme.is_system}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * ThemeCard component - displays a theme preview
 */
function ThemeCard({ theme, onEdit, onDelete, onSetDefault, isSystem }) {
  const colors = theme.colors || {};
  
  return (
    <div className="theme-card">
      <div className="theme-preview" style={{ background: colors.bgPrimary || '#667eea' }}>
        <div className="preview-card" style={{ background: colors.bgCard || '#ffffff' }}>
          <div className="preview-text" style={{ color: colors.textPrimary || '#333' }}>
            Preview
          </div>
        </div>
      </div>
      <div className="theme-info">
        <h3>
          {theme.name}
          {theme.is_default && <span className="badge-default">Default</span>}
          {isSystem && <span className="badge-system">System</span>}
        </h3>
        {theme.description && <p className="theme-description">{theme.description}</p>}
        <div className="theme-actions">
          <button className="btn-secondary btn-sm" onClick={onEdit}>
            Edit
          </button>
          {!theme.is_default && (
            <button className="btn-secondary btn-sm" onClick={onSetDefault}>
              Set Default
            </button>
          )}
          {!isSystem && (
            <button className="btn-danger btn-sm" onClick={onDelete}>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * ThemeEditor component - form for creating/editing themes
 */
function ThemeEditor({ theme, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    colors: {}
  });

  useEffect(() => {
    if (theme) {
      setFormData({
        name: theme.name || '',
        description: theme.description || '',
        colors: theme.colors || {}
      });
    } else {
      // Initialize with default colors
      const defaultColors = {
        bgPrimary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        bgSecondary: 'rgba(255, 255, 255, 0.1)',
        bgCard: '#ffffff',
        bgOverlay: 'rgba(0, 0, 0, 0.5)',
        textPrimary: '#333333',
        textSecondary: '#666666',
        textOnGradient: '#ffffff',
        textHint: 'rgba(255, 255, 255, 0.9)',
        btnPrimary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        btnSecondary: '#e5e7eb',
        btnHover: 'rgba(255, 255, 255, 0.3)',
        btnActive: '#ffffff',
        cardFrontBg: '#ffffff',
        cardBackBg: '#f9fafb',
        cardBorder: '#e5e7eb',
        cardShadow: 'rgba(0, 0, 0, 0.1)',
        accentSuccess: '#10b981',
        accentWarning: '#fbbf24',
        accentError: '#ef4444',
        accentInfo: '#3b82f6',
        ratingForgot: '#ef4444',
        ratingPartial: '#f59e0b',
        ratingHard: '#10b981',
        ratingEasy: '#3b82f6',
        border: 'rgba(255, 255, 255, 0.3)',
        borderDark: '#e5e7eb',
        shadow: 'rgba(0, 0, 0, 0.1)',
        shadowHover: 'rgba(0, 0, 0, 0.2)'
      };
      setFormData({
        name: '',
        description: '',
        colors: defaultColors
      });
    }
  }, [theme]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Theme name is required');
      return;
    }
    onSave(formData);
  }

  function updateColor(key, value) {
    setFormData(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [key]: value
      }
    }));
  }

  return (
    <div className="theme-editor">
      <h3>{theme ? 'Edit Theme' : 'Create New Theme'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Theme Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="2"
          />
        </div>
        <div className="form-group">
          <label>Colors</label>
          <div className="colors-grid">
            {Object.keys(formData.colors).map(key => (
              <div key={key} className="color-input-group">
                <label>{key}</label>
                <input
                  type="text"
                  value={formData.colors[key]}
                  onChange={(e) => updateColor(key, e.target.value)}
                  placeholder="#hex or gradient"
                />
                {formData.colors[key].startsWith('#') && (
                  <input
                    type="color"
                    value={formData.colors[key]}
                    onChange={(e) => updateColor(key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {theme ? 'Update Theme' : 'Create Theme'}
          </button>
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

