# Feature Specification: New Checkbox for Bulk Add Cards

**Feature Branch**: `005-new-checkbox-bulk-add`  
**Created**: 2025-11-09  
**Status**: Draft  
**Input**: User description: "issue: the bulk add card doesn't ahve a []New checkbox (I had asked for that). The user's story here is that I will enter words, and then I'll have a Tibetan look over what I've entered or what has been automatically translated and fix them. So when a new word is entered with Google Translate, I want it to have an automatic check next to "New" that the Tibetan can uncheck."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Display New Checkbox in Bulk Add Form (Priority: P1)

An admin opens the bulk add cards form and sees a "New" checkbox option alongside other card characteristics (card type, categories, instruction level). This checkbox is visible and clearly labeled, allowing the admin to understand that cards created via bulk add will be flagged for review.

**Why this priority**: This is the core functionality - making the "New" category assignment visible and controllable in the UI. Without this checkbox, admins cannot see or control whether cards are flagged for review, which is essential for the review workflow.

**Independent Test**: Can be fully tested by opening the bulk add form and verifying that a "New" checkbox appears in the form, is clearly labeled, and is checked by default. This delivers immediate value by providing transparency and control over the review flagging process.

**Acceptance Scenarios**:

1. **Given** an admin opens the bulk add cards form, **When** they view the form, **Then** a "New" checkbox is displayed alongside other card characteristics (card type, categories, instruction level)
2. **Given** the bulk add form is displayed, **When** the admin views the "New" checkbox, **Then** it is clearly labeled (e.g., "New" or "Mark as New (for review)")
3. **Given** the bulk add form loads, **When** the form is initially displayed, **Then** the "New" checkbox is checked by default
4. **Given** an admin is filling out the bulk add form, **When** they interact with the "New" checkbox, **Then** they can check or uncheck it before submitting

---

### User Story 2 - Automatic New Checkbox Selection for Auto-Translated Words (Priority: P1)

When words are entered into the bulk add form and will be automatically translated via Google Translate, the "New" checkbox is automatically checked to indicate these cards need review. This ensures that all automatically translated content is flagged for human verification.

**Why this priority**: This is critical for quality control. Auto-translated content needs human review to ensure accuracy, and automatically checking the "New" checkbox ensures no auto-translated cards slip through without review. This maintains the integrity of the learning content.

**Independent Test**: Can be fully tested by entering words into the bulk add form and verifying that the "New" checkbox becomes checked (if not already), indicating that these cards will be flagged for review. This delivers value by ensuring quality control for automatically generated content.

**Acceptance Scenarios**:

1. **Given** an admin enters words into the bulk add form, **When** the form detects that words will be automatically translated, **Then** the "New" checkbox is automatically checked
2. **Given** the "New" checkbox is automatically checked, **When** the admin views the form, **Then** the checkbox appears checked, indicating cards will be flagged for review
3. **Given** an admin manually unchecks the "New" checkbox, **When** they enter new words that will be auto-translated, **Then** the checkbox remains unchecked (respects manual override)
4. **Given** words are entered that will be auto-translated, **When** the bulk add operation completes, **Then** cards created with auto-translation have the "new" category assigned only if the checkbox was checked

---

### User Story 3 - Tibetan Reviewer Can Uncheck New Category (Priority: P1)

A Tibetan reviewer views cards that have been bulk-added and flagged with the "new" category. They can review each card's translation and content, and when satisfied, remove the "new" category to mark the card as reviewed and approved.

**Why this priority**: This completes the review workflow. Without the ability to remove the "new" category after review, cards would remain perpetually flagged, making it impossible to distinguish between cards needing review and cards that have been reviewed and approved.

**Independent Test**: Can be fully tested by filtering cards by the "new" category, reviewing a card's content, and removing the "new" category to mark it as reviewed. This delivers value by enabling an efficient review and approval workflow.

**Acceptance Scenarios**:

1. **Given** a Tibetan reviewer views the card list, **When** they filter by the "new" category, **Then** they see all bulk-created cards that need review
2. **Given** a reviewer is viewing a card with the "new" category, **When** they review the card's translation and content, **Then** they can see all card details including English text, Tibetan translation, and image
3. **Given** a reviewer has reviewed a card and is satisfied with its content, **When** they edit the card, **Then** they can uncheck or remove the "new" category
4. **Given** a reviewer removes the "new" category from a card, **When** they save the card, **Then** the card no longer appears in the "new" category filter and is considered reviewed

---

### Edge Cases

- What happens if an admin unchecks the "New" checkbox but then adds words that will be auto-translated?
- How does the system handle the "New" checkbox state if the form is reset or cancelled?
- What happens if a reviewer removes the "new" category but then wants to flag the card for review again?
- How does the system handle cards created without the "new" category that later need to be flagged for review?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The bulk add form MUST display a "New" checkbox option alongside other card characteristics
- **FR-002**: The "New" checkbox MUST be checked by default when the bulk add form is displayed
- **FR-003**: The "New" checkbox MUST be automatically checked when words are entered that will be automatically translated
- **FR-004**: Admins MUST be able to manually check or uncheck the "New" checkbox before submitting the bulk add form
- **FR-005**: When the "New" checkbox is checked and bulk add is submitted, System MUST assign the "new" category to all created cards
- **FR-006**: When the "New" checkbox is unchecked and bulk add is submitted, System MUST NOT assign the "new" category to created cards
- **FR-007**: Reviewers MUST be able to view cards filtered by the "new" category
- **FR-008**: Reviewers MUST be able to remove the "new" category from cards after reviewing them
- **FR-009**: The "New" checkbox label MUST clearly indicate its purpose (e.g., "Mark as New (for review)" or "Flag for Review")
- **FR-010**: The bulk add form MUST preserve the "New" checkbox state if the form is reset or if the user navigates away and returns

### Key Entities *(include if feature involves data)*

- **Bulk Add Form**: Contains form fields including word list, card type selector, category selectors, instruction level selector, and the new "New" checkbox
- **Card**: Represents a flashcard with attributes including categories (which may include "new" category)
- **New Category**: A special category used to flag cards that need review by a Tibetan reviewer

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of bulk add forms display the "New" checkbox option
- **SC-002**: The "New" checkbox is checked by default in 100% of bulk add form loads
- **SC-003**: When words are entered for auto-translation, the "New" checkbox is automatically checked within 1 second
- **SC-004**: Admins can successfully check/uncheck the "New" checkbox before submitting in 100% of attempts
- **SC-005**: Cards created with "New" checkbox checked are assigned the "new" category in 100% of cases
- **SC-006**: Cards created with "New" checkbox unchecked are NOT assigned the "new" category in 100% of cases
- **SC-007**: Reviewers can filter cards by "new" category and see all bulk-created cards requiring review
- **SC-008**: Reviewers can remove the "new" category from cards within 2 clicks after opening the card edit form
- **SC-009**: The review workflow reduces the time to identify cards needing review by at least 50% compared to manual searching

## Assumptions

- The "new" category already exists in the system (from the bulk add cards feature)
- Card editing functionality already supports adding/removing categories
- The bulk add form already supports other card characteristics (card type, categories, instruction level)
- Auto-translation detection is already implemented in the bulk add feature
- Reviewers have access to card editing functionality

## Dependencies

- Existing bulk add cards feature (001-bulk-add-cards)
- Card editing functionality
- Category management system
- Card filtering by category

## Out of Scope

- Automatic quality checking of translations
- Bulk removal of "new" category from multiple cards at once
- Notification system for reviewers when new cards are added
- Translation accuracy scoring or metrics
- Automated approval workflows based on translation confidence scores
