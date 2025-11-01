/**
 * AdminClassificationManager component
 * Manages categories and instruction levels
 */

import { useState, useEffect } from 'react';
import { loadCategories, createCategory, updateCategory, deleteCategory } from '../services/categoriesService.js';
import { loadInstructionLevels, createInstructionLevel, updateInstructionLevel, deleteInstructionLevel } from '../services/instructionLevelsService.js';
import { useAuth } from '../hooks/useAuth.js';
import './AdminClassificationManager.css';

export default function AdminClassificationManager() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'instruction-levels'

  // Categories state
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [categoryError, setCategoryError] = useState('');
  const [categorySuccess, setCategorySuccess] = useState('');

  // Instruction levels state
  const [instructionLevels, setInstructionLevels] = useState([]);
  const [levelsLoading, setLevelsLoading] = useState(false);
  const [showLevelForm, setShowLevelForm] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [levelForm, setLevelForm] = useState({ name: '', order: '', description: '' });
  const [levelError, setLevelError] = useState('');
  const [levelSuccess, setLevelSuccess] = useState('');

  // Load categories
  const loadCategoriesData = async () => {
    setCategoriesLoading(true);
    setCategoryError('');
    try {
      const data = await loadCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
      setCategoryError('Failed to load categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Load instruction levels
  const loadInstructionLevelsData = async () => {
    setLevelsLoading(true);
    setLevelError('');
    try {
      const data = await loadInstructionLevels();
      setInstructionLevels(data || []);
    } catch (err) {
      console.error('Error loading instruction levels:', err);
      setLevelError('Failed to load instruction levels');
    } finally {
      setLevelsLoading(false);
    }
  };

  // Load data on mount and when tab changes
  useEffect(() => {
    if (activeTab === 'categories') {
      loadCategoriesData();
    } else if (activeTab === 'instruction-levels') {
      loadInstructionLevelsData();
    }
  }, [activeTab]);

  // Category handlers
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setCategoryError('');
    setCategorySuccess('');

    if (!categoryForm.name.trim()) {
      setCategoryError('Category name is required');
      return;
    }

    setCategoriesLoading(true);
    try {
      let result;
      if (editingCategory) {
        result = await updateCategory(editingCategory.id, {
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim() || null
        });
      } else {
        result = await createCategory({
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim() || null,
          created_by: user?.id || null
        });
      }

      if (result.success) {
        setCategorySuccess(editingCategory ? 'Category updated successfully' : 'Category created successfully');
        setShowCategoryForm(false);
        setEditingCategory(null);
        setCategoryForm({ name: '', description: '' });
        await loadCategoriesData();
      } else {
        setCategoryError(result.error || 'Failed to save category');
      }
    } catch (err) {
      console.error('Error saving category:', err);
      setCategoryError('Failed to save category: ' + err.message);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleCategoryEdit = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name || '',
      description: category.description || ''
    });
    setShowCategoryForm(true);
    setCategoryError('');
    setCategorySuccess('');
  };

  const handleCategoryDelete = async (category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"? This will remove the category from all cards that use it.`)) {
      return;
    }

    setCategoriesLoading(true);
    setCategoryError('');
    setCategorySuccess('');
    try {
      const result = await deleteCategory(category.id, true);
      if (result.success) {
        setCategorySuccess(`Category deleted successfully (was used by ${result.cardCount || 0} cards)`);
        await loadCategoriesData();
      } else {
        setCategoryError(result.error || 'Failed to delete category');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      setCategoryError('Failed to delete category: ' + err.message);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleCategoryCancel = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
    setCategoryForm({ name: '', description: '' });
    setCategoryError('');
    setCategorySuccess('');
  };

  // Instruction level handlers
  const handleLevelSubmit = async (e) => {
    e.preventDefault();
    setLevelError('');
    setLevelSuccess('');

    if (!levelForm.name.trim()) {
      setLevelError('Instruction level name is required');
      return;
    }

    const order = levelForm.order ? parseInt(levelForm.order, 10) : (instructionLevels.length > 0 ? Math.max(...instructionLevels.map(l => l.order || 0)) + 1 : 1);
    if (isNaN(order)) {
      setLevelError('Order must be a number');
      return;
    }

    setLevelsLoading(true);
    try {
      let result;
      if (editingLevel) {
        result = await updateInstructionLevel(editingLevel.id, {
          name: levelForm.name.trim(),
          order: order,
          description: levelForm.description.trim() || null
        });
      } else {
        result = await createInstructionLevel({
          name: levelForm.name.trim(),
          order: order,
          description: levelForm.description.trim() || null,
          is_default: false
        });
      }

      if (result.success) {
        setLevelSuccess(editingLevel ? 'Instruction level updated successfully' : 'Instruction level created successfully');
        setShowLevelForm(false);
        setEditingLevel(null);
        setLevelForm({ name: '', order: '', description: '' });
        await loadInstructionLevelsData();
      } else {
        setLevelError(result.error || 'Failed to save instruction level');
      }
    } catch (err) {
      console.error('Error saving instruction level:', err);
      setLevelError('Failed to save instruction level: ' + err.message);
    } finally {
      setLevelsLoading(false);
    }
  };

  const handleLevelEdit = (level) => {
    setEditingLevel(level);
    setLevelForm({
      name: level.name || '',
      order: level.order?.toString() || '',
      description: level.description || ''
    });
    setShowLevelForm(true);
    setLevelError('');
    setLevelSuccess('');
  };

  const handleLevelDelete = async (level) => {
    if (!confirm(`Are you sure you want to delete "${level.name}"? This will remove the instruction level from all cards that use it.`)) {
      return;
    }

    setLevelsLoading(true);
    setLevelError('');
    setLevelSuccess('');
    try {
      const result = await deleteInstructionLevel(level.id, true);
      if (result.success) {
        setLevelSuccess(`Instruction level deleted successfully (was used by ${result.cardCount || 0} cards)`);
        await loadInstructionLevelsData();
      } else {
        setLevelError(result.error || 'Failed to delete instruction level');
      }
    } catch (err) {
      console.error('Error deleting instruction level:', err);
      setLevelError('Failed to delete instruction level: ' + err.message);
    } finally {
      setLevelsLoading(false);
    }
  };

  const handleLevelCancel = () => {
    setShowLevelForm(false);
    setEditingLevel(null);
    setLevelForm({ name: '', order: '', description: '' });
    setLevelError('');
    setLevelSuccess('');
  };

  return (
    <div className="admin-classification-manager">
      <div className="classification-tabs">
        <button
          className={`classification-tab ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
        <button
          className={`classification-tab ${activeTab === 'instruction-levels' ? 'active' : ''}`}
          onClick={() => setActiveTab('instruction-levels')}
        >
          Instruction Levels
        </button>
      </div>

      {activeTab === 'categories' && (
        <div className="classification-content">
          <div className="classification-header">
            <h2>Categories</h2>
            <button
              className="btn-primary"
              onClick={() => {
                setShowCategoryForm(true);
                setEditingCategory(null);
                setCategoryForm({ name: '', description: '' });
                setCategoryError('');
                setCategorySuccess('');
              }}
              disabled={categoriesLoading}
            >
              + Add Category
            </button>
          </div>

          {categoryError && (
            <div className="error-message" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px', color: '#c33' }}>
              {categoryError}
            </div>
          )}

          {categorySuccess && (
            <div className="success-message" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#efe', border: '1px solid #cfc', borderRadius: '4px', color: '#3c3' }}>
              {categorySuccess}
            </div>
          )}

          {showCategoryForm && (
            <div className="classification-form" style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
              <h3>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
              <form onSubmit={handleCategorySubmit}>
                <div className="form-group">
                  <label htmlFor="categoryName">Name *</label>
                  <input
                    type="text"
                    id="categoryName"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="Category name"
                    style={{ width: '100%', padding: '0.5rem' }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="categoryDescription">Description (optional)</label>
                  <textarea
                    id="categoryDescription"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Category description"
                    rows="3"
                    style={{ width: '100%', padding: '0.5rem' }}
                  />
                </div>
                <div className="form-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn-primary" disabled={categoriesLoading}>
                    {editingCategory ? 'Update' : 'Create'}
                  </button>
                  <button type="button" onClick={handleCategoryCancel} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {categoriesLoading ? (
            <div>Loading categories...</div>
          ) : categories.length === 0 ? (
            <div>No categories found. Create one to get started.</div>
          ) : (
            <div className="classification-list">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Description</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(category => (
                    <tr key={category.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '0.75rem' }}>{category.name}</td>
                      <td style={{ padding: '0.75rem', color: '#666' }}>{category.description || '—'}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        <button
                          onClick={() => handleCategoryEdit(category)}
                          className="btn-secondary"
                          style={{ marginRight: '0.5rem', fontSize: '0.875rem' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleCategoryDelete(category)}
                          className="btn-secondary"
                          style={{ fontSize: '0.875rem', color: '#c33' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'instruction-levels' && (
        <div className="classification-content">
          <div className="classification-header">
            <h2>Instruction Levels</h2>
            <button
              className="btn-primary"
              onClick={() => {
                setShowLevelForm(true);
                setEditingLevel(null);
                setLevelForm({ name: '', order: '', description: '' });
                setLevelError('');
                setLevelSuccess('');
              }}
              disabled={levelsLoading}
            >
              + Add Instruction Level
            </button>
          </div>

          {levelError && (
            <div className="error-message" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px', color: '#c33' }}>
              {levelError}
            </div>
          )}

          {levelSuccess && (
            <div className="success-message" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#efe', border: '1px solid #cfc', borderRadius: '4px', color: '#3c3' }}>
              {levelSuccess}
            </div>
          )}

          {showLevelForm && (
            <div className="classification-form" style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
              <h3>{editingLevel ? 'Edit Instruction Level' : 'Add New Instruction Level'}</h3>
              <form onSubmit={handleLevelSubmit}>
                <div className="form-group">
                  <label htmlFor="levelName">Name *</label>
                  <input
                    type="text"
                    id="levelName"
                    value={levelForm.name}
                    onChange={(e) => setLevelForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="Instruction level name"
                    style={{ width: '100%', padding: '0.5rem' }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="levelOrder">Order *</label>
                  <input
                    type="number"
                    id="levelOrder"
                    value={levelForm.order}
                    onChange={(e) => setLevelForm(prev => ({ ...prev, order: e.target.value }))}
                    placeholder="Auto (if empty)"
                    style={{ width: '100%', padding: '0.5rem' }}
                  />
                  <small style={{ display: 'block', marginTop: '0.25rem', color: '#666' }}>
                    Lower numbers appear first. Leave empty to auto-assign.
                  </small>
                </div>
                <div className="form-group">
                  <label htmlFor="levelDescription">Description (optional)</label>
                  <textarea
                    id="levelDescription"
                    value={levelForm.description}
                    onChange={(e) => setLevelForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Instruction level description"
                    rows="3"
                    style={{ width: '100%', padding: '0.5rem' }}
                  />
                </div>
                <div className="form-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn-primary" disabled={levelsLoading}>
                    {editingLevel ? 'Update' : 'Create'}
                  </button>
                  <button type="button" onClick={handleLevelCancel} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {levelsLoading ? (
            <div>Loading instruction levels...</div>
          ) : instructionLevels.length === 0 ? (
            <div>No instruction levels found. Create one to get started.</div>
          ) : (
            <div className="classification-list">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Order</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Description</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {instructionLevels
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map(level => (
                      <tr key={level.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>{level.order || '—'}</td>
                        <td style={{ padding: '0.75rem' }}>{level.name}</td>
                        <td style={{ padding: '0.75rem', color: '#666' }}>{level.description || '—'}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          <button
                            onClick={() => handleLevelEdit(level)}
                            className="btn-secondary"
                            style={{ marginRight: '0.5rem', fontSize: '0.875rem' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleLevelDelete(level)}
                            className="btn-secondary"
                            style={{ fontSize: '0.875rem', color: '#c33' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

