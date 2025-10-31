import { useState, useEffect } from 'react';
import { createCard, validateCard } from '../data/cardSchema.js';
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
    backTibetanSpelling: '',
    notes: ''
  });

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
        backTibetanSpelling: card.backTibetanSpelling || '',
        notes: card.notes || ''
      });
    }
  }, [card]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      backTibetanSpelling: formData.backTibetanSpelling,
      notes: formData.notes || null,
      tags: tags,
      subcategory: subcategory,
      category: null // Remove category
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
          <input
            type="text"
            id="backEnglish"
            name="backEnglish"
            value={formData.backEnglish}
            onChange={handleChange}
            required={formData.type !== 'numerals' && formData.type !== 'numbers'}
            placeholder="Enter English translation"
          />
        </div>

        <div className="form-group">
          <label htmlFor="backTibetanSpelling">Tibetan Spelling (Back) *</label>
          <input
            type="text"
            id="backTibetanSpelling"
            name="backTibetanSpelling"
            value={formData.backTibetanSpelling}
            onChange={handleChange}
            required
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

