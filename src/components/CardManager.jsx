import { useState } from 'react';
import AddCardForm from './AddCardForm.jsx';
import EditCardForm from './EditCardForm.jsx';
import './CardManager.css';

/**
 * CardManager component for viewing and managing cards
 */
export default function CardManager({ cards, onAddCard, onEditCard, onDeleteCard }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const handleAddCard = (card) => {
    onAddCard(card);
    setShowAddForm(false);
  };

  const handleEditCard = (card) => {
    onEditCard(card);
    setEditingCard(null);
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
  };

  const filteredCards = cards.filter(card => {
    if (filterType && card.type !== filterType) return false;
    if (filterCategory && card.category !== filterCategory) return false;
    return true;
  });

  const types = [...new Set(cards.map(c => c.type))];
  const categories = [...new Set(cards.map(c => c.category).filter(Boolean))];

  return (
    <div className="card-manager">
      <div className="card-manager-header">
        <h2>Card Library</h2>
        <button 
          className="btn-add-card"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : '+ Add Card'}
        </button>
      </div>

      {showAddForm && (
        <AddCardForm 
          onAdd={handleAddCard} 
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {editingCard && (
        <EditCardForm 
          card={editingCard}
          onSave={handleEditCard}
          onCancel={handleCancelEdit}
        />
      )}

      {!showAddForm && !editingCard && (
        <>
          <div className="filters">
            <div className="filter-group">
              <label htmlFor="filter-type">Filter by Type:</label>
              <select
                id="filter-type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">All Types</option>
                {types.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="filter-category">Filter by Category:</label>
              <select
                id="filter-category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="cards-list">
            <div className="cards-count">
              Showing {filteredCards.length} of {cards.length} cards
            </div>
            {filteredCards.length === 0 ? (
              <div className="no-cards">No cards found.</div>
            ) : (
              <div className="cards-grid">
                {filteredCards.map(card => (
                  <div key={card.id} className="card-item">
                    <div className="card-item-header">
                      <div className="card-item-tags">
                        {card.tags && card.tags.length > 0 && (
                          <span className="card-tag">{card.tags[0]}</span>
                        )}
                      </div>
                      <div className="card-item-actions">
                        {onEditCard && (
                          <button
                            className="btn-edit"
                            onClick={() => setEditingCard(card)}
                            title="Edit card"
                          >
                            ✎
                          </button>
                        )}
                        {onDeleteCard && (
                          <button
                            className="btn-delete"
                            onClick={() => onDeleteCard(card.id)}
                            title="Delete card"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="card-item-front">{card.front}</div>
                    <div className="card-item-back">
                      <div className="card-item-english">{card.backArabic || card.backEnglish}</div>
                      {card.backTibetanScript && (
                        <div className="card-item-tibetan-script">{card.backTibetanScript}</div>
                      )}
                      {card.backTibetanNumeral && (
                        <div className="card-item-tibetan-numeral">{card.backTibetanNumeral}</div>
                      )}
                      {card.backTibetanSpelling && !card.backTibetanScript && !card.backTibetanNumeral && (
                        <div className="card-item-spelling">{card.backTibetanSpelling}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

