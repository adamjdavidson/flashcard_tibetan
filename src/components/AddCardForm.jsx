import { useState } from 'react';
import { createCard, validateCard } from '../data/cardSchema.js';
import { translateText } from '../utils/translation.js';
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
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
      notes: formData.notes || null
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

