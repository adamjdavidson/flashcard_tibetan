import './CardFilter.css';

/**
 * CardFilter component for selecting which card types to study
 */
export default function CardFilter({ selectedTags, onTagToggle }) {
  const filterOptions = [
    { id: 'all', label: 'All Cards' },
    { id: 'Numerals', label: 'Numerals' },
    { id: 'Numbers', label: 'Numbers' },
    { id: 'First 10', label: 'First 10' },
    { id: 'Word', label: 'Words' }
  ];

  const handleToggle = (tagId) => {
    if (tagId === 'all') {
      // Toggle "All Cards" - if selected, deselect everything; if not, select all
      if (selectedTags.includes('all')) {
        onTagToggle([]);
      } else {
        onTagToggle(['all']);
      }
    } else {
      // For individual tags, toggle them
      if (selectedTags.includes('all')) {
        // If "All" was selected, replace it with this tag
        onTagToggle([tagId]);
      } else if (selectedTags.includes(tagId)) {
        // Deselect this tag
        const newTags = selectedTags.filter(tag => tag !== tagId);
        // If nothing selected, select "All"
        onTagToggle(newTags.length === 0 ? ['all'] : newTags);
      } else {
        // Add this tag
        onTagToggle([...selectedTags, tagId]);
      }
    }
  };

  return (
    <div className="card-filter">
      <div className="filter-label">Study:</div>
      <div className="filter-options">
        {filterOptions.map(option => (
          <label key={option.id} className="filter-checkbox">
            <input
              type="checkbox"
              checked={selectedTags.includes(option.id)}
              onChange={() => handleToggle(option.id)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

