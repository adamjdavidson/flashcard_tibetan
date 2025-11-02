import { useState, useEffect } from 'react';
import { createCard, validateCard } from '../data/cardSchema.js';
import { translateText } from '../utils/translation.js';
import { loadCategories, createCategory } from '../services/categoriesService.js';
import { loadInstructionLevels, createInstructionLevel } from '../services/instructionLevelsService.js';
import { useAuth } from '../hooks/useAuth.js';
import './AddCardForm.css';

/**
 * AddCardForm component for adding new cards
 */
export default function AddCardForm({ onAdd, onCancel }) {
  const [formData, setFormData] = useState({
    type: 'word',
    front: '',
    backArabic: '',
    backEnglish: '',
    backTibetanScript: '',
    backTibetanSpelling: '',
    notes: ''
  });
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [instructionLevels, setInstructionLevels] = useState([]);
  const [categoryIds, setCategoryIds] = useState([]);
  const [instructionLevelId, setInstructionLevelId] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewInstructionLevel, setShowNewInstructionLevel] = useState(false);
  const [newInstructionLevelName, setNewInstructionLevelName] = useState('');
  const [newInstructionLevelOrder, setNewInstructionLevelOrder] = useState('');
  const { user } = useAuth();

  // Load categories and instruction levels
  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, levels] = await Promise.all([
          loadCategories(),
          loadInstructionLevels()
        ]);
        setCategories(cats || []);
        setInstructionLevels(levels || []);
      } catch (err) {
        console.error('Error loading categories/instruction levels:', err);
      }
    };
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  // Handle category selection (multi-select)
  const handleCategoryChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const selectedIds = selectedOptions.map(option => option.value);
    setCategoryIds(selectedIds);
  };

  // Handle instruction level selection (single select)
  const handleInstructionLevelChange = (e) => {
    setInstructionLevelId(e.target.value);
  };

  // Handle creating a new category
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('Category name is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await createCategory({
        name: newCategoryName.trim(),
        description: null,
        created_by: user?.id || null
      });

      if (result.success && result.data) {
        // Reload categories and select the new one
        const updatedCategories = await loadCategories();
        setCategories(updatedCategories || []);
        setCategoryIds([...categoryIds, result.data.id]);
        setNewCategoryName('');
        setShowNewCategory(false);
      } else {
        setError(result.error || 'Failed to create category');
      }
    } catch (err) {
      console.error('Error creating category:', err);
      setError('Failed to create category: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle creating a new instruction level
  const handleCreateInstructionLevel = async () => {
    if (!newInstructionLevelName.trim()) {
      setError('Instruction level name is required');
      return;
    }

    const order = newInstructionLevelOrder ? parseInt(newInstructionLevelOrder, 10) : (instructionLevels.length > 0 ? Math.max(...instructionLevels.map(l => l.order || 0)) + 1 : 1);
    if (isNaN(order)) {
      setError('Order must be a number');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await createInstructionLevel({
        name: newInstructionLevelName.trim(),
        order: order,
        description: null,
        is_default: false
      });

      if (result.success && result.data) {
        // Reload instruction levels and select the new one
        const updatedLevels = await loadInstructionLevels();
        setInstructionLevels(updatedLevels || []);
        setInstructionLevelId(result.data.id);
        setNewInstructionLevelName('');
        setNewInstructionLevelOrder('');
        setShowNewInstructionLevel(false);
      } else {
        setError(result.error || 'Failed to create instruction level');
      }
    } catch (err) {
      console.error('Error creating instruction level:', err);
      setError('Failed to create instruction level: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Translation handler
  const handleTranslate = async () => {
    if (!formData.backEnglish.trim()) {
      setError('Please enter an English word to translate');
      return;
    }

    setTranslating(true);
    setError('');

    try {
      const result = await translateText(formData.backEnglish.trim(), 'en', 'bo');
      
      if (result.success && result.translated) {
        setFormData(prev => ({
          ...prev,
          backTibetanScript: result.translated
        }));
      } else {
        setError(result.error || 'Translation failed');
      }
    } catch (err) {
      console.error('Translation error:', err);
      setError('Translation failed. Please try again.');
    } finally {
      setTranslating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newCard = createCard({
      ...formData,
      backArabic: (formData.type === 'numerals' || formData.type === 'numbers') && formData.backArabic ? formData.backArabic : null,
      backTibetanScript: (formData.type === 'word' || formData.type === 'phrase') ? (formData.backTibetanScript || null) : null,
      notes: formData.notes || null,
      // Classification data
      categoryIds: categoryIds,
      instructionLevelId: instructionLevelId || null
    });

    if (validateCard(newCard)) {
      // Warn if Tibetan script is missing for word/phrase cards (translation should have populated it)
      if ((formData.type === 'word' || formData.type === 'phrase') && !formData.backTibetanScript && formData.backEnglish) {
        const proceed = confirm('Tibetan script is not set. Did you try the Translate button? You can still save the card and add Tibetan script later.');
        if (!proceed) {
          return;
        }
      }
      onAdd(newCard);
      // Reset form
      setFormData({
        type: 'word',
        front: '',
        backArabic: '',
        backEnglish: '',
        backTibetanScript: '',
        backTibetanSpelling: '',
        notes: ''
      });
      setCategoryIds([]);
      setInstructionLevelId('');
      setError('');
    } else {
      alert('Please fill in all required fields.');
    }
  };

  return (
    <div className="add-card-form">
      <h2>Add New Card</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="type">Card Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="numerals">Numerals</option>
            <option value="numbers">Numbers</option>
            <option value="word">Word</option>
            <option value="phrase">Phrase</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="front">
            {formData.type === 'numerals' ? 'Tibetan Numeral (Front) *' : 
             formData.type === 'numbers' ? 'Tibetan Script (Front) *' : 
             'Tibetan Script (Front) *'}
          </label>
          <input
            type="text"
            id="front"
            name="front"
            value={formData.front}
            onChange={handleChange}
            required
            placeholder={formData.type === 'numerals' ? 'Enter Tibetan numerals (e.g., ༢༥)' : 
                        formData.type === 'numbers' ? 'Enter Tibetan script (e.g., ཉི་ཤུ་རྩ་ལྔ)' : 
                        'Enter Tibetan script'}
          />
        </div>

        {(formData.type === 'numerals' || formData.type === 'numbers') && (
          <div className="form-group">
            <label htmlFor="backArabic">Arabic Numeral (Back) *</label>
            <input
              type="text"
              id="backArabic"
              name="backArabic"
              value={formData.backArabic}
              onChange={handleChange}
              required
              placeholder="Enter Arabic numeral (e.g., 25)"
            />
          </div>
        )}

        {(formData.type === 'word' || formData.type === 'phrase') && (
          <div className="form-group">
            <label htmlFor="backEnglish">
              English Translation (Back) *
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                id="backEnglish"
                name="backEnglish"
                value={formData.backEnglish}
                onChange={handleChange}
                required
                placeholder="Enter English translation"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={handleTranslate}
                disabled={translating || !formData.backEnglish.trim()}
                className="btn-translate"
                title="Translate to Tibetan"
              >
                {translating ? 'Translating...' : 'Translate'}
              </button>
            </div>
          </div>
        )}

        {(formData.type === 'numerals' || formData.type === 'numbers') && (
          <div className="form-group">
            <label htmlFor="backEnglish">English Word (Back, optional)</label>
            <input
              type="text"
              id="backEnglish"
              name="backEnglish"
              value={formData.backEnglish}
              onChange={handleChange}
              placeholder="Enter English translation"
            />
          </div>
        )}

        {(formData.type === 'word' || formData.type === 'phrase') && (
          <div className="form-group">
            <label htmlFor="backTibetanScript">
              Tibetan Script (Back) <span style={{ color: '#666', fontWeight: 'normal' }}>(use Translate button)</span>
            </label>
            <input
              type="text"
              id="backTibetanScript"
              name="backTibetanScript"
              value={formData.backTibetanScript}
              onChange={handleChange}
              placeholder="Will be populated by Translate button"
            />
            {!formData.backTibetanScript && formData.backEnglish && (
              <small style={{ display: 'block', marginTop: '0.25rem', color: '#666', fontStyle: 'italic' }}>
                Click the "Translate" button to automatically populate this field
              </small>
            )}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="backTibetanSpelling">Tibetan Spelling (Back) - Optional</label>
          <input
            type="text"
            id="backTibetanSpelling"
            name="backTibetanSpelling"
            value={formData.backTibetanSpelling}
            onChange={handleChange}
            placeholder="Enter Wylie or phonetic spelling (optional)"
          />
        </div>

        {error && (
          <div className="form-error" style={{ color: 'red', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {/* Classification Fields */}
        <div className="form-group">
          <label htmlFor="categories">Categories (optional)</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <select
              id="categories"
              name="categories"
              multiple
              value={categoryIds}
              onChange={handleCategoryChange}
              size={Math.min(categories.length, 5)}
              style={{ padding: '0.5rem', flex: 1 }}
              disabled={loading}
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowNewCategory(!showNewCategory)}
              className="btn-secondary"
              style={{ whiteSpace: 'nowrap' }}
              disabled={loading}
              title="Add New Category"
            >
              + Add
            </button>
          </div>
          {showNewCategory && (
            <div style={{ marginTop: '0.5rem', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
              <input
                type="text"
                placeholder="New category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateCategory();
                  } else if (e.key === 'Escape') {
                    setShowNewCategory(false);
                    setNewCategoryName('');
                  }
                }}
                autoFocus
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="btn-primary"
                  disabled={loading || !newCategoryName.trim()}
                  style={{ fontSize: '0.875rem' }}
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategory(false);
                    setNewCategoryName('');
                  }}
                  className="btn-secondary"
                  style={{ fontSize: '0.875rem' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <small style={{ display: 'block', marginTop: '0.25rem', color: '#666' }}>
            Hold Ctrl/Cmd to select multiple categories
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="instructionLevel">Instruction Level (optional)</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <select
              id="instructionLevel"
              name="instructionLevel"
              value={instructionLevelId}
              onChange={handleInstructionLevelChange}
              style={{ flex: 1 }}
              disabled={loading}
            >
              <option value="">None</option>
              {instructionLevels
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map(level => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
            </select>
            <button
              type="button"
              onClick={() => setShowNewInstructionLevel(!showNewInstructionLevel)}
              className="btn-secondary"
              style={{ whiteSpace: 'nowrap' }}
              disabled={loading}
              title="Add New Instruction Level"
            >
              + Add
            </button>
          </div>
          {showNewInstructionLevel && (
            <div style={{ marginTop: '0.5rem', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
              <input
                type="text"
                placeholder="New instruction level name"
                value={newInstructionLevelName}
                onChange={(e) => setNewInstructionLevelName(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateInstructionLevel();
                  } else if (e.key === 'Escape') {
                    setShowNewInstructionLevel(false);
                    setNewInstructionLevelName('');
                    setNewInstructionLevelOrder('');
                  }
                }}
                autoFocus
              />
              <input
                type="number"
                placeholder="Order (optional, auto if empty)"
                value={newInstructionLevelOrder}
                onChange={(e) => setNewInstructionLevelOrder(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleCreateInstructionLevel}
                  className="btn-primary"
                  disabled={loading || !newInstructionLevelName.trim()}
                  style={{ fontSize: '0.875rem' }}
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewInstructionLevel(false);
                    setNewInstructionLevelName('');
                    setNewInstructionLevelOrder('');
                  }}
                  className="btn-secondary"
                  style={{ fontSize: '0.875rem' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes (optional)</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            placeholder="Additional notes..."
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">Add Card</button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

