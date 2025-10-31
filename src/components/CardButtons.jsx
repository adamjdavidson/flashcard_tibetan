import './CardButtons.css';

/**
 * CardButtons component for quality rating
 * Maps button types to SM-2 quality levels
 */
export default function CardButtons({ onRate, disabled }) {
  const buttons = [
    { type: 'again', label: 'Again', quality: 0, color: '#ef4444' },
    { type: 'hard', label: 'Hard', quality: 1, color: '#f59e0b' },
    { type: 'good', label: 'Good', quality: 3, color: '#10b981' },
    { type: 'easy', label: 'Easy', quality: 5, color: '#3b82f6' },
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

