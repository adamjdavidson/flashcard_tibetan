# Migration Plan: Bidirectional Card Model

**Created**: 2025-11-03  
**Feature**: Bidirectional word/phrase cards with separate progress tracking  
**Status**: Planning

## Executive Summary

This migration transforms the card data model from a position-based (`front`/`back`) system to a language-based (`tibetanText`/`englishText`) system for word/phrase cards. This enables bidirectional study modes (Tibetan→English and English→Tibetan) with separate SM-2 progress tracking for each direction.

**Scope**: Word and phrase cards only. Number cards remain unchanged.

---

## Goals

1. **Simplified Data Model**: Store language-specific fields (`tibetanText`, `englishText`) instead of position-based fields (`front`, `backEnglish`)
2. **Bidirectional Study**: Users can study the same card in both directions (Tibetan→English or English→Tibetan)
3. **Separate Progress**: Each study direction has its own SM-2 progress tracking
4. **User Preference**: Users can choose their preferred study mode (Tibetan-face or English-face)
5. **Backward Compatibility**: Maintain existing functionality during migration

---

## Phase 1: Database Schema Changes

### 1.1 Add New Fields to Cards Table

**Migration**: `YYYYMMDDHHMMSS_add_bidirectional_fields.sql`

```sql
-- Add new language-specific fields for word/phrase cards
ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS tibetan_text TEXT NULL,
ADD COLUMN IF NOT EXISTS english_text TEXT NULL;

-- Add index for filtering word/phrase cards with new fields
CREATE INDEX IF NOT EXISTS idx_cards_tibetan_text 
ON cards(tibetan_text) 
WHERE tibetan_text IS NOT NULL AND type IN ('word', 'phrase');

CREATE INDEX IF NOT EXISTS idx_cards_english_text 
ON cards(english_text) 
WHERE english_text IS NOT NULL AND type IN ('word', 'phrase');

-- Add comments
COMMENT ON COLUMN cards.tibetan_text IS 'Tibetan text content (word/phrase cards only). Replaces position-based front/back fields.';
COMMENT ON COLUMN cards.english_text IS 'English text content (word/phrase cards only). Replaces position-based front/back fields.';
```

**Impact**: No breaking changes - new columns are NULL, existing data unchanged

### 1.2 Update Card Progress Table for Direction

**Migration**: `YYYYMMDDHHMMSS_add_study_direction_to_progress.sql`

```sql
-- Add study_direction column to card_progress
ALTER TABLE card_progress 
ADD COLUMN IF NOT EXISTS study_direction TEXT NULL 
CHECK (study_direction IS NULL OR study_direction IN ('tibetan_to_english', 'english_to_tibetan'));

-- Update unique constraint to include direction
-- Remove old unique constraint
ALTER TABLE card_progress 
DROP CONSTRAINT IF EXISTS card_progress_user_id_card_id_key;

-- Add new composite unique constraint
ALTER TABLE card_progress 
ADD CONSTRAINT card_progress_user_card_direction_unique 
UNIQUE(user_id, card_id, study_direction);

-- Add index for querying by direction
CREATE INDEX IF NOT EXISTS idx_card_progress_direction 
ON card_progress(user_id, card_id, study_direction);

-- Add comment
COMMENT ON COLUMN card_progress.study_direction IS 'Study direction: tibetan_to_english (Tibetan shown first) or english_to_tibetan (English shown first). NULL for legacy progress (single direction).';
```

**Impact**: Existing progress records will have `study_direction = NULL` (treated as default direction for backward compatibility)

### 1.3 Add User Preference Table

**Migration**: `YYYYMMDDHHMMSS_add_study_preferences.sql`

```sql
-- Create user study preferences table
CREATE TABLE IF NOT EXISTS user_study_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_direction TEXT NOT NULL DEFAULT 'tibetan_to_english' 
    CHECK (preferred_direction IN ('tibetan_to_english', 'english_to_tibetan')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE user_study_preferences IS 'User preferences for study mode direction (Tibetan-first or English-first).';
COMMENT ON COLUMN user_study_preferences.preferred_direction IS 'Default study direction: tibetan_to_english (Tibetan on front) or english_to_tibetan (English on front).';
```

**Impact**: New table, no impact on existing data

---

## Phase 2: Data Migration

### 2.1 Migrate Existing Word/Phrase Cards

**Migration Script**: `migrate-cards-to-bidirectional.js` (run once manually)

```javascript
// Logic to populate tibetan_text and english_text from existing fields
// For word/phrase cards:
// - If subcategory === 'english_to_tibetan':
//     tibetan_text = back_tibetan_script
//     english_text = front (currently English)
// - If subcategory === 'tibetan_to_english':
//     tibetan_text = front (currently Tibetan)
//     english_text = back_english
// - If subcategory is NULL or other:
//     Detect based on content:
//     - If front contains Tibetan: tibetan_text = front, english_text = back_english
//     - If front contains English: tibetan_text = back_tibetan_script, english_text = front
```

