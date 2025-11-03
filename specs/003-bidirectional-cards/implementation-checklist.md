# Bidirectional Cards - Implementation Checklist

**Quick Reference**: Detailed plan in [migration-plan.md](./migration-plan.md)

## Database Migrations (Run in Order)

- [ ] `YYYYMMDDHHMMSS_add_bidirectional_fields.sql` - Add `tibetan_text`, `english_text` columns
- [ ] `YYYYMMDDHHMMSS_add_study_direction_to_progress.sql` - Add `study_direction` to progress
- [ ] `YYYYMMDDHHMMSS_add_study_preferences.sql` - Create user preferences table
- [ ] `YYYYMMDDHHMMSS_migrate_existing_cards.sql` - Migrate existing word/phrase cards

## Service Layer Files to Update

### `src/data/cardSchema.js`
- [ ] Add `tibetanText`, `englishText` to `CARD_SCHEMA`
- [ ] Update `createCard()` to accept new fields
- [ ] Update `validateCard()` for word/phrase cards
- [ ] Add `getTibetanText(card)` helper
- [ ] Add `getEnglishText(card)` helper

### `src/services/cardsService.js`
- [ ] Update `transformCardFromDB()` - include `tibetanText`, `englishText`
- [ ] Update `transformCardToDB()` - save new fields
- [ ] Add fallback logic (use old fields if new are NULL)
- [ ] Add `ensureBidirectionalFields(card)` helper

### `src/services/progressService.js`
- [ ] Update `transformProgressToDB()` - include `study_direction`
- [ ] Update `transformProgressFromDB()` - read `study_direction`
- [ ] Add `getProgressForDirection(userId, cardId, direction)`
- [ ] Add `saveProgressForDirection(userId, cardId, direction, progress)`
- [ ] Update `loadProgress()` - return `{ [cardId_direction]: progress }`
- [ ] Update `saveProgressBatch()` - handle direction-aware keys

### `src/services/studyPreferencesService.js` (NEW)
- [ ] Create file
- [ ] Add `loadStudyPreferences(userId)`
- [ ] Add `saveStudyPreferences(userId, direction)`
- [ ] Add `getDefaultDirection()`

## Component Files to Update

### `src/components/EditCardForm.jsx`
- [ ] Replace "Tibetan Script (Front)" / "English Translation (Back)" with:
  - "Tibetan Text *"
  - "English Text *"
- [ ] **Keep Translation functionality**:
  - Translate button next to "English Text" field
  - Translates English → Tibetan (populates "Tibetan Text" field)
  - Users can manually enter/edit Tibetan text (not always using translation)
  - Most common flow: Enter English → Click Translate → Tibetan auto-populated
- [ ] Remove subcategory logic for word/phrase cards
- [ ] Auto-populate new fields from old on load
- [ ] Save both new and old fields (transition)

### `src/components/AddCardForm.jsx`
- [ ] Same as EditCardForm
- [ ] **Keep Translation functionality** (same as EditCardForm)

### `src/components/Flashcard.jsx`
- [ ] Add `studyDirection` prop
- [ ] Use `card.tibetanText` / `card.englishText` (with fallback)
- [ ] Render based on `studyDirection`:
  - `tibetan_to_english`: Front = Tibetan, Back = English
  - `english_to_tibetan`: Front = English + image, Back = Tibetan

### `src/components/App.jsx`
- [ ] Add `studyDirection` state (from preferences)
- [ ] Add `StudyDirectionToggle` component
- [ ] Update `handleRate()` - use direction-aware progress keys
- [ ] Update `getNextCard()` - pass `studyDirection`
- [ ] Update progress loading - separate by direction

### `src/components/StudyDirectionToggle.jsx` (NEW)
- [ ] Create file
- [ ] Toggle between "Tibetan → English" / "English → Tibetan"
- [ ] Save preference to database
- [ ] Persist across sessions

### `src/components/ProgressStats.jsx`
- [ ] Update to show direction-specific counts
- [ ] Display "X (Tibetan→English), Y (English→Tibetan)"

### `src/components/AdminCardTable.jsx`
- [ ] Update "Front" column to show appropriate language
- [ ] Add tooltip indicating direction
- [ ] Show both languages clearly

## Utility Files to Update

### `src/utils/cardUtils.js`
- [ ] Update `getNextCard(cards, progressMap, studyDirection)`
- [ ] Add `getProgressKey(cardId, direction)` helper
- [ ] Add `shouldShowCard(card, progress, direction)` helper
- [ ] Update `getDueCards()` to consider direction

## Key Data Structure Changes

### Progress Map Structure
**Before**: `{ [cardId]: progress }`  
**After**: `{ [cardId_direction]: progress }`

Example:
```javascript
// Before
{ 'card123': { interval: 5, easeFactor: 2.3, ... } }

// After
{ 
  'card123_tibetan_to_english': { interval: 5, easeFactor: 2.3, ... },
  'card123_english_to_tibetan': { interval: 3, easeFactor: 2.1, ... }
}
```

### Card Structure
**Before**: `{ front: '...', backEnglish: '...', backTibetanScript: '...' }`  
**After**: `{ tibetanText: '...', englishText: '...' }` (with fallback to old fields)

## Testing Checklist

### Data Migration
- [ ] All word/phrase cards have `tibetan_text` and `english_text` populated
- [ ] Migration preserves existing data
- [ ] No data loss during migration

### Functional Testing
- [ ] Create new card with Tibetan/English text
- [ ] Study card in Tibetan→English direction
- [ ] Study same card in English→Tibetan direction
- [ ] Verify separate progress tracking
- [ ] Verify SM-2 algorithm works per direction
- [ ] Verify user preference persists

### Edge Cases
- [ ] Cards with missing Tibetan or English text
- [ ] Legacy cards (only old fields)
- [ ] Switching directions mid-session
- [ ] Progress tracking when card deleted

## Deployment Order

1. **Schema Changes** (Phase 1) - No code changes
2. **Data Migration** (Phase 2) - Manual SQL execution
3. **Service Layer** (Phase 3) - With backward compatibility
4. **Components** (Phase 4) - With backward compatibility
5. **UI** (Phase 5) - New features
6. **Testing** (Phase 6) - Comprehensive testing
7. **Deployment** (Phase 7) - Monitor and verify

## Rollback Plan

If issues occur:
- New fields (`tibetan_text`, `english_text`) remain NULL
- Code falls back to old fields
- Progress continues using `study_direction = NULL`
- No data loss - all old fields preserved

