import { useState, useRef, useMemo } from 'react';
import { processBulkImageGeneration, filterCardsNeedingImages } from '../utils/bulkImageService.js';
import './BulkImageGenerator.css';

/**
 * BulkImageGenerator component
 * Provides bulk image generation functionality for admin users
 */
export default function BulkImageGenerator({ cards, filters = {}, onComplete }) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    completed: 0,
    failed: 0,
    currentCard: null
  });
  const [result, setResult] = useState(null);
  const abortControllerRef = useRef(null);

  const handleStart = async () => {
    // Filter cards needing images
    const cardsToProcess = filterCardsNeedingImages(cards, filters);
    
    if (cardsToProcess.length === 0) {
      // This case is handled by empty state UI, but double-check
      return;
    }

    // Confirm with user
    const confirmed = window.confirm(
      `Generate images for ${cardsToProcess.length} card(s)? This may take several minutes.`
    );
    if (!confirmed) return;

    // Initialize state
    setIsRunning(true);
    setProgress({
      current: 0,
      total: cardsToProcess.length,
      completed: 0,
      failed: 0,
      currentCard: null
    });
    setResult(null);

    // Create abort controller
    abortControllerRef.current = new AbortController();

    // Process bulk generation
    await processBulkImageGeneration(
      cardsToProcess,
      (progressData) => setProgress(progressData),
      (completionData) => {
        setIsRunning(false);
        setResult(completionData);
        if (onComplete) {
          onComplete(completionData);
        }
      },
      abortControllerRef.current.signal
    );
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsRunning(false);
  };

  const handleCloseResult = () => {
    setResult(null);
  };

  // Memoize filtered cards to avoid recalculating on every render
  const cardsNeedingImages = useMemo(
    () => filterCardsNeedingImages(cards, filters),
    [cards, filters]
  );

  return (
    <div className="bulk-image-generator">
      <div className="bulk-image-header">
        <h3>Bulk Image Generation</h3>
        <button
          className="btn-primary"
          onClick={handleStart}
          disabled={isRunning || cardsNeedingImages.length === 0}
        >
          Bulk Generate Images
        </button>
      </div>

      {cardsNeedingImages.length === 0 && (
        <p className="bulk-image-message">
          All word cards already have images.
        </p>
      )}

      {isRunning && (
        <div className="bulk-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(progress.completed / progress.total) * 100}%` }}
            />
          </div>
          <div className="progress-info">
            <p>
              {progress.completed} of {progress.total} completed
              {progress.failed > 0 && ` (${progress.failed} failed)`}
            </p>
            {progress.currentCard && (
              <p className="current-card">
                Processing: {progress.currentCard.englishText || 
                            progress.currentCard.backEnglish || 
                            progress.currentCard.front}
              </p>
            )}
          </div>
          <button
            className="btn-secondary"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      )}

      {result && (
        <div className="bulk-result-modal">
          <div className="modal-content">
            <h3>Bulk Generation Complete</h3>
            <div className="result-summary">
              <p>✅ Successfully generated: {result.completed}</p>
              <p>❌ Failed: {result.failed}</p>
              {result.cancelled && <p>⚠️ Operation was cancelled</p>}
            </div>
            {result.failures.length > 0 && (
              <div className="failures-list">
                <h4>Failures:</h4>
                <ul>
                  {result.failures.map((failure, idx) => (
                    <li key={idx}>
                      {failure.cardText}: {failure.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button className="btn-primary" onClick={handleCloseResult}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

