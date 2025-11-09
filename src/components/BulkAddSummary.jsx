import { useState } from 'react';
import './BulkAddSummary.css';

/**
 * BulkAddSummary component
 * Displays the results of a bulk add operation
 */
export default function BulkAddSummary({ summary, onClose, onNewOperation }) {
  const [showCreatedCards, setShowCreatedCards] = useState(false);
  const [showDuplicates, setShowDuplicates] = useState(false);

  if (!summary) {
    return null;
  }

  const {
    totalWords,
    cardsCreated,
    duplicatesSkipped,
    translationFailures = [],
    imageFailures = [],
    errors = [],
    createdCards = [],
    duplicateWords = []
  } = summary;

  const hasFailures = translationFailures.length > 0 || imageFailures.length > 0 || errors.length > 0;

  return (
    <div className="bulk-add-summary">
      <h2>Bulk Add Results</h2>

      <div className="summary-stats">
        <div className="stat-card success">
          <div className="stat-value">{cardsCreated}</div>
          <div className="stat-label">Cards Created</div>
        </div>
        <div className="stat-card info">
          <div className="stat-value">{duplicatesSkipped}</div>
          <div className="stat-label">Duplicates Skipped</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalWords}</div>
          <div className="stat-label">Total Words</div>
        </div>
      </div>

      {duplicateWords.length > 0 && (
        <div className="summary-section">
          <button
            className="section-toggle"
            onClick={() => setShowDuplicates(!showDuplicates)}
            aria-expanded={showDuplicates}
          >
            <span>Duplicate Words ({duplicateWords.length})</span>
            <span>{showDuplicates ? '−' : '+'}</span>
          </button>
          {showDuplicates && (
            <div className="word-list">
              {duplicateWords.map((word, index) => (
                <span key={index} className="word-tag">{word}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {translationFailures.length > 0 && (
        <div className="summary-section error">
          <h3>Translation Failures ({translationFailures.length})</h3>
          <ul>
            {translationFailures.map((failure, index) => (
              <li key={index}>
                <strong>{failure.word}:</strong> {failure.error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {imageFailures.length > 0 && (
        <div className="summary-section error">
          <h3>Image Generation Failures ({imageFailures.length})</h3>
          <ul>
            {imageFailures.map((failure, index) => (
              <li key={index}>
                <strong>{failure.word}:</strong> {failure.error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {errors.length > 0 && (
        <div className="summary-section error">
          <h3>Errors ({errors.length})</h3>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>
                <strong>{error.word}:</strong> {error.error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {createdCards.length > 0 && (
        <div className="summary-section">
          <button
            className="section-toggle"
            onClick={() => setShowCreatedCards(!showCreatedCards)}
            aria-expanded={showCreatedCards}
          >
            <span>Created Cards ({createdCards.length})</span>
            <span>{showCreatedCards ? '−' : '+'}</span>
          </button>
          {showCreatedCards && (
            <div className="card-list">
              {createdCards.map((card) => (
                <div key={card.id} className="card-item">
                  <strong>{card.englishText || card.front}</strong>
                  {card.tibetanText && (
                    <span className="tibetan-text">{card.tibetanText}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="summary-actions">
        {onNewOperation && (
          <button
            className="btn-primary"
            onClick={onNewOperation}
          >
            Add More Cards
          </button>
        )}
        {onClose && (
          <button
            className="btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}

