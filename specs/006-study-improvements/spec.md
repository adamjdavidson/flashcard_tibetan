# Feature Specification: Study Experience Improvements

**Feature Branch**: `006-study-improvements`  
**Created**: 2025-11-12  
**Status**: Draft  
**Input**: User description: "Several improvements: 1. Images should appear any time there is an English spelling word. 2. Images should always appear on the back, after the card is turned, whether the writing is in Tibetan or English. 3. I want an edit button when studying cards if I am in Admin mode. That way I can make changes on the fly to any card when studying. 4. The menu that allows me to choose cards for studying does not have a filter for Instruction Level. Please add one. I should be able to select more than one filter, such as \"words\" and \"Arapatsa\" Instruction Level."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Image Display on Card Backs (Priority: P1)

When studying flashcards, students need visual aids to reinforce vocabulary learning. Currently, images may not appear consistently or in the optimal location. This story ensures that images always appear on the back of cards (after flipping) for any card containing English text, providing consistent visual reinforcement regardless of which side contains Tibetan vs English text.

**Why this priority**: Visual learning is core to the flashcard experience. Consistent image display directly impacts learning effectiveness for all users and addresses a fundamental UX issue in the primary learning flow.

**Independent Test**: Can be fully tested by viewing any flashcard with English text during study mode. The image should always appear on the back (answer side) after flipping the card, regardless of whether the front shows Tibetan or English. Delivers immediate value by providing consistent visual reinforcement for vocabulary learning.

**Acceptance Scenarios**:

1. **Given** a word card with English text on front and Tibetan on back, **When** user flips the card, **Then** the associated image appears on the back alongside the Tibetan text
2. **Given** a word card with Tibetan on front and English on back, **When** user flips the card, **Then** the associated image appears on the back alongside the English text
3. **Given** a word card with English spelling (regardless of card type), **When** the card is displayed, **Then** the system has an associated image ready to display on the back
4. **Given** a phrase card with English text, **When** user flips the card, **Then** the associated image appears on the back
5. **Given** a number card with English numeral word (e.g., "one", "two"), **When** user flips the card, **Then** the associated image appears on the back

---

### User Story 2 - Multi-Filter Study Card Selection (Priority: P2)

When preparing to study, users need to narrow down their card selection to specific topics and difficulty levels. Currently, users can filter by card type and category, but cannot filter by Instruction Level. This story adds Instruction Level filtering with multi-select capability, allowing users to combine filters (e.g., "words" + "Arpatsa level" + "animals category") to create targeted study sessions.

**Why this priority**: Filtering improves study efficiency and allows progressive learning. While not changing the core flashcard experience, it significantly improves how users select which content to study. This is especially important for structured learning programs with defined instruction levels.

**Independent Test**: Can be fully tested by accessing the study card selection menu, selecting multiple filters including at least one Instruction Level filter, and verifying that only cards matching ALL selected filters appear in the study session. Delivers value by enabling targeted practice sessions.

**Acceptance Scenarios**:

1. **Given** the study card selection menu, **When** user views available filters, **Then** an "Instruction Level" filter is visible alongside existing Type and Category filters
2. **Given** the Instruction Level filter, **When** user clicks/taps it, **Then** all available instruction levels are displayed (e.g., Arpatsa, Intermediate, Advanced)
3. **Given** multiple filter categories, **When** user selects "words" type AND "Arpatsa" instruction level, **Then** only word cards at the Arpatsa level appear in the study session
4. **Given** three active filters (Type: "words", Category: "animals", Level: "Arpatsa"), **When** user starts studying, **Then** only cards matching all three criteria are included
5. **Given** the Instruction Level filter with multiple values selected, **When** user deselects one value, **Then** the card selection updates immediately to reflect the change
6. **Given** no Instruction Level filter selected, **When** user starts studying, **Then** cards from all instruction levels are included (backward compatible behavior)

---

### User Story 3 - Admin Edit During Study (Priority: P3)

When administrators study flashcards, they often notice errors, typos, or opportunities for improvement in the card content. Currently, they must exit the study session, navigate to the admin section, find the specific card, and make edits. This story adds an "Edit" button during study sessions (visible only to admin users) that allows immediate card editing without leaving the study flow.

**Why this priority**: This is an admin convenience feature that improves content curation workflow. While valuable for maintaining card quality, it doesn't affect the core learning experience for regular users and has a smaller user base (admins only).

**Independent Test**: Can be fully tested by logging in as an admin user, starting a study session, and verifying that an Edit button appears on each card. Clicking the button should open an edit interface. After saving changes, the updated card content should be immediately visible. Delivers value by streamlining the admin content curation workflow.

**Acceptance Scenarios**:

