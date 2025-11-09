# Feature Specification: Bulk Add Cards

**Feature Branch**: `001-bulk-add-cards`  
**Created**: 2025-11-09  
**Status**: Draft  
**Input**: User description: "I want to create a bulk add card feature in admin under manage cards.The user story is as follows: An admin has a list of two or more words (perhaps as many as a hundred) and wants to copy and paste that list into a text box, separating them just as lines are separated by a return. Then, be able to select which other characteristics such as card type, categories, instruction level."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Bulk Add Words with Shared Characteristics (Priority: P1)

An admin navigates to the Card Management section in the admin panel and opens the bulk add feature. They paste a list of English words (one per line) into a text box, selects a card type (word/phrase), chooses categories and instruction level that will apply to all words, and submits. The system processes all words, checks for duplicates, creates new cards for words that don't exist, and displays a summary of results.

**Why this priority**: This is the core functionality - enabling admins to efficiently add multiple cards at once with shared metadata. Without this, admins would need to add cards one-by-one, which is time-consuming and error-prone.

**Independent Test**: Can be fully tested by pasting a list of 5-10 words, selecting card type and classification options, submitting, and verifying that new cards are created with the correct shared characteristics. This delivers immediate value by reducing manual data entry time.

**Acceptance Scenarios**:

1. **Given** an admin is on the Card Management page, **When** they click a "Bulk Add Cards" button, **Then** a bulk add interface opens with a text area for pasting words
2. **Given** the bulk add interface is open, **When** an admin pastes a list of words (one per line) and selects card type, categories, and instruction level, **Then** the form displays the selected options and word count
3. **Given** an admin has entered words and selected options, **When** they submit the bulk add form, **Then** the system checks each word against existing cards and creates new cards only for words that don't already exist
4. **Given** the bulk add process completes, **When** cards are created, **Then** the system displays a summary showing how many cards were created, how many were skipped (duplicates), and any errors encountered
5. **Given** a bulk add operation completes successfully, **When** the admin views the card list, **Then** all newly created cards appear with the selected card type, categories, and instruction level

---

### User Story 2 - Duplicate Detection and Reporting (Priority: P2)

When an admin submits a bulk add operation, the system checks each word against existing cards in the database. Words that already exist are identified and reported to the admin, allowing them to understand which words were skipped and why.

**Why this priority**: Prevents duplicate cards from being created, which would clutter the database and confuse users. Provides transparency about what happened during the bulk operation.

**Independent Test**: Can be fully tested by submitting a bulk add with a mix of new words and words that already exist in the database, then verifying that only new words create cards and duplicates are reported in the summary. This delivers value by maintaining data quality.

**Acceptance Scenarios**:

1. **Given** an admin submits a bulk add with words that include some existing cards, **When** the system processes the request, **Then** it identifies which words already exist by checking the database
2. **Given** duplicate words are detected, **When** the bulk add completes, **Then** the summary report lists which words were skipped as duplicates
3. **Given** duplicate detection is performed, **When** checking for duplicates, **Then** the system compares words case-insensitively and trims whitespace to avoid false duplicates

---

### User Story 3 - Automatic Translation and Image Generation (Priority: P1)

When new words are identified during bulk add, the system automatically translates each English word to Tibetan and generates an image for each card. This eliminates manual translation and image selection steps, making bulk card creation fully automated.

**Why this priority**: This is critical functionality that makes bulk add truly efficient. Without automatic translation and image generation, admins would still need to manually translate and add images to each card, negating much of the time savings from bulk operations.

**Independent Test**: Can be fully tested by submitting a bulk add with 5-10 new words and verifying that each created card has Tibetan translation populated and an image generated. This delivers immediate value by automating the most time-consuming parts of card creation.

**Acceptance Scenarios**:

1. **Given** new words are identified during bulk add, **When** cards are being created, **Then** the system automatically translates each English word to Tibetan using the translation service
2. **Given** translation is performed for a word, **When** a card is created, **Then** the card's Tibetan text field is populated with the translation result
3. **Given** new cards are being created, **When** each card is processed, **Then** the system automatically generates an image for the card using the image generation service
4. **Given** an image is generated for a card, **When** the card is created, **Then** the card's image URL field is populated with the generated image
5. **Given** translation or image generation fails for a word, **When** the bulk operation completes, **Then** the card is still created but the failure is reported in the summary, and the admin can manually add translation/image later

