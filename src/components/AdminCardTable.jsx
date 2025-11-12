/**
 * AdminCardTable component
 * Displays cards in a table/spreadsheet format for admins
 * Supports sorting, pagination, and filtering
 */

import { useState, useMemo, useEffect, useRef, memo, useCallback } from 'react';
import { mark, measure, clearMarks, clearMeasures, checkThreshold } from '../utils/performance.js';
import './AdminCardTable.css';

export default function AdminCardTable({ 
  cards, 
  loading = false,
  onAdd,
  onEdit,
  onDelete,
  onPreview,
  filterType = '',
  filterCategory = '',
  filterInstructionLevel = ''
}) {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const tableRef = useRef(null);

  // Filter cards based on type, category, and instruction level
  const filteredCards = useMemo(() => {
    // Performance monitoring for filtering
    const filterStartMark = 'table-filter-start';
    mark(filterStartMark);

    const filtered = cards.filter(card => {
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

    // Measure filter performance
    const filterEndMark = 'table-filter-end';
    mark(filterEndMark);
    const filterDuration = measure('table-filter-duration', filterStartMark, filterEndMark);
    if (filterDuration !== null) {
      checkThreshold('FILTER', filterDuration);
      clearMarks(filterStartMark);
      clearMarks(filterEndMark);
      clearMeasures('table-filter-duration');
    }

    return filtered;
  }, [cards, filterType, filterCategory, filterInstructionLevel]);

  // Sort filtered cards
  const sortedCards = useMemo(() => {
    if (!sortColumn) return filteredCards;

    // Performance monitoring for sorting
    const sortStartMark = 'table-sort-start';
    mark(sortStartMark);

    const sorted = [...filteredCards];
    sorted.sort((a, b) => {
      let aValue, bValue;

      switch (sortColumn) {
        case 'type':
          aValue = a.type || '';
          bValue = b.type || '';
          break;
        case 'front':
        case 'tibetan':
          // For word/phrase cards, use new bidirectional fields
          if (a.type === 'word' || a.type === 'phrase') {
            aValue = a.tibetanText || a.front || '';
          } else {
            aValue = a.front || '';
          }
          if (b.type === 'word' || b.type === 'phrase') {
            bValue = b.tibetanText || b.front || '';
          } else {
            bValue = b.front || '';
          }
          break;
        case 'backContent':
        case 'english':
          // For word/phrase cards, use new bidirectional fields
          if (a.type === 'word' || a.type === 'phrase') {
            aValue = a.englishText || a.backEnglish || '';
          } else {
            aValue = a.backEnglish || a.backArabic || a.backTibetanScript || '';
          }
          if (b.type === 'word' || b.type === 'phrase') {
            bValue = b.englishText || b.backEnglish || '';
          } else {
            bValue = b.backEnglish || b.backArabic || b.backTibetanScript || '';
          }
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

    // Measure sort performance
    const sortEndMark = 'table-sort-end';
    mark(sortEndMark);
    const sortDuration = measure('table-sort-duration', sortStartMark, sortEndMark);
    if (sortDuration !== null) {
      checkThreshold('SORT', sortDuration);
      clearMarks(sortStartMark);
      clearMarks(sortEndMark);
      clearMeasures('table-sort-duration');
    }

    return sorted;
  }, [filteredCards, sortColumn, sortDirection]);

  // Paginate sorted cards
  const paginatedCards = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedCards.slice(startIndex, endIndex);
  }, [sortedCards, currentPage, pageSize]);

  // Measure table render performance when cards change
  useEffect(() => {
    if (cards.length > 0 && !loading) {
      const renderStartMark = 'table-render-start';
      mark(renderStartMark);
      
      // Use requestAnimationFrame to measure after render
      requestAnimationFrame(() => {
        const renderEndMark = 'table-render-end';
        mark(renderEndMark);
        const renderDuration = measure('table-render-duration', renderStartMark, renderEndMark);
        if (renderDuration !== null) {
          // Check threshold only for large datasets (1000+ cards)
          if (cards.length >= 1000) {
            checkThreshold('TABLE_RENDER', renderDuration);
          }
          clearMarks(renderStartMark);
          clearMarks(renderEndMark);
          clearMeasures('table-render-duration');
        }
      });
    }
  }, [cards.length, loading]);

  const totalPages = Math.ceil(sortedCards.length / pageSize);

  // Memoize expensive computation for column header labels
  // This prevents O(n) filteredCards.every() from running multiple times per render
  const allWordPhrase = useMemo(() => {
    if (filterType === 'word' || filterType === 'phrase') {
      return false; // If filtering by word/phrase, we don't need to check all cards
    }
    return filteredCards.length > 0 && filteredCards.every(c => c.type === 'word' || c.type === 'phrase');
  }, [filterType, filteredCards]);

  const hasWordPhrase = filterType === 'word' || filterType === 'phrase';
  const showTibetanEnglishLabels = hasWordPhrase || allWordPhrase;

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

  // Format date - memoized to prevent TableRow re-renders
  const formatDate = useCallback((timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  }, []);

  // Get front content - use new bidirectional fields for word/phrase cards
  // Memoized to prevent TableRow re-renders
  const getFrontContent = useCallback((card) => {
    // For word/phrase cards, use new bidirectional fields
    if (card.type === 'word' || card.type === 'phrase') {
      // Prefer new fields, fallback to legacy
      if (card.tibetanText) return card.tibetanText;
      if (card.front) return card.front;
      return '';
    }
    // For number cards, use legacy front field
    return card.front || '';
  }, []);

  // Get back content summary
  // For word/phrase cards, prefer new bidirectional fields; fallback to legacy fields
  // Memoized to prevent TableRow re-renders
  const getBackContentSummary = useCallback((card) => {
    // For word/phrase cards, use new bidirectional fields
    if (card.type === 'word' || card.type === 'phrase') {
      if (card.englishText) {
        return card.englishText.substring(0, 50) + (card.englishText.length > 50 ? '...' : '');
      }
      // Fallback to legacy fields
      if (card.backEnglish) return card.backEnglish.substring(0, 50) + (card.backEnglish.length > 50 ? '...' : '');
      if (card.backTibetanScript) return card.backTibetanScript.substring(0, 50) + (card.backTibetanScript.length > 50 ? '...' : '');
    }
    // For number cards, use legacy fields
    if (card.backEnglish) return card.backEnglish.substring(0, 50) + (card.backEnglish.length > 50 ? '...' : '');
    if (card.backArabic) return card.backArabic;
    if (card.backTibetanScript) return card.backTibetanScript.substring(0, 50) + (card.backTibetanScript.length > 50 ? '...' : '');
    return '';
  }, []);

  // Get categories display - memoized to prevent TableRow re-renders
  const getCategoriesDisplay = useCallback((card) => {
    if (!card.categories || card.categories.length === 0) return 'None';
    return card.categories.map(cat => cat.name).join(', ');
  }, []);

  // Memoized table row component for performance optimization
  const TableRow = memo(({ card, rowIndex, onEdit, onDelete, onPreview, getFrontContent, getBackContentSummary, getCategoriesDisplay, formatDate }) => {
    const cellId = (colIndex) => `cell-${card.id}-${colIndex}`;
    
    return (
      <tr aria-rowindex={rowIndex}>
        <td 
          className="type-cell" 
          aria-colindex={1}
          id={cellId(1)}
          aria-describedby={cellId(1)}
        >
          <span className="card-type-badge">{card.type}</span>
        </td>
        <td 
          className="front-cell" 
          title={getFrontContent(card)}
          aria-colindex={2}
          id={cellId(2)}
          aria-describedby={cellId(2)}
        >
          {getFrontContent(card)}
        </td>
        <td 
          className="back-content-cell" 
          title={getBackContentSummary(card)}
          aria-colindex={3}
          id={cellId(3)}
          aria-describedby={cellId(3)}
        >
          {getBackContentSummary(card) || 'N/A'}
        </td>
        <td 
          className="categories-cell"
          aria-colindex={4}
          id={cellId(4)}
          aria-describedby={cellId(4)}
        >
          {getCategoriesDisplay(card)}
        </td>
        <td 
          className="instruction-level-cell"
          aria-colindex={5}
          id={cellId(5)}
          aria-describedby={cellId(5)}
        >
          {card.instructionLevel ? card.instructionLevel.name : 'None'}
        </td>
        <td 
          className="created-date-cell"
          aria-colindex={6}
          id={cellId(6)}
          aria-describedby={cellId(6)}
        >
          {formatDate(card.createdAt)}
        </td>
        <td 
          className="actions-cell"
          aria-colindex={7}
          id={cellId(7)}
          aria-describedby={cellId(7)}
        >
          <div className="table-actions">
            {onPreview && (
              <button
                type="button"
                className="btn-table-preview"
                onClick={() => onPreview(card)}
                aria-label={`Preview card ${card.front} in study mode`}
                title="Preview in study mode"
              >
                👁️
              </button>
            )}
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
    );
  }, (prevProps, nextProps) => {
    // Custom comparison: only re-render if card data actually changed
    return (
      prevProps.card.id === nextProps.card.id &&
      prevProps.card.updated_at === nextProps.card.updated_at &&
      prevProps.card.front === nextProps.card.front &&
      prevProps.card.type === nextProps.card.type &&
      JSON.stringify(prevProps.card.categories) === JSON.stringify(nextProps.card.categories) &&
      prevProps.card.instructionLevel?.id === nextProps.card.instructionLevel?.id &&
      prevProps.rowIndex === nextProps.rowIndex &&
      prevProps.onEdit === nextProps.onEdit &&
      prevProps.onDelete === nextProps.onDelete &&
      prevProps.onPreview === nextProps.onPreview
    );
  });
  
  TableRow.displayName = 'TableRow';

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!tableRef.current) return;

      // Handle Enter key on sortable headers
      if (e.key === 'Enter' && e.target.classList.contains('sortable-header')) {
        e.preventDefault();
        const button = e.target.closest('button');
        if (button) {
          const ariaLabel = button.getAttribute('aria-label') || '';
          // Extract column name from aria-label (e.g., "Sort by front" -> "front")
          const columnMatch = ariaLabel.match(/sort by ([\w\s]+)/i);
          if (columnMatch) {
            let colName = columnMatch[1].trim().toLowerCase().replace(/\s+/g, '');
            // Map common names to actual column identifiers
            const columnMap = {
              type: 'type',
              front: 'front',
              backcontent: 'backContent',
              categories: 'categories',
              instructionlevel: 'instructionLevel',
              createddate: 'createdAt'
            };
            const actualColumn = columnMap[colName] || colName;
            handleSort(actualColumn);
          }
        }
      }

      // Handle Escape key to clear focus
      if (e.key === 'Escape') {
        if (document.activeElement) {
          document.activeElement.blur();
        }
      }

      // Handle Arrow keys for table navigation (only when focus is in table)
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && tableRef.current.contains(document.activeElement)) {
        const focusableElements = tableRef.current.querySelectorAll(
          'button:not(:disabled), a, input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
        );
        const focusableArray = Array.from(focusableElements);
        const currentIndex = focusableArray.indexOf(document.activeElement);

        if (currentIndex !== -1) {
          e.preventDefault();
          const nextIndex = e.key === 'ArrowDown' 
            ? Math.min(currentIndex + 1, focusableArray.length - 1)
            : Math.max(currentIndex - 1, 0);
          
          focusableArray[nextIndex]?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // handleSort is stable and doesn't need to be in dependencies

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
      {/* ARIA live region for screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {loading && 'Loading cards'}
        {!loading && cards.length > 0 && `Table displaying ${sortedCards.length} of ${cards.length} cards`}
        {!loading && cards.length === 0 && 'No cards found'}
      </div>
      
      <div className="admin-card-table-header">
        <div className="table-info">
          <span>Showing {paginatedCards.length} of {sortedCards.length} cards</span>
          {sortedCards.length !== cards.length && (
            <span className="filtered-info"> (filtered from {cards.length} total)</span>
          )}
        </div>
        <div className="table-header-actions">
          {onAdd && (
            <button
              type="button"
              className="btn-primary"
              onClick={onAdd}
              aria-label="Add new card"
              title="Add Card"
            >
              + Add Card
            </button>
          )}
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
      </div>

      <div className="table-container">
        <table 
          ref={tableRef}
          className="admin-table" 
          role="table" 
          aria-label="Card management table"
          tabIndex={0}
          aria-rowcount={sortedCards.length}
          aria-colcount={7}
        >
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
                  aria-label={`Sort by ${showTibetanEnglishLabels ? 'Tibetan' : 'Front'} ${sortColumn === 'front' ? `(${sortDirection})` : ''}`}
                >
                  {showTibetanEnglishLabels ? 'Tibetan' : 'Front'} {getSortIndicator('front')}
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="sortable-header"
                  onClick={() => handleSort('backContent')}
                  aria-label={`Sort by ${showTibetanEnglishLabels ? 'English' : 'Back Content'} ${sortColumn === 'backContent' ? `(${sortDirection})` : ''}`}
                >
                  {showTibetanEnglishLabels ? 'English' : 'Back Content'} {getSortIndicator('backContent')}
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
            {paginatedCards.map((card, index) => {
              const rowIndex = (currentPage - 1) * pageSize + index + 1;
              
              return (
                  <TableRow
                  key={card.id}
                  card={card}
                  rowIndex={rowIndex}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onPreview={onPreview}
                  getFrontContent={getFrontContent}
                  getBackContentSummary={getBackContentSummary}
                  getCategoriesDisplay={getCategoriesDisplay}
                  formatDate={formatDate}
                />
              );
            })}
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