1. **Given** an admin user in study mode, **When** viewing any flashcard, **Then** an "Edit" button is visible on the card interface
2. **Given** a non-admin user in study mode, **When** viewing any flashcard, **Then** no "Edit" button is visible
3. **Given** an admin viewing a flashcard, **When** clicking the "Edit" button, **Then** an edit interface appears allowing modification of card content (front, back, categories, instruction level, image, etc.)
4. **Given** an admin editing a card during study, **When** saving changes, **Then** the changes are persisted to the database immediately
5. **Given** an admin who just saved card edits during study, **When** returning to study mode, **Then** the updated card content is displayed with the changes applied
6. **Given** an admin editing a card, **When** canceling the edit, **Then** the original card content remains unchanged and study mode resumes
7. **Given** an admin editing a card, **When** saving changes, **Then** the study session continues from where it left off (same card position, same ratings)

---

### Edge Cases

- What happens when a card has English text but no associated image? (Display card without image gracefully, don't break the study experience)
- How does the system handle cards with both Tibetan and English on the same side? (Image still appears on back only, following the rule "always on back after flip")
- What happens if an admin edits a card and another admin is viewing the same card? (Accept last-write-wins model; no real-time conflict resolution needed given single-user study sessions)
- What happens when multiple instruction levels are selected and no cards match? (Display "No cards match selected filters" message with option to modify filters)
- What happens when a user selects instruction level filter for cards that don't have instruction levels assigned? (Such cards are excluded from filtered results unless "No instruction level" is explicitly added as a filter option)
- What happens if an admin tries to save an edit with invalid data (e.g., empty required fields)? (Display validation errors inline, prevent save until corrected)
- How does image display work for card types other than words (numbers, phrases)? (Apply same "image on back" rule consistently across all card types that have English text)

## Requirements *(mandatory)*

### Functional Requirements

#### Image Display Requirements

- **FR-001**: System MUST display images on the back (answer side) of flashcards after the card is flipped
- **FR-002**: System MUST display images for any card that contains English spelling words, regardless of card type (word, phrase, number)
- **FR-003**: System MUST display images on the back whether the card has Tibetan-on-front/English-on-back OR English-on-front/Tibetan-on-back orientation
- **FR-004**: System MUST NOT display images on the front (question side) of cards
- **FR-005**: System MUST handle cards without associated images gracefully (no broken image icons, no layout issues)

#### Study Filter Requirements

- **FR-006**: System MUST provide an "Instruction Level" filter in the study card selection menu
- **FR-007**: System MUST allow users to select multiple instruction levels simultaneously (multi-select)
- **FR-008**: System MUST allow users to combine Instruction Level filters with existing Type and Category filters
- **FR-009**: System MUST apply all selected filters with AND logic (cards must match ALL selected criteria)
- **FR-010**: System MUST update the available card count dynamically as filters are selected/deselected
- **FR-011**: System MUST display all available instruction levels in the filter (e.g., Arpatsa, Intermediate, Advanced, or whatever levels exist in the system)
- **FR-012**: System MUST persist filter selections during a user session (until explicitly changed or session ends)
- **FR-013**: System MUST include cards from all instruction levels when no instruction level filter is selected (backward compatible)

#### Admin Edit Requirements

- **FR-014**: System MUST display an "Edit" button on flashcards during study mode ONLY when the logged-in user has admin role
- **FR-015**: System MUST NOT display the "Edit" button to non-admin users during study mode
- **FR-016**: System MUST open an edit interface when the admin clicks the "Edit" button during study
- **FR-017**: System MUST allow admins to edit all editable card properties (front text, back text, categories, instruction level, associated image, etc.) from the study-mode edit interface
- **FR-018**: System MUST persist card changes to the database immediately upon save
- **FR-019**: System MUST display updated card content in the study session after save (no need to refresh/restart)
- **FR-020**: System MUST allow admins to cancel edits without saving changes
- **FR-021**: System MUST preserve study session state (current card position, ratings given so far) after editing a card
- **FR-022**: System MUST validate card data before allowing save (e.g., required fields, data format)
- **FR-023**: System MUST display validation errors inline when save is attempted with invalid data

### Key Entities

- **Flashcard**: Represents a study card with front content, back content, card type (word/phrase/number), optional image reference, optional instruction level assignment, and optional category assignments
- **Instruction Level**: Represents a difficulty/progression level (e.g., "Arpatsa", "Intermediate", "Advanced") that can be assigned to cards
- **Study Session Filter**: Represents the user's current filter selections (card types, categories, instruction levels) used to determine which cards appear in a study session
- **User Role**: Represents user permissions (admin vs regular user) that determines whether admin-only features (like edit-during-study) are accessible

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of flashcards with English text display an associated image on the back (answer side) after flipping
- **SC-002**: Users can select and combine multiple filters (Type, Category, Instruction Level) to create targeted study sessions with no more than 3 clicks
- **SC-003**: Admin users can edit a card and return to studying with updated content in under 30 seconds
- **SC-004**: Filter selection updates available card count in under 1 second (immediate feedback)
- **SC-005**: Study sessions correctly include only cards matching ALL selected filter criteria (0% false positives)
- **SC-006**: Image display on card backs does not increase card flip time by more than 200ms compared to cards without images
- **SC-007**: Admin edit button is visible to 100% of admin users and 0% of non-admin users
- **SC-008**: Card edits made during study are persisted successfully 100% of the time (no data loss)
