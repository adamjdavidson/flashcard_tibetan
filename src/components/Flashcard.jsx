import { useState, useEffect } from 'react';
import AudioPlayer from './AudioPlayer.jsx';
import { containsTibetan } from '../utils/tibetanUtils.js';
import { getTibetanText, getEnglishText, ensureBidirectionalFields } from '../data/cardSchema.js';
import './Flashcard.css';

/**
 * Flashcard component that displays a card and flips on click
 * 
 * Card types:
 * 1. Number cards (numerals/script): Uses legacy front/back structure
 * 2. Word/phrase cards: Uses new bidirectional fields (tibetanText/englishText) with studyDirection
 * 
 * @param {Object} card - Card object
 * @param {Function} onFlip - Callback when card is flipped
 * @param {boolean} isFlipped - External flip state (controlled)
 * @param {Function} onFlipChange - Callback for flip state changes
 * @param {string} studyDirection - 'tibetan_to_english' | 'english_to_tibetan' (for word/phrase cards)
 */
export default function Flashcard({ card, onFlip, isFlipped: externalIsFlipped, onFlipChange, studyDirection = 'tibetan_to_english' }) {
  // Use external isFlipped if provided, otherwise use internal state
  const [internalIsFlipped, setInternalIsFlipped] = useState(false);
  const isFlipped = externalIsFlipped !== undefined ? externalIsFlipped : internalIsFlipped;
  
  // T007: Add imageError state for graceful error handling
  const [imageError, setImageError] = useState(false);

  // Reset flip state when card changes (only on card ID change, not flip state change)
  // T008: Reset imageError when card ID changes
  useEffect(() => {
    setImageError(false); // Reset image error when card changes
    if (externalIsFlipped !== undefined) {
      // Controlled: external state handles reset
      if (onFlipChange) {
        onFlipChange(false);
      }
    } else {
      // Uncontrolled: reset internal state
      setInternalIsFlipped(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card?.id]); // Only reset when card ID changes, not when flip state changes

  const handleClick = () => {
    if (!isFlipped) {
      if (externalIsFlipped !== undefined && onFlipChange) {
        // Controlled: update external state
        onFlipChange(true);
      } else {
        // Uncontrolled: update internal state
        setInternalIsFlipped(true);
      }
      if (onFlip) {
        onFlip();
      }
    }
  };

  const handleTurnBack = (e) => {
    e.stopPropagation(); // Prevent card flip when clicking button
    if (externalIsFlipped !== undefined && onFlipChange) {
      // Controlled: update external state
      onFlipChange(false);
    } else {
      // Uncontrolled: update internal state
      setInternalIsFlipped(false);
    }
  };

  // Ensure card has bidirectional fields populated (from legacy fields if needed)
  const cardWithBidirectionalFields = ensureBidirectionalFields(card);
  
  // Determine card type
  const isNumberCard = card.type === 'number';
  const isWordPhraseCard = card.type === 'word' || card.type === 'phrase';
  
  // For number cards: determine sub-type
  const isNumeralCard = card.subcategory === 'numerals' || /[\u0F20-\u0F29]/.test(card.front || '');
  const isScriptCard = card.subcategory === 'script' || (!isNumeralCard && card.front && /[\u0F00-\u0FFF]/.test(card.front));
  
  // For word/phrase cards: get text based on study direction
  const tibetanText = isWordPhraseCard ? getTibetanText(cardWithBidirectionalFields) : null;
  const englishText = isWordPhraseCard ? getEnglishText(cardWithBidirectionalFields) : null;
  
  // Determine what to show on front and back based on study direction (for word/phrase cards)
  const frontText = isWordPhraseCard 
    ? (studyDirection === 'tibetan_to_english' ? tibetanText : englishText)
    : card.front;
  const backText = isWordPhraseCard
    ? (studyDirection === 'tibetan_to_english' ? englishText : tibetanText)
    : null;

  // T009: Create shouldDisplayImage helper function
  // T010: Determine front text language using containsTibetan utility
  // T018: Enhance shouldDisplayImage function to add randomization for Tibetan text
  const shouldDisplayImage = (text, imageUrl) => {
    if (!imageUrl || !text) return false;
    
    const isTibetan = containsTibetan(text);
    if (!isTibetan) {
      return true; // Always show for English (User Story 1)
    }
    
    // T019: Random for Tibetan (50% chance) - User Story 2
    // T020: Randomization happens on each render (not cached per card)
    return Math.random() < 0.5;
  };

  // Determine if image should be displayed based on front text language
  const showImage = card.imageUrl && shouldDisplayImage(frontText, card.imageUrl) && !imageError;

  return (
    <div className="flashcard-wrapper">
      {isFlipped && (
        <button 
          className="turn-button"
          onClick={handleTurnBack}
          aria-label="Turn card back"
        >
          ↺ Turn
        </button>
      )}
      <div 
        className={`flashcard ${isFlipped ? 'flipped' : ''}`}
        onClick={handleClick}
      >
        <div className="flashcard-inner">
        <div className="flashcard-front">
          <div className="card-content">
            {/* T011: Replace existing image display logic with conditional logic for English text */}
            {/* T012: Add onError handler to img tag for graceful error handling */}
            {showImage && (
              <div className="card-image">
                <img 
                  src={card.imageUrl} 
                  alt={englishText || tibetanText || card.front || 'Card'}
                  onError={() => setImageError(true)}
                />
              </div>
            )}
            <div className="card-text-wrapper">
              {isNumberCard ? (
                /* Number cards - legacy structure */
                isNumeralCard ? (
                  <div className="tibetan-numeral">{card.front}</div>
                ) : isScriptCard ? (
                  <div className="tibetan-text">{card.front}</div>
                ) : (
                  <div className="tibetan-text">{card.front}</div>
                )
              ) : isWordPhraseCard ? (
                /* Word/phrase cards - use new bidirectional fields */
                frontText ? (
                  studyDirection === 'tibetan_to_english' ? (
                    <div className="tibetan-text">{frontText}</div>
                  ) : (
                    <div className="english-word">{frontText}</div>
                  )
                ) : (
                  <div className="card-error">Card data missing</div>
                )
              ) : (
                /* Legacy word/phrase cards - fallback */
                containsTibetan(card.front || '') ? (
                  <div className="tibetan-text">{card.front}</div>
                ) : (
                  <div className="english-word">{card.front}</div>
                )
              )}
              {/* Show audio button only if there's Tibetan text on the front and audio URL */}
              {card.audioUrl && isWordPhraseCard && studyDirection === 'tibetan_to_english' && frontText && containsTibetan(frontText) && (
                <AudioPlayer audioUrl={card.audioUrl} label="Listen" />
              )}
              {/* Legacy: audio for non-bidirectional cards */}
              {card.audioUrl && !isWordPhraseCard && containsTibetan(frontText || '') && (
                <AudioPlayer audioUrl={card.audioUrl} label="Listen" />
              )}
            </div>
            <div className="hint">Click or press Space to reveal answer</div>
          </div>
        </div>
        <div className="flashcard-back">
          <div className="card-content">
            {isNumberCard ? (
              /* Number cards - legacy structure */
              <>
                {card.backArabic && (
                  <div className="arabic-numeral">{card.backArabic}</div>
                )}
                {/* Show Tibetan Script if it exists (for numeral cards) */}
                {card.backTibetanScript && (
                  <div className="card-text-wrapper">
                    <div className="tibetan-text">{card.backTibetanScript}</div>
                    {/* Show audio button if there's Tibetan text and audio URL */}
                    {card.audioUrl && containsTibetan(card.backTibetanScript) && (
                      <AudioPlayer audioUrl={card.audioUrl} label="Listen" />
                    )}
                  </div>
                )}
                {/* Show Tibetan Numerals if it exists (for script cards) */}
                {card.backTibetanNumeral && (
                  <div className="card-text-wrapper">
                    <div className="tibetan-numeral">{card.backTibetanNumeral}</div>
                    {/* Show audio button if there's Tibetan text and audio URL */}
                    {card.audioUrl && containsTibetan(card.backTibetanNumeral) && (
                      <AudioPlayer audioUrl={card.audioUrl} label="Listen" />
                    )}
                  </div>
                )}
              </>
            ) : isWordPhraseCard ? (
              /* Word/phrase cards - use new bidirectional fields */
              backText ? (
                <div className="card-text-wrapper">
                  {studyDirection === 'tibetan_to_english' ? (
                    <div className="english-word">{backText}</div>
                  ) : (
                    <>
                      <div className="tibetan-text">{backText}</div>
                      {/* Show audio button if there's Tibetan text and audio URL */}
                      {card.audioUrl && containsTibetan(backText) && (
                        <AudioPlayer audioUrl={card.audioUrl} label="Listen" />
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="card-error">Card data missing</div>
              )
            ) : (
              /* Legacy word/phrase cards - backward compatibility */
              <>
                {/* Legacy: For English→Tibetan word cards: show Tibetan script */}
                {card.subcategory === 'english_to_tibetan' && card.backTibetanScript ? (
                  <div className="card-text-wrapper">
                    <div className="tibetan-text">{card.backTibetanScript}</div>
                    {card.audioUrl && containsTibetan(card.backTibetanScript) && (
                      <AudioPlayer audioUrl={card.audioUrl} label="Listen" />
                    )}
                  </div>
                ) : card.subcategory === 'tibetan_to_english' && card.backEnglish ? (
                  /* Legacy: For Tibetan→English word cards: back is English */
                  <div className="english-word">{card.backEnglish}</div>
                ) : null}
              </>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
