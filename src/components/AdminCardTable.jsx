/**
 * AdminCardTable component
 * Displays cards in a table/spreadsheet format for admins
 * Supports sorting, pagination, and filtering
 */

import { useState, useMemo } from 'react';
import './AdminCardTable.css';

export default function AdminCardTable({ 
  cards, 
  loading = false,
  onEdit,
  onDelete,
  filterType = '',
  filterCategory = '',
  filterInstructionLevel = ''
}) {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Filter cards based on type, category, and instruction level
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      if (filterType && card.type !== filterType) return false;
      if (filterCategory && card.categories) {
        const categoryIds = card.categories.map(cat => cat.id);
        const categoryNames = card.categories.map(cat => cat.name);
        if (!categoryIds.includes(filterCategory) && !categoryNames.includes(filterCategory)) {
          return false;
        }
      }
      if (filterInstructionLevel && card.instructionLevelId !== filterInstructionLevel) {
        return false;
      }
      return true;
    });
  }, [cards, filterType, filterCategory, filterInstructionLevel]);

  // Sort filtered cards
  const sortedCards = useMemo(() => {
    if (!sortColumn) return filteredCards;

    const sorted = [...filteredCards];
    sorted.sort((a, b) => {
      let aValue, bValue;

      switch (sortColumn) {
        case 'type':
          aValue = a.type || '';
          bValue = b.type || '';
          break;
        case 'front':
          aValue = a.front || '';
          bValue = b.front || '';
          break;
        case 'backContent':
          // Show summary of back content
          aValue = a.backEnglish || a.backArabic || a.backTibetanScript || '';
          bValue = b.backEnglish || b.backArabic || b.backTibetanScript || '';
          break;
        case 'categories':
          aValue = a.categories && a.categories.length > 0 ? a.categories[0].name : '';
          bValue = b.categories && b.categories.length > 0 ? b.categories[0].name : '';
          break;
        case 'instructionLevel':
          aValue = a.instructionLevel ? a.instructionLevel.name : '';
          bValue = b.instructionLevel ? b.instructionLevel.name : '';
          break;
        case 'createdAt':
          aValue = a.createdAt || 0;
          bValue = b.createdAt || 0;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredCards, sortColumn, sortDirection]);

  // Paginate sorted cards
  const paginatedCards = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedCards.slice(startIndex, endIndex);
  }, [sortedCards, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedCards.length / pageSize);

  // Handle column header click for sorting
  const handleSort = (column) => {
    if (sortColumn === column) {
      // Toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Get sort indicator for column header
  const getSortIndicator = (column) => {
    if (sortColumn !== column) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Get back content summary
  const getBackContentSummary = (card) => {
    if (card.backEnglish) return card.backEnglish.substring(0, 50) + (card.backEnglish.length > 50 ? '...' : '');
    if (card.backArabic) return card.backArabic;
    if (card.backTibetanScript) return card.backTibetanScript.substring(0, 50) + (card.backTibetanScript.length > 50 ? '...' : '');
    return '';
  };

  // Get categories display
  const getCategoriesDisplay = (card) => {
    if (!card.categories || card.categories.length === 0) return 'None';
    return card.categories.map(cat => cat.name).join(', ');
  };

  if (loading) {
    return (
      <div className="admin-card-table-loading">
        <div className="loading-spinner">Loading cards...</div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="admin-card-table-empty">
        <p>No cards found.</p>
      </div>
    );
  }

  return (
    <div className="admin-card-table">
      <div className="admin-card-table-header">
        <div className="table-info">
          <span>Showing {paginatedCards.length} of {sortedCards.length} cards</span>
          {sortedCards.length !== cards.length && (
            <span className="filtered-info"> (filtered from {cards.length} total)</span>
          )}
        </div>
        <div className="table-pagination-controls">
          <label htmlFor="page-size-select">Rows per page:</label>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="page-size-select"
          >
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="admin-table" role="table" aria-label="Card management table">
          <thead>
            <tr>
              <th>
                <button
                  type="button"
                  className="sortable-header"
                  onClick={() => handleSort('type')}
                  aria-label={`Sort by type ${sortColumn === 'type' ? `(${sortDirection})` : ''}`}
                >
                  Type {getSortIndicator('type')}
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="sortable-header"
                  onClick={() => handleSort('front')}
                  aria-label={`Sort by front ${sortColumn === 'front' ? `(${sortDirection})` : ''}`}
                >
                  Front {getSortIndicator('front')}
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="sortable-header"
                  onClick={() => handleSort('backContent')}
                  aria-label={`Sort by back content ${sortColumn === 'backContent' ? `(${sortDirection})` : ''}`}
                >
                  Back Content {getSortIndicator('backContent')}
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="sortable-header"
                  onClick={() => handleSort('categories')}
                  aria-label={`Sort by categories ${sortColumn === 'categories' ? `(${sortDirection})` : ''}`}
                >
                  Categories {getSortIndicator('categories')}
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="sortable-header"
                  onClick={() => handleSort('instructionLevel')}
                  aria-label={`Sort by instruction level ${sortColumn === 'instructionLevel' ? `(${sortDirection})` : ''}`}
                >
                  Instruction Level {getSortIndicator('instructionLevel')}
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="sortable-header"
                  onClick={() => handleSort('createdAt')}
                  aria-label={`Sort by created date ${sortColumn === 'createdAt' ? `(${sortDirection})` : ''}`}
                >
                  Created Date {getSortIndicator('createdAt')}
                </button>
              </th>
              <th className="actions-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCards.map(card => (
              <tr key={card.id}>
                <td className="type-cell">
                  <span className="card-type-badge">{card.type}</span>
                </td>
                <td className="front-cell" title={card.front}>
                  {card.front}
                </td>
                <td className="back-content-cell" title={getBackContentSummary(card)}>
                  {getBackContentSummary(card) || 'N/A'}
                </td>
                <td className="categories-cell">
                  {getCategoriesDisplay(card)}
                </td>
                <td className="instruction-level-cell">
                  {card.instructionLevel ? card.instructionLevel.name : 'None'}
                </td>
                <td className="created-date-cell">
                  {formatDate(card.createdAt)}
                </td>
                <td className="actions-cell">
                  <div className="table-actions">
                    {onEdit && (
                      <button
                        type="button"
                        className="btn-table-edit"
                        onClick={() => onEdit(card)}
                        aria-label={`Edit card ${card.front}`}
                        title="Edit card"
                      >
                        ✎
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        className="btn-table-delete"
                        onClick={() => onDelete(card.id)}
                        aria-label={`Delete card ${card.front}`}
                        title="Delete card"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="table-pagination">
          <button
            type="button"
            className="pagination-btn"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            className="pagination-btn"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

