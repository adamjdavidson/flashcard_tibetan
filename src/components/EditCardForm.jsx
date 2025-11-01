import { useState, useEffect } from 'react';
import { createCard, validateCard } from '../data/cardSchema.js';
import { translateText } from '../utils/translation.js';
import { generateAIImage, searchImage, uploadImage, validateImageFile, createImagePreview, revokeImagePreview } from '../utils/images.js';
import { uploadImage as uploadToSupabase } from '../services/imagesService.js';
import { loadCategories, createCategory } from '../services/categoriesService.js';
import { loadInstructionLevels, createInstructionLevel } from '../services/instructionLevelsService.js';
import { useAuth } from '../hooks/useAuth.js';
import './AddCardForm.css';

/**
 * EditCardForm component for editing existing cards
 */
export default function EditCardForm({ card, onSave, onCancel, isAdmin = false }) {
  const [formData, setFormData] = useState({
    type: 'word',
    front: '',
    backArabic: '',
    backEnglish: '',
    backTibetanScript: '',
    backTibetanSpelling: '',
    notes: ''
  });
  const [imageUrl, setImageUrl] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [searching, setSearching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  // Populate form with card data when card changes
  useEffect(() => {
    if (card) {
      // Determine card type from tags (Numerals, Numbers, Word, Phrase)
      let cardType = card.type || 'word';
      if (card.tags && card.tags.length > 0) {
        const tag = card.tags[0]; // Use first tag
        if (tag === 'Numerals') {
          cardType = 'numerals';
        } else if (tag === 'Numbers') {
          cardType = 'numbers';
        } else if (tag === 'Word') {
          cardType = 'word';
        } else if (tag === 'Phrase') {
          cardType = 'phrase';
        }
      }
      
      setFormData({
        type: cardType,
        front: card.front || '',
        backArabic: card.backArabic || '',
        backEnglish: card.backEnglish || '',
        backTibetanScript: card.backTibetanScript || '',
        backTibetanSpelling: card.backTibetanSpelling || '',
        notes: card.notes || ''
      });
      // Set image URL and preview
      setImageUrl(card.imageUrl || null);
      setImagePreview(card.imageUrl || null);
      // Set category IDs and instruction level ID
      if (card.categories && Array.isArray(card.categories)) {
        setCategoryIds(card.categories.map(cat => cat.id || cat.categoryId).filter(Boolean));
      } else {
        setCategoryIds([]);
      }
      setInstructionLevelId(card.instructionLevelId || card.instruction_level_id || '');
    }
  }, [card]);

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

  // Image handlers (similar to QuickTranslateForm)
  const handleGenerateAIImage = async () => {
    if (!formData.front.trim() && !formData.backEnglish.trim()) {
      setError('Please enter a word first (front or back)');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const prompt = formData.backEnglish || formData.front; // Let the API enhance it with photorealistic prompt
      const result = await generateAIImage(prompt);
      
      if (result.success && result.imageUrl) {
        // Check if it's a base64 data URL - if so, upload to Supabase Storage
        if (result.imageUrl.startsWith('data:image/')) {
          try {
            const response = await fetch(result.imageUrl);
            const blob = await response.blob();
            const file = new File([blob], `${formData.backEnglish || formData.front}_${Date.now()}.png`, {
              type: blob.type || 'image/png'
            });
            const uploadResult = await uploadToSupabase(file);
            
            if (uploadResult.success && uploadResult.imageUrl) {
              setImageUrl(uploadResult.imageUrl);
              setImagePreview(uploadResult.imageUrl);
            } else {
              console.warn('Failed to upload to Supabase, using base64:', uploadResult.error);
              setImageUrl(result.imageUrl);
              setImagePreview(result.imageUrl);
            }
          } catch (uploadErr) {
            console.error('Error uploading generated image:', uploadErr);
            setImageUrl(result.imageUrl);
            setImagePreview(result.imageUrl);
          }
        } else {
          setImageUrl(result.imageUrl);
          setImagePreview(result.imageUrl);
        }
      } else {
        setError(result.error || 'AI image generation failed');
      }
    } catch (err) {
      console.error('Image generation error:', err);
      setError('Image generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSearchUnsplash = async () => {
    if (!formData.backEnglish.trim() && !formData.front.trim()) {
      setError('Please enter a word first (front or back)');
      return;
    }

    setSearching(true);
    setError('');

    try {
      const result = await searchImage((formData.backEnglish || formData.front).trim());
      if (result.success && result.imageUrl) {
        setImageUrl(result.imageUrl);
        setImagePreview(result.imageUrl);
      } else {
        setError(result.error || 'Image search failed');
      }
    } catch (err) {
      console.error('Image search error:', err);
      setError('Image search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid image file');
      return;
    }

    setUploading(true);
    setError('');

    const preview = createImagePreview(file);
    setImagePreview(preview);

    try {
      const result = await uploadImage(file);
      if (result.success && result.imageUrl) {
        setImageUrl(result.imageUrl);
        revokeImagePreview(preview);
        setImagePreview(result.imageUrl);
      } else {
        setError(result.error || 'Image upload failed');
        revokeImagePreview(preview);
        setImagePreview(null);
      }
    } catch (err) {
      console.error('Image upload error:', err);
      setError('Image upload failed. Please try again.');
      revokeImagePreview(preview);
      setImagePreview(null);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handlePasteImage = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const validation = validateImageFile(file);
          if (!validation.valid) {
            setError(validation.error || 'Invalid image file');
            return;
          }
          const fakeEvent = { target: { files: [file], value: '' } };
          await handleImageUpload(fakeEvent);
        }
        break;
      }
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      revokeImagePreview(imagePreview);
    }
    setImageUrl(null);
    setImagePreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Map card type to tag
    let tags = [];
    if (formData.type === 'numerals') {
      tags = ['Numerals'];
    } else if (formData.type === 'numbers') {
      tags = ['Numbers'];
    } else if (formData.type === 'word') {
      tags = ['Word'];
    } else if (formData.type === 'phrase') {
      tags = ['Phrase'];
    }

    // Determine type and subcategory for number cards
    const cardType = (formData.type === 'numerals' || formData.type === 'numbers') ? 'number' : formData.type;
    const subcategory = formData.type === 'numerals' ? 'numerals' : 
                       formData.type === 'numbers' ? 'script' : 
                       card.subcategory;

    const updatedCard = {
      ...card, // Keep original id and timestamps
      type: cardType,
      front: formData.front,
      backArabic: (cardType === 'number' && formData.backArabic) ? formData.backArabic : (card.backArabic || null),
      backEnglish: formData.backEnglish,
      backTibetanScript: (cardType === 'word' || cardType === 'phrase') ? (formData.backTibetanScript || null) : (card.backTibetanScript || null),
      backTibetanNumeral: (cardType === 'number' && card.subcategory === 'script') ? (card.backTibetanNumeral || null) : null,
      backTibetanSpelling: formData.backTibetanSpelling,
      notes: formData.notes || null,
      tags: tags,
      subcategory: subcategory,
      imageUrl: imageUrl || null, // Preserve or update image URL
      // Classification data
      categoryIds: categoryIds, // Array of category IDs
      instructionLevelId: instructionLevelId || null // Single instruction level ID
    };

    if (validateCard(updatedCard)) {
      // Warn if Tibetan script is missing for word/phrase cards (translation should have populated it)
      if ((cardType === 'word' || cardType === 'phrase') && !formData.backTibetanScript && formData.backEnglish) {
        const proceed = confirm('Tibetan script is not set. Did you try the Translate button? You can still save the card and add Tibetan script later.');
        if (!proceed) {
          return;
        }
      }
      onSave(updatedCard);
    } else {
      alert('Please fill in all required fields.');
    }
  };

  if (!card) {
    return null;
  }

  return (
    <div className="add-card-form">
      <h2>Edit Card</h2>
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

        <div className="form-group">
          <label htmlFor="backEnglish">
            {(formData.type === 'numerals' || formData.type === 'numbers') ? 'English Word (Back, optional)' : 'English Translation (Back) *'}
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              id="backEnglish"
              name="backEnglish"
              value={formData.backEnglish}
              onChange={handleChange}
              required={formData.type !== 'numerals' && formData.type !== 'numbers'}
              placeholder="Enter English translation"
              style={{ flex: 1 }}
            />
            {(formData.type === 'word' || formData.type === 'phrase') && (
              <button
                type="button"
                onClick={handleTranslate}
                disabled={translating || !formData.backEnglish.trim()}
                className="btn-secondary"
              >
                {translating ? 'Translating...' : 'Translate'}
              </button>
            )}
          </div>
        </div>

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
          <label htmlFor="backTibetanSpelling">Tibetan Spelling (Back) (optional)</label>
          <input
            type="text"
            id="backTibetanSpelling"
            name="backTibetanSpelling"
            value={formData.backTibetanSpelling}
            onChange={handleChange}
            placeholder="Enter Wylie or phonetic spelling"
          />
        </div>

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

        {/* Image Section */}
        <div className="image-section">
          <label>Image (Optional)</label>
          
          <div className="image-actions">
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={handleGenerateAIImage}
                  disabled={generating || (!formData.front.trim() && !formData.backEnglish.trim())}
                  className="btn-secondary"
                >
                  {generating ? 'Generating...' : 'Generate AI Image'}
                </button>
                
                <button
                  type="button"
                  onClick={handleSearchUnsplash}
                  disabled={searching || (!formData.front.trim() && !formData.backEnglish.trim())}
                  className="btn-secondary"
                >
                  {searching ? 'Searching...' : 'Search Unsplash'}
                </button>
              </>
            )}
            
            <label className="btn-secondary btn-upload">
              {uploading ? 'Uploading...' : 'Upload Image'}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
            
            {imagePreview && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="btn-secondary btn-remove"
              >
                Remove Image
              </button>
            )}
          </div>

          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          )}
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-primary">Save Changes</button>
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

