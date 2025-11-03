/**
 * CardPreviewModal component
 * Shows a card in study mode format for preview
 */

import { useState } from 'react';
import Flashcard from './Flashcard.jsx';
import './CardPreviewModal.css';

export default function CardPreviewModal({ card, isOpen, onClose }) {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!isOpen || !card) return null;

  const handleFlip = () => {
    setIsFlipped(true);
  };

  const handleBack = () => {
    setIsFlipped(false);
  };

  return (
    <div className="card-preview-modal-overlay" onClick={onClose}>
      <div className="card-preview-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="card-preview-modal-header">
          <h2>Preview Card in Study Mode</h2>
          <button
            type="button"
            className="card-preview-modal-close"
            onClick={onClose}
            aria-label="Close preview"
          >
            ×
          </button>
        </div>
        <div className="card-preview-modal-body">
          <div className="card-preview-hint">
            {!isFlipped ? (
              <p>Click the card to see the back side</p>
            ) : (
              <p>This is how the card appears when flipped in study mode</p>
            )}
          </div>
          <Flashcard
            card={card}
            onFlip={handleFlip}
            isFlipped={isFlipped}
            onFlipChange={setIsFlipped}
          />
          {isFlipped && (
            <div className="card-preview-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleBack}
              >
                Flip Back
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
              >
                Close Preview
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

