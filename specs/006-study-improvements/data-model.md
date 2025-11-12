# Data Model: Study Experience Improvements

**Feature**: Study Experience Improvements  
**Date**: 2025-11-12  
**Status**: Complete

## Overview

This document defines the data structures and state management for the three study experience improvements. All changes are frontend-only and reuse existing database schemas. No database migrations required.

---

## Entity Definitions

### Flashcard (Existing Entity - No Changes)

Represents a study card with content, metadata, and optional image.

**Fields**:
- `id` (string, UUID): Unique identifier
- `type` (string): Card type - "word", "phrase", or "number"
- `front` (string): Front content (legacy field, maintained for backward compatibility)
- `tibetanText` (string, optional): Tibetan text for word/phrase cards
- `englishText` (string, optional): English text for word/phrase cards
- `imageUrl` (string, optional): URL to associated image (stored in Supabase Storage)
- `audioUrl` (string, optional): URL to audio pronunciation
- `instruction_level_id` (UUID, optional): Foreign key to instruction_levels table
- `categories` (array of objects): Associated categories `[{id, name}]`
- `userId` (UUID): Owner user ID
- `created_at` (timestamp): Creation timestamp
- `updated_at` (timestamp): Last update timestamp

**Relationships**:
- Belongs to one Instruction Level (optional, via `instruction_level_id`)
- Has many Categories (via `card_categories` join table)
- Belongs to one User (via `userId`)

**Validation Rules**:
- `type` must be one of: "word", "phrase", "number"
- Word/phrase cards must have both `tibetanText` and `englishText`
- Number cards must have `front` field
- `imageUrl` must be valid HTTPS URL if provided
- At least one of `front`, `tibetanText`, or `englishText` must be present

