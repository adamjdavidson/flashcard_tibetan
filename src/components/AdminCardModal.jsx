/**
 * AdminCardModal component
 * Modal wrapper for AddCardForm and EditCardForm
 * Provides accessible modal with focus trap, ESC to close, ARIA labels
 */

import { useEffect, useRef, lazy, Suspense } from 'react';
import EditCardForm from './EditCardForm.jsx';
import './AdminCardModal.css';

// Lazy load AddCardForm to avoid loading it until modal is opened
const AddCardForm = lazy(() => import('./AddCardForm.jsx'));

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
  const focusAttemptedRef = useRef(false);

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
      // Reset focus attempt flag when modal opens
      focusAttemptedRef.current = false;
      
      // Focus modal on open - but skip if we're in 'add' mode (will be handled by lazy-load effect)
      if (modalRef.current && mode !== 'add') {
        const firstFocusable = modalRef.current.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (firstFocusable) {
          firstFocusable.focus();
          focusAttemptedRef.current = true;
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
  }, [isOpen, onCancel, mode]);

  // Handle focus for lazy-loaded AddCardForm
  // This effect watches for form inputs to appear and focuses the first one
  useEffect(() => {
    if (!isOpen || mode !== 'add' || focusAttemptedRef.current) {
      return;
    }

    // Use MutationObserver to detect when AddCardForm loads and renders inputs
    const observer = new MutationObserver(() => {
      if (!modalRef.current || focusAttemptedRef.current) {
        return;
      }

      // Find first focusable element, excluding the close button
      const closeButton = modalRef.current.querySelector('.modal-close-btn');
      const allFocusable = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      // Find the first focusable that isn't the close button
      const firstFormInput = Array.from(allFocusable).find(
        el => el !== closeButton && el.closest('form')
      );

      if (firstFormInput) {
        firstFormInput.focus();
        focusAttemptedRef.current = true;
        observer.disconnect();
      }
    });

    // Start observing when modal is open and in add mode
    if (modalRef.current) {
      observer.observe(modalRef.current, {
        childList: true,
        subtree: true
      });

      // Also try immediately in case form is already loaded
      const closeButton = modalRef.current.querySelector('.modal-close-btn');
      const allFocusable = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstFormInput = Array.from(allFocusable).find(
        el => el !== closeButton && el.closest('form')
      );
      if (firstFormInput) {
        firstFormInput.focus();
        focusAttemptedRef.current = true;
        observer.disconnect();
      }
    }

    return () => {
      observer.disconnect();
    };
  }, [isOpen, mode]);

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
          <Suspense fallback={<div className="modal-loading">Loading...</div>}>
            <AddCardForm
              onAdd={onSave}
              onCancel={onCancel}
              isAdmin={isAdmin}
            />
          </Suspense>
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

