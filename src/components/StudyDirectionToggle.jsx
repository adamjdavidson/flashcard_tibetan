/**
 * StudyDirectionToggle component
 * Allows users to toggle between Tibetan-to-English and English-to-Tibetan study modes
 */

import { useState, useEffect } from 'react';
import { loadStudyPreferences, saveStudyPreferences, getDefaultDirection } from '../services/studyPreferencesService.js';
import { useAuth } from '../hooks/useAuth.js';
import './StudyDirectionToggle.css';

/**
 * StudyDirectionToggle component
 * @param {string} currentDirection - Current study direction ('tibetan_to_english' | 'english_to_tibetan')
 * @param {Function} onDirectionChange - Callback when direction changes
 */
export default function StudyDirectionToggle({ currentDirection, onDirectionChange }) {
  const { user } = useAuth();
  const [direction, setDirection] = useState(currentDirection || getDefaultDirection());
  const [loading, setLoading] = useState(false);

  // Load user preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.id) {
        // Use default if no user
        const defaultDir = currentDirection || getDefaultDirection();
        setDirection(defaultDir);
        if (onDirectionChange) {
          onDirectionChange(defaultDir);
        }
        return;
      }

      try {
        const result = await loadStudyPreferences(user.id);
        if (result.success && result.preferredDirection) {
          const prefDirection = result.preferredDirection;
          setDirection(prefDirection);
          if (onDirectionChange) {
            onDirectionChange(prefDirection);
          }
        } else {
          // Use default or current direction
          const defaultDir = currentDirection || getDefaultDirection();
          setDirection(defaultDir);
          if (onDirectionChange) {
            onDirectionChange(defaultDir);
          }
        }
      } catch (err) {
        console.error('Error loading study preferences:', err);
        // Use default or current direction
        const defaultDir = currentDirection || getDefaultDirection();
        setDirection(defaultDir);
        if (onDirectionChange) {
          onDirectionChange(defaultDir);
        }
      }
    };

    loadPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Only reload if user changes - onDirectionChange is stable, direction updates handled separately

  // Update when currentDirection prop changes externally
  useEffect(() => {
    if (currentDirection && currentDirection !== direction) {
      setDirection(currentDirection);
    }
  }, [currentDirection, direction]);

  const handleToggle = async (newDirection) => {
    if (newDirection === direction || loading) {
      return;
    }

    setLoading(true);
    setDirection(newDirection);

    // Save preference if user is logged in
    if (user?.id) {
      try {
        await saveStudyPreferences(user.id, newDirection);
      } catch (err) {
        console.error('Error saving study preferences:', err);
        // Continue anyway - preference save is not critical
      }
    }

    // Notify parent component
    if (onDirectionChange) {
      onDirectionChange(newDirection);
    }

    setLoading(false);
  };

  return (
    <div className="study-direction-toggle" role="radiogroup" aria-label="Study direction">
      <label className="toggle-option">
        <input
          type="radio"
          name="studyDirection"
          value="tibetan_to_english"
          checked={direction === 'tibetan_to_english'}
          onChange={() => handleToggle('tibetan_to_english')}
          disabled={loading}
          aria-label="Tibetan to English"
        />
        <span className="toggle-label">Tibetan → English</span>
      </label>
      <label className="toggle-option">
        <input
          type="radio"
          name="studyDirection"
          value="english_to_tibetan"
          checked={direction === 'english_to_tibetan'}
          onChange={() => handleToggle('english_to_tibetan')}
          disabled={loading}
          aria-label="English to Tibetan"
        />
        <span className="toggle-label">English → Tibetan</span>
      </label>
    </div>
  );
}