---

### User Story 4 - New Category Flagging for Review (Priority: P1)

All cards created via bulk add are automatically assigned a "new" category, allowing admins to easily filter and review them one-by-one to verify translations, images, and other details before making them available to users.

**Why this priority**: Ensures quality control by providing a clear workflow for reviewing bulk-created cards. Without this flagging system, admins would have difficulty identifying which cards need review, potentially leading to errors being missed.

**Independent Test**: Can be fully tested by completing a bulk add operation and verifying that all newly created cards have the "new" category assigned, then filtering cards by this category to review them. This delivers value by enabling efficient quality assurance workflows.

**Acceptance Scenarios**:

1. **Given** cards are created via bulk add, **When** each card is saved, **Then** the "new" category is automatically added to the card's categories
2. **Given** a card has the "new" category, **When** an admin views the card list, **Then** they can filter by the "new" category to see all bulk-created cards requiring review
3. **Given** an admin reviews a bulk-created card, **When** they are satisfied with the card's content, **Then** they can remove the "new" category to mark it as reviewed
4. **Given** the "new" category exists in the system, **When** bulk add operations run, **Then** the category is automatically created if it doesn't already exist

---

### User Story 5 - Validation and Error Handling (Priority: P2)

The bulk add feature validates input before processing, handles errors gracefully, and provides clear feedback to the admin about what went wrong and how to fix it.

**Why this priority**: Ensures data quality and provides a good user experience even when things go wrong. Prevents invalid data from being created and helps admins understand and fix issues quickly.

**Independent Test**: Can be fully tested by submitting invalid inputs (empty list, invalid card type, etc.) and verifying that appropriate error messages are shown and no invalid cards are created. This delivers value by preventing data corruption and reducing support burden.

**Acceptance Scenarios**:

1. **Given** an admin submits a bulk add with an empty word list, **When** they attempt to submit, **Then** the system displays an error message requiring at least 2 words
2. **Given** an admin submits a bulk add with more than 100 words, **When** they attempt to submit, **Then** the system displays an error message indicating the maximum limit
3. **Given** an admin submits a bulk add with invalid characters or formatting, **When** the system processes it, **Then** invalid entries are skipped and reported in the summary
4. **Given** a network error occurs during bulk add, **When** the operation fails, **Then** the system displays an error message and no partial cards are created

---

### Edge Cases

- What happens when a word list contains empty lines or only whitespace?
- How does the system handle words with leading/trailing whitespace?
- What happens if all words in the list are duplicates?
- How does the system handle very long words (e.g., > 100 characters)?
- What happens if the admin selects categories or instruction levels that don't exist?
- How does the system handle concurrent bulk add operations?
- What happens if the database connection is lost mid-operation?
- How does the system handle words that contain special characters or Unicode?
- What happens if the admin pastes a list with inconsistent formatting (some lines have multiple words)?
- What happens if translation service is unavailable or returns an error for a word?
- What happens if image generation service is unavailable or returns an error for a word?
- How does the system handle partial failures (some translations succeed, some fail)?
- What happens if the "new" category cannot be created (permissions issue)?
- How does the system handle rate limiting from translation or image generation APIs?
- What happens if a translation returns an empty result?
- How does the system handle very long translations that exceed field limits?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a bulk add cards interface accessible from the Card Management page in the admin panel
- **FR-002**: System MUST provide a text area where admins can paste a list of words, with each word on a separate line
- **FR-003**: System MUST allow admins to select a card type (word or phrase) that applies to all words in the bulk operation
- **FR-004**: System MUST allow admins to select one or more categories that apply to all words in the bulk operation
- **FR-005**: System MUST allow admins to select an instruction level that applies to all words in the bulk operation
- **FR-006**: System MUST validate that at least 2 words are provided before allowing submission
- **FR-007**: System MUST validate that no more than 100 words are provided in a single bulk operation
- **FR-008**: System MUST check each word against existing cards in the database to detect duplicates before creating new cards
- **FR-009**: System MUST create new cards only for words that do not already exist in the database
- **FR-010**: System MUST apply the selected card type, categories, and instruction level to all newly created cards
- **FR-011**: System MUST automatically translate each English word to Tibetan when creating new cards
- **FR-012**: System MUST automatically generate an image for each new card created during bulk add
- **FR-013**: System MUST automatically assign the "new" category to all cards created via bulk add
- **FR-014**: System MUST create the "new" category if it doesn't already exist in the system
- **FR-015**: System MUST display a summary report after bulk add completion showing: number of cards created, number of words skipped (duplicates), translation failures, image generation failures, and any errors encountered
- **FR-016**: System MUST trim whitespace from each word before processing
- **FR-017**: System MUST skip empty lines and lines containing only whitespace when processing the word list
- **FR-018**: System MUST handle duplicate detection case-insensitively
- **FR-019**: System MUST validate that selected categories exist in the database before processing
- **FR-020**: System MUST validate that selected instruction level exists in the database before processing
- **FR-021**: System MUST display clear error messages when validation fails
- **FR-022**: System MUST create cards even if translation or image generation fails (card is created with available data, failures reported in summary)
- **FR-023**: System MUST allow admins to cancel a bulk add operation before submission
- **FR-024**: System MUST display a word count as the admin types or pastes words into the text area
- **FR-025**: System MUST show progress indication during bulk add operations (translation, image generation, card creation)