**Migration SQL**: `YYYYMMDDHHMMSS_migrate_existing_cards.sql`

```sql
-- Migrate existing word/phrase cards to new bidirectional fields
-- Case 1: English-to-Tibetan cards
UPDATE cards 
SET 
  tibetan_text = back_tibetan_script,
  english_text = front
WHERE type IN ('word', 'phrase')
  AND subcategory = 'english_to_tibetan'
  AND front IS NOT NULL
  AND back_tibetan_script IS NOT NULL
  AND (tibetan_text IS NULL OR english_text IS NULL);

-- Case 2: Tibetan-to-English cards
UPDATE cards 
SET 
  tibetan_text = front,
  english_text = back_english
WHERE type IN ('word', 'phrase')
  AND subcategory = 'tibetan_to_english'
  AND front IS NOT NULL
  AND back_english IS NOT NULL
  AND (tibetan_text IS NULL OR english_text IS NULL);

-- Case 3: Cards without subcategory - detect based on content
-- Tibetan Unicode range: U+0F00 to U+0FFF
UPDATE cards 
SET 
  tibetan_text = front,
  english_text = back_english
WHERE type IN ('word', 'phrase')
  AND subcategory IS NULL
  AND front ~ '[\u0F00-\u0FFF]'  -- Front contains Tibetan
  AND back_english IS NOT NULL
  AND (tibetan_text IS NULL OR english_text IS NULL);

-- Case 4: Cards without subcategory where front is English
UPDATE cards 
SET 
  tibetan_text = back_tibetan_script,
  english_text = front
WHERE type IN ('word', 'phrase')
  AND subcategory IS NULL
  AND front !~ '[\u0F00-\u0FFF]'  -- Front does NOT contain Tibetan
  AND back_tibetan_script IS NOT NULL
  AND (tibetan_text IS NULL OR english_text IS NULL);
```

**Validation Query**:
```sql
-- Check migration success
SELECT 
  type,
  COUNT(*) as total,
  COUNT(tibetan_text) as has_tibetan_text,
  COUNT(english_text) as has_english_text,
  COUNT(*) FILTER (WHERE tibetan_text IS NOT NULL AND english_text IS NOT NULL) as migrated
FROM cards
WHERE type IN ('word', 'phrase')
GROUP BY type;
```

**Rollback Plan**: If migration fails, new fields remain NULL and old fields unchanged. No data loss.

---

## Phase 3: Service Layer Updates

### 3.1 Update `cardSchema.js`

**Changes**:
1. Add `tibetanText` and `englishText` to `CARD_SCHEMA`
2. Update `createCard()` to accept new fields
3. Update `validateCard()` to validate new fields for word/phrase cards
4. Add helper functions:
   - `getTibetanText(card)` - Returns tibetan_text or falls back to front/backTibetanScript
   - `getEnglishText(card)` - Returns english_text or falls back to front/backEnglish

**File**: `src/data/cardSchema.js`

### 3.2 Update `cardsService.js`

**Changes**:
1. Update `transformCardFromDB()` to include `tibetanText` and `englishText`
2. Update `transformCardToDB()` to save new fields
3. Add fallback logic: If new fields are NULL, use old fields for backward compatibility
4. Add helper: `ensureBidirectionalFields(card)` - Populates new fields from old if missing

**File**: `src/services/cardsService.js`

### 3.3 Update `progressService.js`

**Changes**:
1. Update `transformProgressToDB()` to include `study_direction`
2. Update `transformProgressFromDB()` to read `study_direction`
3. Add functions:
   - `getProgressForDirection(userId, cardId, direction)`
   - `saveProgressForDirection(userId, cardId, direction, progress)`
   - `loadProgressMapByDirection(userId)` - Returns `{ [cardId]: { tibetan_to_english: {...}, english_to_tibetan: {...} } }`

**File**: `src/services/progressService.js`

### 3.4 Create `studyPreferencesService.js` (NEW)

**Purpose**: Manage user study mode preferences

**Functions**:
- `loadStudyPreferences(userId)` - Returns user's preferred direction
- `saveStudyPreferences(userId, direction)` - Save user preference
- `getDefaultDirection()` - Returns default ('tibetan_to_english')

**File**: `src/services/studyPreferencesService.js`

---

## Phase 4: Component Updates

### 4.1 Update `EditCardForm.jsx` and `AddCardForm.jsx`

**Changes**:
1. Replace "Tibetan Script (Front)" / "English Translation (Back)" with:
   - "Tibetan Text *" (always Tibetan)
   - "English Text *" (always English)
