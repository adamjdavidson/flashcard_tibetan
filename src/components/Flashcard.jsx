import { useState, useEffect } from 'react';
import './Flashcard.css';

/**
 * Flashcard component that displays a card and flips on click
 * Two card types:
 * 1. Numeral cards: Front = Tibetan numerals → Back = Arabic number + Tibetan Script
 * 2. Script cards: Front = Tibetan Script → Back = Arabic number + Tibetan Numerals
 */
export default function Flashcard({ card, onFlip }) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [card?.id]);

  const handleClick = () => {
    if (!isFlipped) {
      setIsFlipped(true);
      if (onFlip) {
        onFlip();
      }
    }
  };

  const handleTurnBack = (e) => {
    e.stopPropagation(); // Prevent card flip when clicking button
    setIsFlipped(false);
  };

  // Determine card type - check subcategory first, fallback to detection
  const isNumeralCard = card.subcategory === 'numerals' || /[\u0F20-\u0F29]/.test(card.front);
  const isScriptCard = card.subcategory === 'script' || (!isNumeralCard && card.front && /[\u0F00-\u0FFF]/.test(card.front));
  const isWordCard = card.type === 'word' || (card.tags && card.tags.includes('Word'));
  const isEnglishToTibetan = card.subcategory === 'english_to_tibetan';
  const isTibetanToEnglish = card.subcategory === 'tibetan_to_english';

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
            {/* Display image for English→Tibetan word cards */}
            {isEnglishToTibetan && card.imageUrl && (
              <div className="card-image">
                <img src={card.imageUrl} alt={card.front} />
              </div>
            )}
            {isNumeralCard ? (
              <div className="tibetan-numeral">{card.front}</div>
            ) : isEnglishToTibetan ? (
              <div className="english-word">{card.front}</div>
            ) : isTibetanToEnglish ? (
              <div className="tibetan-text">{card.front}</div>
            ) : isScriptCard ? (
              <div className="tibetan-text">{card.front}</div>
            ) : (
              <div className="english-word">{card.front}</div>
            )}
            <div className="hint">Click to reveal answer</div>
          </div>
        </div>
        <div className="flashcard-back">
          <div className="card-content">
            {/* For English→Tibetan word cards: show Tibetan script */}
            {isEnglishToTibetan && card.backTibetanScript ? (
              <div className="tibetan-text">{card.backTibetanScript}</div>
            ) : isTibetanToEnglish && card.backEnglish ? (
              /* For Tibetan→English word cards: show English */
              <div className="english-word">{card.backEnglish}</div>
            ) : (
              <>
                {/* For number cards */}
                {card.backArabic && (
                  <div className="arabic-numeral">{card.backArabic}</div>
                )}
                {/* Show Tibetan Script if it exists (for numeral cards) */}
                {card.backTibetanScript && (
                  <div className="tibetan-text">{card.backTibetanScript}</div>
                )}
                {/* Show Tibetan Numerals if it exists (for script cards) */}
                {card.backTibetanNumeral && (
                  <div className="tibetan-numeral">{card.backTibetanNumeral}</div>
                )}
              </>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