### Key Entities *(include if feature involves data)*

- **Bulk Add Operation**: Represents a single bulk add request containing a list of words and shared characteristics (card type, categories, instruction level)
- **Word Entry**: Represents a single word from the pasted list, which may be processed into a new card or skipped as a duplicate
- **Duplicate Detection Result**: Represents the outcome of checking a word against existing cards, indicating whether the word already exists
- **Translation Result**: Represents the outcome of translating an English word to Tibetan, including the translated text or error information
- **Image Generation Result**: Represents the outcome of generating an image for a card, including the image URL or error information
- **Bulk Add Summary**: Represents the final report of a bulk add operation, including counts of cards created, duplicates skipped, translation successes/failures, image generation successes/failures, and any errors

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can add 50 new word cards in under 5 minutes (including paste, selection, automatic translation, image generation, and submission)
- **SC-002**: System correctly identifies and skips 100% of duplicate words without creating duplicate cards
- **SC-003**: Bulk add operations complete successfully 90% of the time without critical errors (translation/image failures are acceptable and reported)
- **SC-004**: System processes up to 100 words in a single bulk operation, completing translation and image generation within 10 minutes
- **SC-005**: Translation success rate: 95% of words are successfully translated to Tibetan during bulk add
- **SC-006**: Image generation success rate: 90% of cards successfully receive generated images during bulk add
- **SC-007**: Admin satisfaction: 90% of admins report that bulk add saves them significant time compared to adding cards individually
- **SC-008**: Data quality: Less than 1% of cards created via bulk add require correction due to formatting or validation issues
- **SC-009**: System provides clear feedback showing progress during bulk operations (word count processed, translation status, image generation status)
- **SC-010**: All bulk-created cards are correctly flagged with "new" category for review workflow

## Assumptions

- Admins will primarily use this feature for adding word-type cards (as opposed to number cards)
- Words pasted will be in English and will be automatically translated to Tibetan during bulk add
- Images will be automatically generated for each new card using the existing image generation service
- The "new" category will be used as a workflow marker for reviewing bulk-created cards
- Translation and image generation services are available and reliable (failures handled gracefully)
- The feature will be used primarily for initial card population, not frequent updates
- Duplicate detection will check against the `englishText` field for word/phrase cards
- Card type selection will default to "word" if not specified
- Categories and instruction level selections are optional (can be left unselected)
- The bulk add interface will be accessible only to admin users
- Network connectivity is stable during bulk operations (handled gracefully if not)
- Translation and image generation may take time for large batches, and progress indication will be shown

## Dependencies

- Existing card management infrastructure (AdminPage, CardManager components)
- Card schema and validation (cardSchema.js)
- Card service for database operations (cardsService.js)
- Category and instruction level services for loading available options
- Translation service (translateText utility) for automatic English-to-Tibetan translation
- Image generation service (generateAIImage utility) for automatic image creation
- Category service for creating/managing the "new" category

## Out of Scope

- Bulk editing of existing cards
- Bulk deletion of cards
- Import from external file formats (CSV, Excel, etc.)
- Bulk audio attachment (images are automatically generated, but audio is not)
- Support for number/numerals card types in bulk add (focused on word/phrase cards)
- Undo/redo functionality for bulk operations
- Preview of cards before creation
- Manual review workflow automation (admins manually review cards flagged with "new" category)
- Automatic removal of "new" category after a time period (manual removal only)
