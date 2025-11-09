# Feature Specification: Bulk Image Generation

**Feature Branch**: `004-bulk-image-generation`  
**Created**: 2025-11-09  
**Status**: Draft  
**Input**: User description: "I want to be able to bulk create images.So I'd like a button in the admin card management panel that looks through all word cards and identifies cards that don't have an image and generates an image for them."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Bulk Generate Images for Word Cards Without Images (Priority: P1)

As an admin user, I want to click a button in the card management panel that automatically identifies all word cards missing images and generates images for them, so I can efficiently populate images for multiple cards at once instead of manually generating images one by one.

**Why this priority**: This is the core functionality - without it, the feature doesn't exist. It delivers immediate value by automating a repetitive task and can be fully tested independently.

**Independent Test**: Can be fully tested by clicking the bulk generate button and verifying that images are generated for cards that previously lacked them. Delivers value by reducing manual work from potentially hundreds of individual operations to a single action.

**Acceptance Scenarios**:

1. **Given** I am an admin user viewing the Card Management tab, **When** I click the "Bulk Generate Images" button, **Then** the system identifies all word cards without images and begins generating images for them
2. **Given** the bulk generation process is running, **When** I view the progress indicator, **Then** I can see how many cards have been processed and how many remain
3. **Given** the bulk generation process completes successfully, **When** I view the word cards, **Then** all previously image-less word cards now have generated images
4. **Given** some cards fail to generate images during bulk processing, **When** the process completes, **Then** I receive a summary showing successful generations and any failures with reasons

---

### User Story 2 - Progress Tracking and Cancellation (Priority: P2)

As an admin user, I want to see real-time progress of the bulk image generation process and be able to cancel it if needed, so I can monitor the operation and stop it if I realize I made a mistake or if it's taking too long.

**Why this priority**: Provides control and transparency, which is important for long-running operations. Can be tested independently by starting bulk generation and verifying progress updates and cancellation functionality.

**Independent Test**: Can be fully tested by starting bulk generation, observing progress updates, and canceling the operation. Delivers value by giving users control over long-running processes.

**Acceptance Scenarios**:

1. **Given** bulk image generation is in progress, **When** I view the progress indicator, **Then** I see the current card being processed, total cards to process, and number completed
2. **Given** bulk image generation is running, **When** I click the cancel button, **Then** the process stops and I receive confirmation of cancellation with a summary of what was completed
3. **Given** I cancel bulk generation partway through, **When** I check the cards, **Then** only the cards processed before cancellation have new images

---

### User Story 3 - Filtered Bulk Generation (Priority: P3)

As an admin user, I want to be able to generate images only for word cards matching specific filters (category, instruction level, etc.), so I can focus bulk generation on specific subsets of cards rather than all cards at once.

**Why this priority**: Provides flexibility for admins who want to generate images in batches by category or other criteria. Can be tested independently by applying filters and verifying only matching cards are processed.

**Independent Test**: Can be fully tested by applying filters, clicking bulk generate, and verifying only filtered cards are processed. Delivers value by allowing targeted bulk operations.

**Acceptance Scenarios**:

1. **Given** I have filters applied (e.g., specific category or instruction level), **When** I click bulk generate, **Then** only word cards matching the filters that lack images are processed
2. **Given** no filters are applied, **When** I click bulk generate, **Then** all word cards without images are processed

---

### Edge Cases

- What happens when there are no word cards without images? (System should show message: "All word cards already have images")
- What happens when all word cards already have images? (Button should be disabled or show appropriate message)
- How does system handle network errors during bulk generation? (Should continue with remaining cards, log errors, and report failures in summary)
- What happens if the image generation API rate limit is reached? (Should pause and retry with backoff, or report rate limit error)
- How does system handle cards with invalid or missing text fields needed for image generation? (Should skip those cards and report them in the failure summary)
- What happens if the user navigates away during bulk generation? (Process should continue in background, or cancel with warning)
- How does system handle very large batches (1000+ cards)? (Should process in chunks with progress updates, or allow admin to set batch size limits)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a "Bulk Generate Images" button in the admin card management panel
- **FR-002**: System MUST identify all word cards that do not have an imageUrl value
- **FR-003**: System MUST generate images for identified word cards using the existing image generation service
- **FR-004**: System MUST display real-time progress showing current card being processed, total cards, and completion count
- **FR-005**: System MUST allow users to cancel an in-progress bulk generation operation
- **FR-006**: System MUST respect active filters (type, category, instruction level) when identifying cards for bulk generation
- **FR-007**: System MUST save generated images to cards as they are created (not wait until all are complete)
- **FR-008**: System MUST provide a completion summary showing number of successful generations and number of failures
- **FR-009**: System MUST handle errors gracefully by continuing with remaining cards when individual card generation fails
- **FR-010**: System MUST disable the bulk generate button while a generation process is already running
- **FR-011**: System MUST use the card's primary text field (englishText, backEnglish, or front) as the prompt for image generation
- **FR-012**: System MUST skip cards that lack any text fields suitable for image generation and report them in the failure summary
- **FR-013**: System MUST show appropriate messaging when no word cards without images are found

### Key Entities

- **Card**: Represents a flashcard with attributes including type (word/phrase/number/numerals), imageUrl (nullable), englishText, backEnglish, front, and other text fields
- **Bulk Generation Job**: Represents an ongoing bulk image generation operation with state including: cards to process, current card index, completed count, failed count, and status (running/cancelled/completed)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin users can initiate bulk image generation for all word cards without images with a single button click
- **SC-002**: Bulk generation processes at least 10 cards per minute (assuming standard API response times)
- **SC-003**: Progress indicator updates within 2 seconds of each card completion, showing accurate current status
- **SC-004**: At least 90% of eligible word cards successfully receive generated images when bulk generation completes
- **SC-005**: Admin users receive a clear summary report within 5 seconds of bulk generation completion showing success and failure counts
- **SC-006**: Cancellation of bulk generation completes within 3 seconds of user clicking cancel button
- **SC-007**: System correctly identifies word cards without images, excluding cards that already have imageUrl values

## Assumptions

- Word cards are identified by card type being "word" or "phrase" (based on existing card type system)
- Image generation uses the same service/API already used for individual card image generation
- Cards are stored in a database/backend that supports querying and updating imageUrl fields
- Admin users have appropriate permissions to modify cards
- The existing image generation infrastructure can handle sequential bulk requests (rate limiting may be needed)
- Progress updates can be displayed in the UI without requiring page refresh
- Failed image generations for individual cards should not stop the entire bulk process

## Dependencies

- Existing image generation API/service (from feature 001-immediate-image-generation)
- Admin card management panel (AdminPage component)
- Card data service with ability to query and update cards
- Authentication/authorization system to ensure only admins can access bulk generation

## Out of Scope

- Generating images for non-word card types (numbers, numerals) - only word/phrase cards
- Regenerating images for cards that already have images (only processes cards without images)
- Batch size limits or queuing system for very large operations (assumes reasonable card counts)
- Scheduling bulk generation to run at specific times
- Previewing images before saving during bulk generation
- Undo functionality for bulk-generated images
