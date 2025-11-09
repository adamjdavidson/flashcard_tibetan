# Quickstart: Bulk Image Generation Implementation

**Feature**: 004-bulk-image-generation  
**Date**: 2025-11-09

## Overview

This guide provides step-by-step instructions for implementing bulk image generation in the admin card management panel.

## Implementation Steps

### Step 1: Create Bulk Image Service Utility

**File**: `src/utils/bulkImageService.js`

```javascript
import { generateAIImage } from './images.js';
import { saveCard } from '../services/cardsService.js';

/**
 * Generate image prompt from card
 * Priority: englishText > backEnglish > front
 */
function getImagePrompt(card) {
  return card.englishText || card.backEnglish || card.front || null;
}

/**
 * Filter cards that need images
 * Returns cards of type 'word' or 'phrase' without imageUrl
 */
export function filterCardsNeedingImages(cards, filters = {}) {
  let filtered = cards.filter(card => 
    (card.type === 'word' || card.type === 'phrase') &&
    !card.imageUrl
  );

  // Apply filters if provided
  if (filters.type) {
    filtered = filtered.filter(card => card.type === filters.type);
  }
  if (filters.category) {
    // Filter by category (implementation depends on card structure)
    filtered = filtered.filter(card => 
      card.categories?.some(cat => cat.id === filters.category)
    );
  }
  if (filters.instructionLevel) {
    filtered = filtered.filter(card => 
      card.instructionLevelId === filters.instructionLevel
    );
  }

  // Filter out cards without suitable text fields
  return filtered
    .map(card => ({ card, prompt: getImagePrompt(card) }))
    .filter(({ prompt }) => prompt && prompt.trim())
    .map(({ card }) => card);
}

/**
 * Process bulk image generation
 * @param {Card[]} cards - Cards to process
 * @param {Function} onProgress - Callback for progress updates
 * @param {Function} onComplete - Callback when complete
 * @param {AbortSignal} signal - Abort signal for cancellation
 */
export async function processBulkImageGeneration(cards, onProgress, onComplete, signal) {
  const total = cards.length;
  let completed = 0;
  let failed = 0;
  const failures = [];

  for (let i = 0; i < cards.length; i++) {
    // Check for cancellation
    if (signal?.aborted) {
      break;
    }

    const card = cards[i];
    const prompt = getImagePrompt(card);

    // Update progress
    onProgress({
      current: i,
      total,
      completed,
      failed,
      currentCard: card
    });

    try {
      // Generate image
      const result = await generateAIImage(prompt);
      
      if (!result.success) {
        failures.push({
          cardId: card.id,
          cardText: prompt,
          error: result.error || 'Image generation failed',
          timestamp: new Date()
        });
        failed++;
        continue;
      }

      // Save card with image URL
      const updatedCard = { ...card, imageUrl: result.imageUrl };
      const saveResult = await saveCard(updatedCard);

      if (!saveResult.success) {
        failures.push({
          cardId: card.id,
          cardText: prompt,
          error: saveResult.error || 'Failed to save card',
          timestamp: new Date()
        });
        failed++;
        continue;
      }

      completed++;

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      failures.push({
        cardId: card.id,
        cardText: prompt,
        error: error.message || 'Unknown error',
        timestamp: new Date()
      });
      failed++;
    }
  }

  // Final progress update
  onProgress({
    current: total,
    total,
    completed,
    failed,
    currentCard: null
  });

  // Call completion callback
  onComplete({
    completed,
    failed,
    total,
    failures,
    cancelled: signal?.aborted || false
  });
}
```

### Step 2: Create Bulk Image Generator Component

**File**: `src/components/BulkImageGenerator.jsx`

