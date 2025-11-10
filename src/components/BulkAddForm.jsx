import { useState, useEffect } from 'react';
import { processBulkAdd } from '../services/bulkAddService.js';
import { loadCategories } from '../services/categoriesService.js';
import { loadInstructionLevels } from '../services/instructionLevelsService.js';
import BulkAddSummary from './BulkAddSummary.jsx';
import './BulkAddForm.css';

/**
 * BulkAddForm component
 * Allows admins to paste a list of words and bulk create cards
 * 
 * Features:
 * - Bulk add 2-100 words at once
 * - Automatic translation to Tibetan
 * - Automatic image generation
 * - "Mark as New" checkbox to flag cards for review (default: checked)
 *   - When checked, cards are assigned the "new" category for review by Tibetan speakers
 *   - When unchecked, cards are created without the "new" category
 *   - Auto-checks when words are entered (respects manual override)
 * 
 * Reviewer Workflow:
 * - Reviewers can filter cards by "new" category to see all bulk-created cards needing review
 * - Reviewers use EditCardForm to review card content (translation, image, etc.)
 * - Reviewers remove "new" category from cards after approval
 * - Cards without "new" category no longer appear in the review filter
 */
export default function BulkAddForm({ onComplete, onCancel, isAdmin = true }) {
  const [wordsText, setWordsText] = useState('');
  const [cardType, setCardType] = useState('word');
  const [categoryIds, setCategoryIds] = useState([]);
  const [instructionLevelId, setInstructionLevelId] = useState('');
  const [markAsNew, setMarkAsNew] = useState(true); // Checkbox state for "New" category assignment
  const [manualOverride, setManualOverride] = useState(false); // Track if user has manually overridden checkbox
  const [categories, setCategories] = useState([]);
  const [instructionLevels, setInstructionLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);
  const [progress, setProgress] = useState({
    stage: 'idle',
    current: 0,
    total: 0,
    details: {}
  });

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

  // Auto-check checkbox when words are entered (if not manually overridden)
  useEffect(() => {
    if (wordsText.trim().length > 0 && !manualOverride) {
      setMarkAsNew(true);
    }
  }, [wordsText, manualOverride]);

  // Parse words from text area (split by newline, trim, filter empty)
  const parseWords = (text) => {
    return text
      .split('\n')
      .map(word => word.trim())
      .filter(word => word.length > 0);
  };

  // Calculate word count
  const wordCount = parseWords(wordsText).length;

  // Handle word text change
  const handleWordsChange = (e) => {
    setWordsText(e.target.value);
    setError('');
  };

  // Handle card type change
  const handleCardTypeChange = (e) => {
    setCardType(e.target.value);
  };

  // Handle category selection (checkbox-based)
  const handleCategoryChange = (categoryId) => {
    setCategoryIds(prev => {
      if (prev.includes(categoryId)) {
        // Deselect: remove from array
        return prev.filter(id => id !== categoryId);
      } else {
        // Select: add to array
        return [...prev, categoryId];
      }
    });
  };

  // Handle instruction level change
  const handleInstructionLevelChange = (e) => {
    setInstructionLevelId(e.target.value);
  };

  // Handle checkbox change for "Mark as New"
  const handleCheckboxChange = (e) => {
    setMarkAsNew(e.target.checked);
    setManualOverride(true); // User has manually set state
  };

  // Validate form
  const validateForm = () => {
    const words = parseWords(wordsText);
    
    if (words.length < 2) {
      setError('At least 2 words are required');
      return false;
    }
    
    if (words.length > 100) {
      setError('Maximum 100 words allowed');
      return false;
    }

    if (cardType !== 'word' && cardType !== 'phrase') {
      setError('Card type must be "word" or "phrase"');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSummary(null);

    if (!validateForm()) {
      return;
    }

    const words = parseWords(wordsText);
    
    setLoading(true);
    setProgress({
      stage: 'processing',
      current: 0,
      total: words.length,
      details: {}
    });

    try {
      const request = {
        words,
        cardType,
        categoryIds,
        instructionLevelId: instructionLevelId || null,
        markAsNew // Include checkbox state in request
      };

      const result = await processBulkAdd(request, {
        onProgress: (progressUpdate) => {
          setProgress(progressUpdate);
        }
      });

      setSummary(result);
      setLoading(false);
      
      // Call onComplete callback with summary
      if (onComplete) {
        onComplete(result);
      }
    } catch (err) {
      setError(err.message || 'Failed to process bulk add');
      setLoading(false);
      setProgress({
        stage: 'idle',
        current: 0,
        total: 0,
        details: {}
      });
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // If summary is shown, display it
  if (summary) {
    return (
      <BulkAddSummary
        summary={summary}
        onClose={handleCancel}
        onNewOperation={() => {
          setSummary(null);
          setWordsText('');
          setMarkAsNew(true); // Reset checkbox to default
          setManualOverride(false); // Reset manual override
          setProgress({ stage: 'idle', current: 0, total: 0, details: {} });
        }}
      />
    );
  }

  const isValid = wordCount >= 2 && wordCount <= 100;

  return (
    <div className="bulk-add-form">
      <h2>Bulk Add Cards</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="words">
            Words (one per line) *
            {wordCount > 0 && (
              <span className="word-count"> ({wordCount} {wordCount === 1 ? 'word' : 'words'})</span>
            )}
          </label>
          <textarea
            id="words"
            name="words"
            value={wordsText}
            onChange={handleWordsChange}
            placeholder="Paste words here, one per line&#10;Example:&#10;apple&#10;banana&#10;cherry"
            rows={10}
            required
            disabled={loading}
            className={wordCount > 100 ? 'error' : ''}
          />
          {wordCount < 2 && wordCount > 0 && (
            <small className="error-message">At least 2 words are required</small>
          )}
          {wordCount > 100 && (
            <small className="error-message">Maximum 100 words allowed</small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="cardType">Card Type *</label>
          <select
            id="cardType"
            name="cardType"
            value={cardType}
            onChange={handleCardTypeChange}
            required
            disabled={loading}
          >
            <option value="word">Word</option>
            <option value="phrase">Phrase</option>
          </select>
        </div>

        <div className="form-group">
          <label>Categories (optional)</label>
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '4px', 
            padding: '0.5rem',
            maxHeight: '200px',
            overflowY: 'auto',
            backgroundColor: loading ? '#f5f5f5' : '#fff'
          }}>
            {categories.length === 0 ? (
              <div style={{ color: '#666', fontStyle: 'italic', padding: '0.5rem' }}>
                No categories available
              </div>
            ) : (
              categories.map(category => (
                <label
                  key={category.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.25rem 0',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  <input
                    type="checkbox"
                    checked={categoryIds.includes(category.id)}
                    onChange={() => handleCategoryChange(category.id)}
                    disabled={loading}
                    style={{ marginRight: '0.5rem', cursor: loading ? 'not-allowed' : 'pointer' }}
                  />
                  <span>{category.name}</span>
                </label>
              ))
            )}
          </div>
          <small style={{ display: 'block', marginTop: '0.25rem', color: '#666' }}>
            Click to select or deselect categories
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="instructionLevel">Instruction Level (optional)</label>
          <select
            id="instructionLevel"
            name="instructionLevel"
            value={instructionLevelId}
            onChange={handleInstructionLevelChange}
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
        </div>

        <div className="form-group">
          <label htmlFor="markAsNew">
            <input
              type="checkbox"
              id="markAsNew"
              name="markAsNew"
              checked={markAsNew}
              onChange={handleCheckboxChange}
              disabled={loading}
              aria-describedby="markAsNewHelp"
            />
            Mark as New (for review)
          </label>
          <small id="markAsNewHelp" className="help-text">
            Cards will be flagged with the "new" category for review by Tibetan speakers.
          </small>
        </div>

        {error && (
          <div className="form-error" style={{ color: 'red', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {loading && (
          <div className="progress-indicator">
            <p>Processing... {progress.current > 0 && `${progress.current}/${progress.total}`}</p>
            {progress.stage !== 'idle' && (
              <small>Stage: {progress.stage}</small>
            )}
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !isValid}
          >
            {loading ? 'Processing...' : 'Add Cards'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

