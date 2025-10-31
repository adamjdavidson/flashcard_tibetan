import { useState } from 'react';
import { translateText } from '../utils/translation.js';
import { generateAIImage, searchImage, uploadImage, validateImageFile, createImagePreview, revokeImagePreview } from '../utils/images.js';
import { createCard } from '../data/cardSchema.js';
import './QuickTranslateForm.css';

/**
 * QuickTranslateForm component
 * Allows admin to quickly add word cards by entering English word
 * Automatically translates and can add images
 */
export default function QuickTranslateForm({ onAddCards }) {
  const [englishWord, setEnglishWord] = useState('');
  const [tibetanScript, setTibetanScript] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleEnglishWordChange = (e) => {
    setEnglishWord(e.target.value);
    setError('');
  };

  const handleTranslate = async () => {
    if (!englishWord.trim()) {
      setError('Please enter an English word');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await translateText(englishWord.trim(), 'en', 'bo');
      
      if (result.success && result.translated) {
        setTibetanScript(result.translated);
      } else {
        setError(result.error || 'Translation failed');
      }
    } catch (err) {
      console.error('Translation error:', err);
      setError('Translation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAIImage = async () => {
    if (!englishWord.trim()) {
      setError('Please enter an English word first');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const prompt = `${englishWord}, simple illustration, educational, clean background`;
      const result = await generateAIImage(prompt);
      
      if (result.success && result.imageUrl) {
        setImageUrl(result.imageUrl);
        setImagePreview(result.imageUrl);
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
    if (!englishWord.trim()) {
      setError('Please enter an English word first');
      return;
    }

    setSearching(true);
    setError('');

    try {
      const result = await searchImage(englishWord.trim());
      
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

    // Create preview
    const preview = createImagePreview(file);
    setImagePreview(preview);

    try {
      const result = await uploadImage(file);
      
      if (result.success && result.imageUrl) {
        setImageUrl(result.imageUrl);
        // Revoke preview URL since we have the real URL now
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
      // Reset file input
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

          // Handle paste as upload
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

  const handleSubmit = () => {
    if (!englishWord.trim()) {
      setError('Please enter an English word');
      return;
    }

    if (!tibetanScript.trim()) {
      setError('Please translate the word first');
      return;
    }

    // Create English → Tibetan card
    const englishToTibetanCard = createCard({
      type: 'word',
      front: englishWord.trim(),
      backEnglish: englishWord.trim(),
      backTibetanScript: tibetanScript.trim(),
      backTibetanSpelling: '', // Will be empty for now
      imageUrl: imageUrl,
      subcategory: 'english_to_tibetan'
    });

    // Create Tibetan → English card
    const tibetanToEnglishCard = createCard({
      type: 'word',
      front: tibetanScript.trim(),
      backEnglish: englishWord.trim(),
      backTibetanScript: tibetanScript.trim(),
      backTibetanSpelling: '', // Will be empty for now
      imageUrl: imageUrl,
      subcategory: 'tibetan_to_english'
    });

    // Call parent callback
    onAddCards([englishToTibetanCard, tibetanToEnglishCard]);

    // Reset form
    setEnglishWord('');
    setTibetanScript('');
    setImageUrl(null);
    setImagePreview(null);
    setError('');
  };

  return (
    <div className="quick-translate-form">
      <h3>Quick Translate & Add Cards</h3>
      
      <div className="form-group">
        <label htmlFor="english-word">English Word *</label>
        <input
          type="text"
          id="english-word"
          value={englishWord}
          onChange={handleEnglishWordChange}
          onPaste={handlePasteImage}
          placeholder="Enter English word (e.g., Eye)"
          disabled={loading}
        />
      </div>

      <div className="form-actions-inline">
        <button
          type="button"
          onClick={handleTranslate}
          disabled={loading || !englishWord.trim()}
          className="btn-primary"
        >
          {loading ? 'Translating...' : 'Translate'}
        </button>
      </div>

      {tibetanScript && (
        <div className="form-group">
          <label>Tibetan Translation</label>
          <div className="tibetan-result">{tibetanScript}</div>
        </div>
      )}

      {/* Image Section */}
      <div className="image-section">
        <label>Image (Optional)</label>
        
        <div className="image-actions">
          <button
            type="button"
            onClick={handleGenerateAIImage}
            disabled={generating || !englishWord.trim()}
            className="btn-secondary"
          >
            {generating ? 'Generating...' : 'Generate AI Image'}
          </button>
          
          <button
            type="button"
            onClick={handleSearchUnsplash}
            disabled={searching || !englishWord.trim()}
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
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!englishWord.trim() || !tibetanScript.trim()}
          className="btn-primary btn-add-cards"
        >
          Add Cards (Both Directions)
        </button>
      </div>
    </div>
  );
}