2. **Preserve Translation Functionality**:
   - Translate button remains next to "English Text" field
   - Translates English → Tibetan (populates "Tibetan Text" field)
   - **Most common workflow**: User enters English → Clicks "Translate" → Tibetan auto-populated
   - **Alternative workflow**: User can manually enter/edit Tibetan text directly
   - Translation API: `translateText(englishText, 'en', 'bo')` → populates `tibetanText`
   - Users can still edit Tibetan text after translation
3. Remove subcategory selection for word/phrase cards
4. Auto-populate new fields from old fields on load (backward compatibility)
5. Save both new and old fields during transition period

**Translation Flow (preserved)**:
- User enters English text in "English Text" field
- Clicks "Translate" button (next to English Text field)
- Translation API called: `translateText(englishText, 'en', 'bo')`
- Result populates "Tibetan Text" field automatically
- User can manually edit Tibetan text after translation (or enter it directly)
- **Most common workflow**: Enter English → Translate → Tibetan auto-populated
- **Alternative workflow**: Enter/edit Tibetan text directly (no translation needed)
- Translation button disabled when English Text field is empty
- Same functionality as current implementation, just using new field names (`englishText` → `tibetanText` instead of `backEnglish` → `backTibetanScript`)

**Files**: 
- `src/components/EditCardForm.jsx`
- `src/components/AddCardForm.jsx`

### 4.2 Update `Flashcard.jsx`

**Changes**:
1. Accept `studyDirection` prop ('tibetan_to_english' | 'english_to_tibetan')
2. Use `card.tibetanText` and `card.englishText` (with fallback to old fields)
3. Render based on `studyDirection`:
   - `tibetan_to_english`: Front = Tibetan, Back = English
   - `english_to_tibetan`: Front = English (with image), Back = Tibetan
4. Audio button appears where Tibetan text is shown (per existing logic)

**File**: `src/components/Flashcard.jsx`

### 4.3 Update `App.jsx`

**Changes**:
1. Add `studyDirection` state (from user preferences or default)
2. Add UI toggle to switch study direction
3. Update `handleRate()` to save progress with `studyDirection`:
   ```javascript
   const progressKey = `${cardId}_${studyDirection}`;
   ```
4. Update `getNextCard()` to consider direction-specific progress
5. Update progress loading to separate by direction

**File**: `src/components/App.jsx`

### 4.4 Update `cardUtils.js`

**Changes**:
1. Update `getNextCard()` to consider direction-specific progress:
   ```javascript
   function getNextCard(cards, progressMap, studyDirection = 'tibetan_to_english') {
     // progressMap structure: { [cardId_studyDirection]: progress }
     // Filter cards based on direction-specific due dates
   }
   ```
2. Add helper: `getProgressKey(cardId, direction)` - Returns key for progress map
3. Add helper: `shouldShowCard(card, progress, direction)` - Checks if card is due for this direction

**File**: `src/utils/cardUtils.js`

### 4.5 Update `AdminCardTable.jsx`

**Changes**:
1. Update "Front" column to show `card.tibetanText` or `card.englishText` (with fallback)
2. Add tooltip indicating which direction is being displayed
3. Show both languages in separate columns or combined display

**File**: `src/components/AdminCardTable.jsx`

---

## Phase 5: User Interface

### 5.1 Study Mode Toggle

**Location**: Study view header (near card filter)

**Component**: `StudyDirectionToggle.jsx` (NEW)

**Features**:
- Toggle between "Tibetan → English" and "English → Tibetan"
- Saves preference to database
- Visual indicator showing current mode
- Persists across sessions

**File**: `src/components/StudyDirectionToggle.jsx`

### 5.2 Progress Display

**Changes**: Update progress stats to show direction-specific counts:
- "Cards due: X (Tibetan→English), Y (English→Tibetan)"
- Separate progress tracking per direction

**File**: `src/components/ProgressStats.jsx`

---

## Phase 6: Testing

### 6.1 Migration Testing

1. **Data Integrity**: Verify all word/phrase cards have `tibetan_text` and `english_text` populated
2. **Backward Compatibility**: Ensure cards with only old fields still work
3. **Progress Migration**: Verify existing progress works (with `study_direction = NULL`)

### 6.2 Functional Testing

1. **Bidirectional Study**: 
   - Create card with Tibetan and English
   - Study in both directions
   - Verify separate progress tracking
2. **User Preference**: 
   - Set preference to English-first
   - Verify cards show English on front
   - Verify preference persists
3. **SM-2 Algorithm**: 
   - Verify progress calculation works per direction
   - Verify due dates are separate
   - Verify review counts are separate

### 6.3 Edge Cases

1. Cards with missing Tibetan or English text
2. Cards migrated from old format (fallback logic)
3. Users switching directions mid-study session
4. Progress tracking when card is deleted

---

## Phase 7: Deployment Strategy

### 7.1 Deployment Order

