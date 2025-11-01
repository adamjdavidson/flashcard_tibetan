/**
 * AdminCardModal component
 * Modal wrapper for AddCardForm and EditCardForm
 * Provides accessible modal with focus trap, ESC to close, ARIA labels
 */

import { useEffect, useRef } from 'react';
import AddCardForm from './AddCardForm.jsx';
import EditCardForm from './EditCardForm.jsx';
import './AdminCardModal.css';

export default function AdminCardModal({ 
  isOpen, 
  mode, // 'add' | 'edit'
  card, 
  onSave, 
  onCancel,
  isAdmin = true
}) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Store previous focus
      previousFocusRef.current = document.activeElement;
      // Focus modal on open
      if (modalRef.current) {
        const firstFocusable = modalRef.current.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (firstFocusable) {
          firstFocusable.focus();
        }
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      // Restore previous focus on close
      if (previousFocusRef.current && !isOpen) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onCancel]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle backdrop click to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="admin-card-modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="admin-card-modal"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <button
          className="modal-close-btn"
          onClick={onCancel}
          aria-label="Close modal"
          type="button"
        >
          ×
        </button>
        
        {mode === 'add' && (
          <AddCardForm
            onAdd={onSave}
            onCancel={onCancel}
          />
        )}
        
        {mode === 'edit' && card && (
          <EditCardForm
            card={card}
            onSave={onSave}
            onCancel={onCancel}
            isAdmin={isAdmin}
          />
        )}
      </div>
    </div>
  );
}

