import { useState } from 'react';
import AddCardForm from './AddCardForm.jsx';
import EditCardForm from './EditCardForm.jsx';
import QuickTranslateForm from './QuickTranslateForm.jsx';
import './CardManager.css';

/**
 * CardManager component for viewing and managing cards
 */
export default function CardManager({ 
  cards, 
  onAddCard, 
  onAddCards, 
  onEditCard, 
  onDeleteCard, 
  isAdmin = false, 
  currentUserId = null, 
  showHeader = true, 
  showQuickTranslate = true,
  // Shared filters from parent (AdminPage/AdminCardManagement)
  filterType = '',
  filterCategory = '',
  filterInstructionLevel = ''
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  // If filters not provided as props, use internal state (for backward compatibility)
  const [internalFilterType, setInternalFilterType] = useState('');
  const [internalFilterCategory, setInternalFilterCategory] = useState('');
  
  // Use props if provided, otherwise use internal state
  const effectiveFilterType = filterType !== undefined ? filterType : internalFilterType;
  const effectiveFilterCategory = filterCategory !== undefined ? filterCategory : internalFilterCategory;

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

  // Filter cards - supports both old category system (card.category) and new classification system (card.categories array)
  const filteredCards = cards.filter(card => {
    // Filter by type
    if (effectiveFilterType && card.type !== effectiveFilterType) return false;
    
    // Filter by category (support both old and new systems)
    if (effectiveFilterCategory) {
      // New classification system: card.categories is an array of objects with id and name
      if (card.categories && Array.isArray(card.categories)) {
        const categoryIds = card.categories.map(cat => cat.id);
        const categoryNames = card.categories.map(cat => cat.name);
        if (!categoryIds.includes(effectiveFilterCategory) && !categoryNames.includes(effectiveFilterCategory)) {
          return false;
        }
      } 
      // Old system: card.category is a string
      else if (card.category && card.category !== effectiveFilterCategory) {
        return false;
      }
      // No category assigned
      else if (!card.categories || card.categories.length === 0) {
        return false;
      }
    }
    
    // Filter by instruction level
    if (filterInstructionLevel && card.instructionLevelId !== filterInstructionLevel) {
      return false;
    }
    
    return true;
  });

  const types = [...new Set(cards.map(c => c.type))];
  // Support both old category system (card.category string) and new (card.categories array)
  const categories = [
    ...new Set(
      cards.flatMap(c => 
        c.categories && Array.isArray(c.categories) 
          ? c.categories.map(cat => cat.name) 
          : (c.category ? [c.category] : [])
      )
    )
  ].filter(Boolean);

  // Check if user can edit/delete a card (own card or admin)
  const canEditCard = (card) => {
    return isAdmin || (currentUserId && card.userId === currentUserId);
  };

  return (
    <div className="card-manager">
      {showHeader && (
        <div className="card-manager-header">
          <h2>Card Library</h2>
          <div className="card-manager-actions">
            <button 
              className="btn-add-card"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? 'Cancel' : '+ Add Card'}
            </button>
          </div>
        </div>
      )}

      {showQuickTranslate && isAdmin && onAddCards && (
        <QuickTranslateForm onAddCards={onAddCards} isAdmin={isAdmin} />
      )}

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
          isAdmin={isAdmin}
        />
      )}

      {!showAddForm && !editingCard && (
        <>
          {/* Only show filters if not provided as props (backward compatibility) */}
          {filterType === undefined && filterCategory === undefined && (
            <div className="filters">
              <div className="filter-group">
                <label htmlFor="filter-type">Filter by Type:</label>
                <select
                  id="filter-type"
                  value={internalFilterType}
                  onChange={(e) => setInternalFilterType(e.target.value)}
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
                  value={internalFilterCategory}
                  onChange={(e) => setInternalFilterCategory(e.target.value)}
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
          )}

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
                        {card.isMaster && (
                          <span className="card-badge master-badge" title="Master Library Card">★ Master</span>
                        )}
                        {card.userId && !card.isMaster && (
                          <span className="card-badge user-badge" title="Your Card">My Card</span>
                        )}
                        {canEditCard(card) && onEditCard && (
                          <button
                            className="btn-edit"
                            onClick={() => setEditingCard(card)}
                            title="Edit card"
                          >
                            ✎
                          </button>
                        )}
                        {canEditCard(card) && onDeleteCard && (
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
                    {/* Show image preview if available */}
                    {card.imageUrl && card.subcategory === 'english_to_tibetan' && (
                      <div className="card-item-image">
                        <img src={card.imageUrl} alt={card.front} />
                      </div>
                    )}
                    <div className="card-item-front">{card.front}</div>
                    <div className="card-item-back">
                      {/* For English→Tibetan word cards: show Tibetan script */}
                      {card.subcategory === 'english_to_tibetan' && card.backTibetanScript && (
                        <div className="card-item-tibetan-script">{card.backTibetanScript}</div>
                      )}
                      {/* For Tibetan→English word cards: show English */}
                      {card.subcategory === 'tibetan_to_english' && card.backEnglish && (
                        <div className="card-item-english">{card.backEnglish}</div>
                      )}
                      {/* For number cards: show Arabic numeral */}
                      {card.backArabic && (card.type === 'number') && (
                        <div className="card-item-english">{card.backArabic}</div>
                      )}
                      {/* For number cards: show Tibetan script or numerals on back */}
                      {card.type === 'number' && card.backTibetanScript && (
                        <div className="card-item-tibetan-script">{card.backTibetanScript}</div>
                      )}
                      {card.type === 'number' && card.backTibetanNumeral && (
                        <div className="card-item-tibetan-numeral">{card.backTibetanNumeral}</div>
                      )}
                      {/* Fallback: show English if no special subcategory and it's not a number card */}
                      {card.subcategory !== 'english_to_tibetan' && card.subcategory !== 'tibetan_to_english' && card.type !== 'number' && card.backEnglish && (
                        <div className="card-item-english">{card.backEnglish}</div>
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