```javascript
import { useState, useRef } from 'react';
import { processBulkImageGeneration, filterCardsNeedingImages } from '../utils/bulkImageService.js';
import './BulkImageGenerator.css';

export default function BulkImageGenerator({ cards, filters, onComplete }) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    completed: 0,
    failed: 0,
    currentCard: null
  });
  const [result, setResult] = useState(null);
  const abortControllerRef = useRef(null);

  const handleStart = async () => {
    // Filter cards needing images
    const cardsToProcess = filterCardsNeedingImages(cards, filters);
    
    if (cardsToProcess.length === 0) {
      alert('All word cards already have images, or no cards match the filters.');
      return;
    }

    // Confirm with user
    const confirmed = confirm(
      `Generate images for ${cardsToProcess.length} card(s)? This may take several minutes.`
    );
    if (!confirmed) return;

    // Initialize state
    setIsRunning(true);
    setProgress({
      current: 0,
      total: cardsToProcess.length,
      completed: 0,
      failed: 0,
      currentCard: null
    });
    setResult(null);

    // Create abort controller
    abortControllerRef.current = new AbortController();

    // Process bulk generation
    await processBulkImageGeneration(
      cardsToProcess,
      (progressData) => setProgress(progressData),
      (completionData) => {
        setIsRunning(false);
        setResult(completionData);
        if (onComplete) onComplete(completionData);
      },
      abortControllerRef.current.signal
    );
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsRunning(false);
  };

  const handleCloseResult = () => {
    setResult(null);
  };

  const cardsNeedingImages = filterCardsNeedingImages(cards, filters);

  return (
    <div className="bulk-image-generator">
      <div className="bulk-image-header">
        <h3>Bulk Image Generation</h3>
        <button
          className="btn-primary"
          onClick={handleStart}
          disabled={isRunning || cardsNeedingImages.length === 0}
        >
          Bulk Generate Images
        </button>
      </div>

      {cardsNeedingImages.length === 0 && (
        <p className="bulk-image-message">
          All word cards already have images.
        </p>
      )}

      {isRunning && (
        <div className="bulk-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(progress.completed / progress.total) * 100}%` }}
            />
          </div>
          <div className="progress-info">
            <p>
              {progress.completed} of {progress.total} completed
              {progress.failed > 0 && ` (${progress.failed} failed)`}
            </p>
            {progress.currentCard && (
              <p className="current-card">
                Processing: {progress.currentCard.englishText || 
                            progress.currentCard.backEnglish || 
                            progress.currentCard.front}
              </p>
            )}
          </div>
          <button
            className="btn-secondary"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      )}

      {result && (
        <div className="bulk-result-modal">
          <div className="modal-content">
            <h3>Bulk Generation Complete</h3>
            <div className="result-summary">
              <p>✅ Successfully generated: {result.completed}</p>
              <p>❌ Failed: {result.failed}</p>
              {result.cancelled && <p>⚠️ Operation was cancelled</p>}
            </div>
            {result.failures.length > 0 && (
              <div className="failures-list">
                <h4>Failures:</h4>
                <ul>
                  {result.failures.map((failure, idx) => (
                    <li key={idx}>
                      {failure.cardText}: {failure.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button className="btn-primary" onClick={handleCloseResult}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Step 3: Create CSS Styles

**File**: `src/components/BulkImageGenerator.css`

```css
.bulk-image-generator {
  margin: 1.5rem 0;
  padding: 1rem;
  border: 1px solid var(--theme-border-dark);
  border-radius: 8px;
  background: var(--theme-bg-card);
}

.bulk-image-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.bulk-image-header h3 {
  margin: 0;
  color: var(--theme-text-primary);
}

.bulk-image-message {
  color: var(--theme-text-secondary);
  font-style: italic;
}

.bulk-progress {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--theme-bg-card);
  border: 1px solid var(--theme-border-dark);
  border-radius: 6px;
}

.progress-bar {
  width: 100%;
  height: 24px;
  background: var(--theme-border-dark);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: var(--theme-accent-info);
  transition: width 0.3s ease;
}

.progress-info {
  margin: 0.5rem 0;
}

.current-card {
  font-style: italic;
  color: var(--theme-text-secondary);
  font-size: 0.875rem;
}

.bulk-result-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--theme-bg-card);
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.result-summary {
  margin: 1rem 0;
}

.failures-list {
  margin-top: 1rem;
  max-height: 200px;
  overflow-y: auto;
}

.failures-list ul {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0;
}

.failures-list li {
  padding: 0.5rem;
  margin: 0.25rem 0;
  background: rgba(220, 53, 69, 0.1);
  border-left: 3px solid var(--theme-accent-error);
  font-size: 0.875rem;
}
```

### Step 4: Integrate into AdminPage

**File**: `src/components/AdminPage.jsx`

Add import:
```javascript
import BulkImageGenerator from './BulkImageGenerator.jsx';
```

Add component in Card Management tab (after filters, before card views):
```javascript
{/* Card Management Tab */}
{activeTab === 'card-management' && (
  <div className="admin-tab-content">
    {/* ... existing header and filters ... */}

    {/* Bulk Image Generation */}
    <BulkImageGenerator
      cards={cards}
      filters={{
        type: filterType,
        category: filterCategory,
        instructionLevel: filterInstructionLevel
      }}
      onComplete={(result) => {
        // Reload cards to show new images
        loadCards();
        setSuccess(`Bulk generation complete: ${result.completed} succeeded, ${result.failed} failed`);
      }}
    />

    {/* ... existing card views ... */}
  </div>
)}
```

## Testing Checklist

- [ ] Unit tests for `bulkImageService.js` (filterCardsNeedingImages, processBulkImageGeneration)
- [ ] Component tests for `BulkImageGenerator.jsx` (rendering, button clicks, progress updates)
- [ ] Integration tests for full bulk generation flow
- [ ] E2E tests for admin bulk generation workflow
- [ ] Test cancellation functionality
- [ ] Test error handling (API failures, network errors)
- [ ] Test filter integration
- [ ] Test empty state (no cards needing images)
- [ ] Accessibility tests (keyboard navigation, screen reader)

## Notes

- Bulk generation runs client-side (no server-side job queue)
- Cards are saved individually as images are generated (not batched)
- Progress updates happen in real-time via React state
- Cancellation stops processing immediately
- Failures are collected and reported in completion summary

