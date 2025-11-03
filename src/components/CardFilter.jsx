import { useState } from 'react';
import './CardFilter.css';

/**
 * CardFilter component for selecting which card types to study
 * Now includes study direction option for word/phrase cards
 */
export default function CardFilter({ 
  selectedTags, 
  onTagToggle, 
  studyDirection,
  onStudyDirectionChange,
  hasWordPhraseCards = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  const filterOptions = [
    { id: 'all', label: 'All Cards' },
    { id: 'Numerals', label: 'Numerals' },
    { id: 'Numbers', label: 'Numbers' },
    { id: 'First 10', label: 'First 10' },
    { id: 'Word', label: 'Words' }
  ];

  const handleTagSelect = (tagId) => {
    if (tagId === 'all') {
      onTagToggle(['all']);
    } else {
      // Replace current selection with this tag
      onTagToggle([tagId]);
    }
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (selectedTags.includes('all') || selectedTags.length === 0) {
      return 'All Cards';
    }
    const selected = filterOptions.find(opt => selectedTags.includes(opt.id));
    return selected ? selected.label : 'All Cards';
  };

  return (
    <div className="card-filter-dropdown">
      <button 
        className="card-filter-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="filter-label">Study:</span>
        <span className="filter-selected">{getDisplayText()}</span>
        <span className="filter-caret">{isOpen ? '▲' : '▼'}</span>
      </button>
      
      {isOpen && (
        <>
          <div className="filter-backdrop" onClick={() => setIsOpen(false)} />
          <div className="filter-dropdown-menu">
            <div className="filter-section">
              <div className="filter-section-title">Card Types</div>
              {filterOptions.map(option => (
                <button
                  key={option.id}
                  className={`filter-menu-item ${selectedTags.includes(option.id) ? 'selected' : ''}`}
                  onClick={() => handleTagSelect(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            
            {hasWordPhraseCards && onStudyDirectionChange && (
              <div className="filter-section">
                <div className="filter-section-title">Study Direction</div>
                <button
                  className={`filter-menu-item ${studyDirection === 'tibetan_to_english' ? 'selected' : ''}`}
                  onClick={() => {
                    onStudyDirectionChange('tibetan_to_english');
                    setIsOpen(false);
                  }}
                >
                  Tibetan → English
                </button>
                <button
                  className={`filter-menu-item ${studyDirection === 'english_to_tibetan' ? 'selected' : ''}`}
                  onClick={() => {
                    onStudyDirectionChange('english_to_tibetan');
                    setIsOpen(false);
                  }}
                >
                  English → Tibetan
                </button>
                <button
                  className={`filter-menu-item ${studyDirection === 'both' ? 'selected' : ''}`}
                  onClick={() => {
                    onStudyDirectionChange('both');
                    setIsOpen(false);
                  }}
                >
                  Both Directions
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

