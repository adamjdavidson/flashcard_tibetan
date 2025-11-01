import './CardButtons.css';

/**
 * CardButtons component for quality rating
 * Maps button types to Anki SM-2 quality levels
 */
export default function CardButtons({ onRate, disabled }) {
  const buttons = [
    { type: 'forgot', label: 'Forgot', quality: 0, shortcut: '1' },
    { type: 'partial', label: 'Partial Recall', quality: 1, shortcut: '2' },
    { type: 'hard', label: 'Hard Recall', quality: 3, shortcut: '3' },
    { type: 'easy', label: 'Easy Recall', quality: 5, shortcut: '4' },
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
          title={`${button.label} (Press ${button.shortcut})`}
        >
          <span className="button-label">{button.label}</span>
          <span className="button-shortcut" aria-label={`Press ${button.shortcut}`}>[{button.shortcut}]</span>
        </button>
      ))}
    </div>
  );
}

