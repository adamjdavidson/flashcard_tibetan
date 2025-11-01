import { useState, useEffect } from 'react';
import { createCard, validateCard } from '../data/cardSchema.js';
import { translateText } from '../utils/translation.js';
import { generateAIImage, searchImage, uploadImage, validateImageFile, createImagePreview, revokeImagePreview } from '../utils/images.js';
import { uploadImage as uploadToSupabase } from '../services/imagesService.js';
import './AddCardForm.css';

/**
 * EditCardForm component for editing existing cards
 */
export default function EditCardForm({ card, onSave, onCancel }) {
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
  const [error, setError] = useState('');

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
    }
  }, [card]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      category: null, // Remove category
      imageUrl: imageUrl || null // Preserve or update image URL
    };

    if (validateCard(updatedCard)) {
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
            <label htmlFor="backTibetanScript">Tibetan Script (Back) *</label>
            <input
              type="text"
              id="backTibetanScript"
              name="backTibetanScript"
              value={formData.backTibetanScript}
              onChange={handleChange}
              required
              placeholder="Enter Tibetan script (or use Translate button)"
            />
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

