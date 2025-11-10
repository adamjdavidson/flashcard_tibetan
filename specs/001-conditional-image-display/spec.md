# Feature Specification: Conditional Image Display on Cards

**Feature Branch**: `001-conditional-image-display`  
**Created**: 2025-11-09  
**Status**: Draft  
**Input**: User description: "the word cards have images on them. But the images don't show up when we see the actual card. I would like to have the following: Whenever there is English, there should be an image. When there is Tibetan it should be random—some times there is an image. Some times there isn't."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Always Show Image When English Text is on Front (Priority: P1)

When a learner studies a card with English text on the front (regardless of study direction), the card image is always displayed if an image exists for the card. This provides visual context and aids memory retention for English words.

**Why this priority**: This is the core requirement - ensuring images are visible when English text is displayed. Currently images exist but don't show up, which is a bug/regression that needs fixing.

**Independent Test**: Can be fully tested by viewing a card with English text on the front and verifying the image is displayed (if card has imageUrl). This delivers immediate value by making existing images visible to learners.

**Acceptance Scenarios**:

1. **Given** a card has English text on the front and has an imageUrl, **When** the card is displayed in study mode, **Then** the image is visible on the card front
2. **Given** a card has English text on the front but no imageUrl, **When** the card is displayed in study mode, **Then** no image is shown (no broken image placeholder)
3. **Given** study direction is "English to Tibetan", **When** a card with English on front and imageUrl is displayed, **Then** the image is shown
4. **Given** study direction is "Tibetan to English", **When** a card with English on back is displayed, **Then** the image is shown on the front if Tibetan is on front (handled by User Story 2), or on back if English is on front

---

### User Story 2 - Randomly Show Image When Tibetan Text is on Front (Priority: P1)

When a learner studies a card with Tibetan text on the front, the card image is randomly displayed (sometimes shown, sometimes not) if an image exists for the card. This creates variety in study sessions and prevents over-reliance on images for Tibetan recognition.

**Why this priority**: This is the second core requirement - implementing random image display for Tibetan text. This adds variety to the learning experience and helps learners practice recognition without always relying on visual cues.

**Independent Test**: Can be fully tested by viewing multiple cards with Tibetan text on the front and verifying that images appear randomly (some cards show images, some don't). This delivers value by creating varied study experiences.

**Acceptance Scenarios**:

1. **Given** a card has Tibetan text on the front and has an imageUrl, **When** the card is displayed in study mode, **Then** the image is randomly shown or hidden (not always shown, not always hidden)
2. **Given** study direction is "Tibetan to English", **When** multiple cards with Tibetan on front and imageUrl are displayed sequentially, **Then** some cards show images and some don't (random distribution)
3. **Given** a card has Tibetan text on the front but no imageUrl, **When** the card is displayed in study mode, **Then** no image is shown (no broken image placeholder)
4. **Given** the same card with Tibetan text is viewed multiple times, **When** it is displayed in different study sessions, **Then** the image display is randomized each time (not cached per card)

---

### Edge Cases

- What happens if a card has both English and Tibetan text on the front? (Should check which language is primary/displayed)
- How does randomization work across multiple study sessions? (Should be random each time, not deterministic per card)
- What happens if imageUrl exists but image fails to load? (Should handle gracefully with error state)
- How does this affect cards that already have images showing? (Should not break existing functionality)
- What about number cards? (Should follow same rules based on text language)
- How does this work with bidirectional cards? (Should check the actual displayed text, not just card type)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST always display card image when English text is on the card front and card has imageUrl
- **FR-002**: System MUST randomly display card image when Tibetan text is on the card front and card has imageUrl
- **FR-003**: System MUST determine which language is displayed on front based on study direction (tibetan_to_english vs english_to_tibetan)
- **FR-004**: System MUST check if card has imageUrl before attempting to display image
- **FR-005**: System MUST handle missing or broken images gracefully (no broken image placeholders)
- **FR-006**: Randomization MUST be per-card-display, not deterministic per card ID (same card can show/hide image on different views)
- **FR-007**: System MUST support both word/phrase cards and legacy card formats
- **FR-008**: System MUST work with bidirectional card fields (englishText, tibetanText) and legacy fields (front, backEnglish, backTibetanScript)

### Key Entities *(include if feature involves data)*

- **Card**: Represents a flashcard with attributes including imageUrl, englishText, tibetanText, front, backEnglish, backTibetanScript, type, studyDirection
- **Study Direction**: Determines which language appears on front ('tibetan_to_english' or 'english_to_tibetan')
- **Image Display Logic**: Determines whether to show image based on front text language and randomization

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of cards with English text on front and imageUrl display the image
- **SC-002**: Cards with Tibetan text on front show images in approximately 50% of displays (random distribution, ±10% variance acceptable)
- **SC-003**: No broken image placeholders appear when imageUrl is missing or invalid
- **SC-004**: Image display logic works correctly for both study directions (tibetan_to_english and english_to_tibetan)
- **SC-005**: Image display works for both new bidirectional cards and legacy card formats
- **SC-006**: Randomization produces varied results across multiple card views (not deterministic per card ID)

## Assumptions

- Cards already have imageUrl field populated (images are generated/stored elsewhere)
- Study direction is available in Flashcard component context
- Card bidirectional fields (englishText, tibetanText) are populated or can be derived from legacy fields
- Randomization can be implemented using Math.random() or similar (no need for seeded random)

## Dependencies

- Existing Flashcard component (src/components/Flashcard.jsx)
- Card data structure with imageUrl field
- Study direction state management
- Card bidirectional field helpers (getEnglishText, getTibetanText, ensureBidirectionalFields)

## Out of Scope

- Image generation or storage (images already exist)
- Image upload/editing functionality
- Admin controls for image display rules
- User preferences for image display frequency
- Image caching or preloading strategies
- Accessibility enhancements for image alt text (beyond existing implementation)