1. **Deploy Phase 1** (Schema changes) - No code changes, backward compatible
2. **Run Phase 2** (Data migration) - Manual SQL execution
3. **Deploy Phase 3-5** (Code changes) - With backward compatibility
4. **Monitor** - Check for errors, verify migration
5. **Deploy Phase 6** (Cleanup) - Remove fallback logic after validation

### 7.2 Rollback Plan

**If issues occur**:
1. New fields (`tibetan_text`, `english_text`) remain NULL
2. Code falls back to old fields (`front`, `back_english`, `back_tibetan_script`)
3. Progress continues using old format (`study_direction = NULL`)
4. No data loss - all old fields preserved

---

## Phase 8: Cleanup (Future)

**After validation period (1-2 weeks)**:

1. Remove fallback logic from components
2. Mark old fields as deprecated in schema
3. Add validation to require new fields for new cards
4. Optional: Add migration script to populate old fields from new (for legacy tools)

---

## Migration Checklist

### Pre-Migration
- [ ] Backup database
- [ ] Review migration SQL in staging
- [ ] Document current card count by type
- [ ] Document current progress record count

### Phase 1: Schema
- [ ] Add `tibetan_text` and `english_text` columns
- [ ] Add `study_direction` to `card_progress`
- [ ] Create `user_study_preferences` table
- [ ] Add indexes and constraints
- [ ] Verify schema changes

### Phase 2: Data
- [ ] Run migration SQL
- [ ] Validate migration results
- [ ] Check for unmigrated cards
- [ ] Document migration statistics

### Phase 3: Services
- [ ] Update `cardSchema.js`
- [ ] Update `cardsService.js`
- [ ] Update `progressService.js`
- [ ] Create `studyPreferencesService.js`
- [ ] Add backward compatibility logic

### Phase 4: Components
- [ ] Update `EditCardForm.jsx`
- [ ] Update `AddCardForm.jsx`
- [ ] Update `Flashcard.jsx`
- [ ] Update `App.jsx`
- [ ] Update `cardUtils.js`
- [ ] Update `AdminCardTable.jsx`

### Phase 5: UI
- [ ] Create `StudyDirectionToggle.jsx`
- [ ] Update `ProgressStats.jsx`
- [ ] Add study mode indicator

### Phase 6: Testing
- [ ] Test bidirectional study
- [ ] Test progress tracking
- [ ] Test user preferences
- [ ] Test backward compatibility
- [ ] Test edge cases

### Phase 7: Deployment
- [ ] Deploy schema changes
- [ ] Run data migration
- [ ] Deploy code changes
- [ ] Monitor for errors
- [ ] Verify functionality

### Post-Migration
- [ ] Verify all cards migrated
- [ ] Verify progress tracking works
- [ ] Monitor user feedback
- [ ] Document any issues

---

## Timeline Estimate

- **Phase 1** (Schema): 1 day
- **Phase 2** (Data Migration): 1 day (testing + execution)
- **Phase 3** (Services): 2-3 days
- **Phase 4** (Components): 3-4 days
- **Phase 5** (UI): 1-2 days
- **Phase 6** (Testing): 2-3 days
- **Phase 7** (Deployment): 1 day

**Total**: ~12-15 days

---

## Risks and Mitigations

### Risk 1: Data Migration Fails
**Mitigation**: 
- Run migration in transaction
- Validate before commit
- Keep old fields during transition
- Have rollback SQL ready

### Risk 2: Progress Tracking Confusion
**Mitigation**:
- Legacy progress (`study_direction = NULL`) treated as default direction
- Clear UI indicators showing current direction
- Separate progress displays per direction

### Risk 3: User Confusion
**Mitigation**:
- Clear UI labels ("Tibetan Text" vs "English Text")
- User preference persists
- Help text explaining bidirectional study

### Risk 4: Performance Impact
**Mitigation**:
- Add indexes on new fields
- Monitor query performance
- Optimize progress loading (batch queries)

---

## Success Criteria

1. ✅ All word/phrase cards have `tibetan_text` and `english_text` populated
2. ✅ Users can study cards in both directions
3. ✅ Progress tracking is separate per direction
4. ✅ User preferences persist across sessions
5. ✅ SM-2 algorithm works correctly per direction
6. ✅ No data loss during migration
7. ✅ Backward compatibility maintained during transition

---

## Notes

- **Number cards**: Excluded from this migration. Continue using existing `front`/`backArabic`/`backTibetanScript` structure.
- **Audio**: Audio button logic remains the same (appears where Tibetan text is shown).
- **Images**: Image logic remains the same (shows on English side for English→Tibetan cards).

---

## Related Files

- Database Migrations: `supabase/migrations/`
- Service Layer: `src/services/`
- Components: `src/components/`
- Utilities: `src/utils/`
- Schema Definition: `src/data/cardSchema.js`

