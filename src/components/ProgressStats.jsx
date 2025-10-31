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
        <div className="stat-value">{stats.totalCards}</div>
        <div className="stat-label">Total Cards</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{stats.cardsDue}</div>
        <div className="stat-label">Cards Due</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{stats.cardsLearned}</div>
        <div className="stat-label">Cards Learned</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{stats.totalReviews}</div>
        <div className="stat-label">Total Reviews</div>
      </div>
    </div>
  );
}

