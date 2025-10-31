import { useState } from 'react';
import { createCard, validateCard } from '../data/cardSchema.js';
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
    backTibetanSpelling: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newCard = createCard({
      ...formData,
      backArabic: (formData.type === 'numerals' || formData.type === 'numbers') && formData.backArabic ? formData.backArabic : null,
      notes: formData.notes || null
    });

    if (validateCard(newCard)) {
      onAdd(newCard);
      // Reset form
      setFormData({
        type: 'word',
        front: '',
        backArabic: '',
        backEnglish: '',
        backTibetanSpelling: '',
        notes: ''
      });
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

