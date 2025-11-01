import './ProgressStats.css';

/**
 * ProgressStats component displays study statistics
 */
export default function ProgressStats({ stats }) {
  if (!stats) {
    return null;
  }

  return (
    <div className="progress-stats">
      <div className="stat-item">
        <div className="stat-label">Total Cards</div>
        <div className="stat-value">{stats.totalCards}</div>
      </div>
      <div className="stat-item">
        <div className="stat-label">Cards Due</div>
        <div className="stat-value">{stats.cardsDue}</div>
      </div>
      <div className="stat-item">
        <div className="stat-label">Cards Learned</div>
        <div className="stat-value">{stats.cardsLearned}</div>
      </div>
      <div className="stat-item">
        <div className="stat-label">Total Reviews</div>
        <div className="stat-value">{stats.totalReviews}</div>
      </div>
    </div>
  );
}