**State Transitions**: None (flashcards don't have lifecycle states)

**Used by**:
- User Story 1: Check for English text presence to determine image display
- User Story 2: Filter by `instruction_level_id` when instruction level filter active
- User Story 3: Edit all fields via EditCardForm during study

---

### InstructionLevel (Existing Entity - No Changes)

Represents a difficulty/progression level for organizing cards.

**Fields**:
- `id` (UUID): Unique identifier
- `name` (string): Display name (e.g., "Arpatsa", "Intermediate", "Advanced")
- `order` (integer): Sort order for display (ascending)
- `description` (string, optional): Detailed description of level
- `is_default` (boolean): Whether this is the default level for new cards
- `created_at` (timestamp): Creation timestamp

**Relationships**:
- Has many Flashcards (via `cards.instruction_level_id`)

**Validation Rules**:
- `name` must be unique and non-empty
- `order` must be positive integer
- Only one level can have `is_default = true`

**State Transitions**: None (instruction levels are reference data)

**Used by**:
- User Story 2: Display in CardFilter dropdown, filter cards by selected level(s)

---

## State Management

### App Component State (Modified)

Top-level application state in `App.jsx`. Additions marked with 🆕.

**Existing State**:
- `cards` (array): All loaded flashcards
- `currentCard` (object | null): Currently displayed card in study mode
- `isFlipped` (boolean): Whether current card is flipped to back
- `progressMap` (object): SRS progress data per card `{cardId: {interval, repetitions, ease, nextReview}}`
- `selectedTags` (array): Selected card types for filtering
- `studyDirection` (string): Study direction - "tibetan_to_english", "english_to_tibetan", or "both"
- `user` (object | null): Authenticated user data
- `isAdmin` (boolean): Whether current user has admin role

**New State** 🆕:
- `instructionLevels` (array): All available instruction levels loaded from database
  ```js
  // Example:
  [
    {id: "uuid-1", name: "Arpatsa", order: 1, description: "Beginner level"},
    {id: "uuid-2", name: "Intermediate", order: 2, description: "Intermediate level"},
    {id: "uuid-3", name: "Advanced", order: 3, description: "Advanced level"}
  ]
  ```
- `selectedInstructionLevels` (array): Selected instruction level IDs for filtering
  ```js
  // Example: User selected "Arpatsa" and "Intermediate"
  ["uuid-1", "uuid-2"]
  ```
- `showEditModal` (boolean): Whether edit modal is open during study
- `editingCard` (object | null): Card being edited in study mode (null when modal closed)

**State Initialization**:
```js
// On component mount
useEffect(() => {
  // Existing: Load cards, user, progress
  // NEW: Load instruction levels
  const loadData = async () => {
    const levels = await loadInstructionLevels(); // from instructionLevelsService
    setInstructionLevels(levels);
  };
  loadData();
}, []);
```

**State Updates**:
```js
// When user toggles instruction level checkbox in CardFilter
const handleInstructionLevelToggle = (levelId) => {
  setSelectedInstructionLevels(prev => 
    prev.includes(levelId)
      ? prev.filter(id => id !== levelId) // Remove if already selected
      : [...prev, levelId]                 // Add if not selected
  );
};

// When admin clicks edit button during study
const handleEditClick = () => {
  setEditingCard(currentCard);
  setShowEditModal(true);
};

// When edit is saved
const handleEditSave = async (editedCard) => {
  // Update via service
  await updateCard(editedCard);
  // Update local state
  setCurrentCard(editedCard);
  setCards(prevCards => prevCards.map(c => c.id === editedCard.id ? editedCard : c));
  // Close modal
  setShowEditModal(false);
  setEditingCard(null);
};
```

---

### CardFilter Component State (Modified)

Manages filter dropdown UI state. Receives filter data and callbacks as props.

**Existing Props**:
- `selectedTags` (array): Selected card types
- `onTagToggle` (function): Callback to update card type selection
- `studyDirection` (string): Current study direction
- `onStudyDirectionChange` (function): Callback to update study direction
- `hasWordPhraseCards` (boolean): Whether any word/phrase cards exist (determines if direction filter shown)

**New Props** 🆕:
- `instructionLevels` (array): Available instruction levels from App state
- `selectedInstructionLevels` (array): Selected instruction level IDs from App state
- `onInstructionLevelToggle` (function): Callback to toggle instruction level selection

**Internal State**:
- `isOpen` (boolean): Whether dropdown menu is expanded

**UI Sections**:
1. Card Types (existing): Single-select radio buttons
2. Study Direction (existing): Single-select radio buttons (conditional on `hasWordPhraseCards`)
3. Instruction Levels 🆕: Multi-select checkboxes

---

### Flashcard Component Props (Modified)

**Existing Props**:
- `card` (object): Flashcard data to display
- `onFlip` (function): Callback when card is flipped
- `isFlipped` (boolean): External flip state (controlled)
- `onFlipChange` (function): Callback for flip state changes
- `studyDirection` (string): "tibetan_to_english" or "english_to_tibetan"

**New Props** 🆕:
- `isAdmin` (boolean): Whether current user is admin (determines if edit button shown)
- `onEditClick` (function): Callback when edit button clicked

**Internal State**:
- `imageError` (boolean): Whether image failed to load (existing, for graceful error handling)

---

## Computed Values

### filteredCards (Modified)

Derived from `cards` array with applied filters. Computed in `App.jsx` using `useMemo`.

**Existing Filters**:
- Card type (from `selectedTags`)
- Study direction compatibility (word/phrase cards only)

**New Filter** 🆕:
- Instruction level (from `selectedInstructionLevels`)

**Logic**:
```js
const filteredCards = useMemo(() => {
  let filtered = cards;
  
  // Filter by card type (existing)
  if (!selectedTags.includes('all') && selectedTags.length > 0) {
    filtered = filtered.filter(card => /* type matching logic */);
  }
  
  // Filter by instruction level (NEW)
  if (selectedInstructionLevels.length > 0) {
    filtered = filtered.filter(card => 
      selectedInstructionLevels.includes(card.instruction_level_id)
    );
  }
  
  return filtered;
}, [cards, selectedTags, selectedInstructionLevels]);
```

**Performance**: Optimized with `useMemo` to avoid recomputing on every render. Only recomputes when `cards`, `selectedTags`, or `selectedInstructionLevels` change.

---

### shouldDisplayImage (New Helper Function)

Determines whether to show image on flashcard back.

**Logic**:
```js
const shouldDisplayImage = (card) => {
  // No image URL → don't display
  if (!card.imageUrl) return false;
  
  // Image failed to load → don't display
  if (imageError) return false;
  
  // Not flipped → don't display (images only on back)
  if (!isFlipped) return false;
  
  // Has English text → display
  // Check englishText field (word/phrase cards) or backEnglish (number cards)
  const hasEnglishText = card.englishText || card.backEnglish || 
                          (card.type === 'number' && containsEnglish(card.backArabic));
  
  return hasEnglishText;
};
```

**Used in**: `Flashcard.jsx` to conditionally render image container

---

## Data Flow Diagrams

### User Story 1: Image Display

```
[Card Data] → [Flashcard Component] → [Check: isFlipped && hasEnglishText && imageUrl && !imageError]
                                              ↓
                                        [Render Image on Back]
                                              ↓
                                        [onError Handler] → [Set imageError=true] → [Hide Image]
```

### User Story 2: Multi-Filter Selection

```
[App Mount] → [Load Instruction Levels from Supabase] → [Set instructionLevels State]
                                                               ↓
[CardFilter Renders] ← [instructionLevels, selectedInstructionLevels Props]
         ↓
[User Toggles Checkbox] → [onInstructionLevelToggle Callback] → [Update App State]
                                                                       ↓
                                                    [Recompute filteredCards with useMemo]
                                                                       ↓
                                                    [Update Study Session with Filtered Cards]
```

### User Story 3: Admin Edit During Study

```
[Study Mode] + [isAdmin=true] → [Show Edit Button on Flashcard]
                                         ↓
                              [User Clicks Edit Button]
                                         ↓
                              [Set editingCard + showEditModal]
                                         ↓
                              [Render EditCardForm in Modal]
                                         ↓
                              [User Edits Fields + Clicks Save]
                                         ↓
                    [Validate] → [Update Supabase] → [Update Local State]
                                                            ↓
                                        [Close Modal + Preserve Study State]
                                                            ↓
                                        [Continue Study with Updated Card]
```

---

## Validation Logic

### Filter Validation

**Instruction Level Filter**:
- Empty selection (`selectedInstructionLevels.length === 0`): Include all cards (backward compatible)
- One or more selected: Include only cards with `instruction_level_id` in selected array
- Cards without instruction level (`instruction_level_id === null`): Excluded when any filter active

### Image Display Validation

**Image on Back**:
- Must have `imageUrl` field (valid HTTPS URL)
- Must have English text in card data
- Must be flipped to back (`isFlipped === true`)
- Must not have failed to load (`imageError === false`)

### Edit Validation

**Admin Edit During Study**:
- User must have admin role (`isAdmin === true`)
- All field validations from EditCardForm apply:
  - Required fields: `type`, at least one text field
  - Field length limits: enforced by Supabase schema
  - Image URL format: valid HTTPS URL or empty

---

## Migration Notes

**No database migrations required**. All database tables and columns already exist:
- `instruction_levels` table: Already created (exists in current schema)
- `cards.instruction_level_id`: Already exists as foreign key
- `cards.imageUrl`: Already exists

**Backward Compatibility**:
- Cards without `instruction_level_id`: Still displayed when no instruction level filter active
- Cards without `imageUrl`: Gracefully handled (no broken images)
- Existing card filtering logic: Preserved and extended (not replaced)

---

## Summary

All data structures defined and validated. State management approach follows existing React patterns (props drilling, useMemo optimization). No breaking changes to data model. Ready to proceed to API contracts and quickstart guide.

