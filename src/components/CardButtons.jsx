import './CardButtons.css';

/**
 * CardButtons component for quality rating
 * Maps button types to Anki SM-2 quality levels
 */
export default function CardButtons({ onRate, disabled }) {
  const buttons = [
    { type: 'forgot', label: 'Forgot', quality: 0 },
    { type: 'partial', label: 'Partial Recall', quality: 1 },
    { type: 'hard', label: 'Hard Recall', quality: 3 },
    { type: 'easy', label: 'Easy Recall', quality: 5 },
  ];

  // Map button types to CSS variable names
  const colorMap = {
    forgot: 'var(--theme-rating-forgot)',
    partial: 'var(--theme-rating-partial)',
    hard: 'var(--theme-rating-hard)',
    easy: 'var(--theme-rating-easy)',
  };

  return (
    <div className="card-buttons">
      {buttons.map((button) => (
        <button
          key={button.type}
          className={`rating-button ${button.type}`}
          onClick={() => onRate(button.type)}
          disabled={disabled}
          style={{ '--button-color': colorMap[button.type] }}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
}

