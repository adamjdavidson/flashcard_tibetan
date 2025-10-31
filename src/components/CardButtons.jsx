import './CardButtons.css';

/**
 * CardButtons component for quality rating
 * Maps button types to Anki SM-2 quality levels
 */
export default function CardButtons({ onRate, disabled }) {
  const buttons = [
    { type: 'forgot', label: 'Forgot', quality: 0, color: '#ef4444' },
    { type: 'partial', label: 'Partial Recall', quality: 1, color: '#f59e0b' },
    { type: 'hard', label: 'Hard Recall', quality: 3, color: '#10b981' },
    { type: 'easy', label: 'Easy Recall', quality: 5, color: '#3b82f6' },
  ];

  return (
    <div className="card-buttons">
      {buttons.map((button) => (
        <button
          key={button.type}
          className={`rating-button ${button.type}`}
          onClick={() => onRate(button.type)}
          disabled={disabled}
          style={{ '--button-color': button.color }}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
}

