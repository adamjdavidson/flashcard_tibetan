# Feature Specification: Advanced Admin Card Management

**Feature Branch**: `001-advanced-card-management`  
**Created**: 2025-11-01  
**Status**: Draft  
**Input**: User description: "The first feature I want is card management. I'd like the card management to be far more sophisticated for the admins. I'd want to be able to see it in card view or in more of a table or spreadsheet view in which I could also add, edit, and delete. I'd like to be able to have a richer classification. Cards represent numbers, words, or phrases so that's one category. But there's also instruction level - what level the students are at. There's also categories like basic greetings, family, nature, food, and we might want the capability of adding additional categories through the admin screen."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Views Cards in Table View (Priority: P1)

As an admin, I want to view all cards in a table/spreadsheet format so that I can quickly scan, sort, and analyze large numbers of cards efficiently.

**Why this priority**: The table view is the foundation for sophisticated card management. Without it, admins cannot efficiently manage large card libraries, which is essential for scalability.

**Independent Test**: Can be fully tested by navigating to Admin → Card Management → Table View and verifying cards are displayed in rows/columns with sortable headers. Admins can immediately see value through improved visibility of card data.

**Acceptance Scenarios**:

1. **Given** an admin is on the Card Management page, **When** they select "Table View", **Then** all cards are displayed in a table format with columns for type, front, back content, categories, instruction level, and actions
2. **Given** cards are displayed in table view, **When** an admin clicks a column header, **Then** the table is sorted by that column (ascending/descending toggle)
3. **Given** cards are in table view, **When** an admin scrolls through the table, **Then** cards load efficiently without performance degradation
4. **Given** the table view is active, **When** an admin applies filters (type, category, instruction level), **Then** only matching cards are displayed in the table

---

### User Story 2 - Admin Manages Cards in Table View (Priority: P1)

As an admin, I want to add, edit, and delete cards directly from the table view so that I can perform bulk management operations efficiently without switching contexts.

**Why this priority**: CRUD operations in table view enable efficient bulk management. Without this, admins must switch to card view for every operation, reducing productivity.

**Independent Test**: Can be fully tested by using add/edit/delete actions within the table view. Admins can add new cards, edit existing ones inline or via modal, and delete cards directly from table rows. Each operation can be tested independently.

**Acceptance Scenarios**:

1. **Given** an admin is in table view, **When** they click "Add Card" in the table, **Then** a form appears (inline row or modal) to create a new card with all classification fields
2. **Given** an admin is viewing a card row in table view, **When** they click "Edit", **Then** the row becomes editable (inline editing) or opens an edit modal with current card data
3. **Given** an admin is editing a card in table view, **When** they save changes, **Then** the card is updated and the table reflects the changes immediately
4. **Given** an admin is viewing a card in table view, **When** they click "Delete", **Then** a confirmation dialog appears, and upon confirmation, the card is removed and the table updates
5. **Given** an admin performs any CRUD operation in table view, **When** the operation completes, **Then** they receive clear success/error feedback and the table updates accordingly

---

### User Story 3 - Admin Manages Instruction Levels (Priority: P2)

As an admin, I want to assign and filter cards by instruction level so that I can organize content by student proficiency levels.

**Why this priority**: Instruction level classification is a new dimension that enables curriculum organization by difficulty. While not critical for MVP, it's essential for sophisticated management.

**Independent Test**: Can be fully tested by assigning instruction levels to cards and filtering by level. Admins can see cards grouped by beginner/intermediate/advanced levels, and filter table/card views to show only specific levels.

**Acceptance Scenarios**:

1. **Given** an admin is creating or editing a card, **When** they select an instruction level (e.g., Beginner, Intermediate, Advanced), **Then** the card is saved with that instruction level
2. **Given** cards have instruction levels assigned, **When** an admin filters by instruction level, **Then** only cards matching that level are displayed
3. **Given** instruction levels are defined in the system, **When** an admin views the table or card view, **Then** each card displays its instruction level clearly
4. **Given** an admin wants to assign an instruction level, **When** they open the classification options, **Then** they see a list of available instruction levels

---

### User Story 4 - Admin Manages Categories (Priority: P2)

As an admin, I want to manage card categories (greetings, family, nature, food, etc.) and add new categories through the admin interface so that I can organize cards by topic without code changes.

**Why this priority**: Category management enables flexible content organization. The ability to add categories through the UI removes dependency on developers for new topics, making the system more maintainable.

**Independent Test**: Can be fully tested by viewing existing categories, creating new ones, assigning categories to cards, and filtering by category. Admins can independently test category creation, assignment, and filtering without other features.

**Acceptance Scenarios**:

1. **Given** an admin is on the Card Management page, **When** they access category management, **Then** they see all existing categories (basic greetings, family, nature, food, etc.)
2. **Given** an admin is viewing categories, **When** they create a new category (e.g., "travel", "animals"), **Then** the category is added to the system and available for assignment to cards
3. **Given** an admin is creating or editing a card, **When** they select one or more categories, **Then** the card is saved with those categories assigned
4. **Given** cards have categories assigned, **When** an admin filters by category, **Then** only cards with that category are displayed
5. **Given** an admin wants to remove a category, **When** they delete it (with confirmation), **Then** the category is removed, but existing cards retain the category (or admins are warned if cards are using it)

---

### User Story 5 - Admin Switches Between Card and Table Views (Priority: P3)

As an admin, I want to switch between card view and table view seamlessly so that I can use the best view for each task.

**Why this priority**: View switching is a convenience feature that enhances flexibility. While not critical for MVP, it improves admin experience when managing cards in different ways.

**Independent Test**: Can be fully tested by toggling between views and verifying that filters, selected cards, and operations persist across view switches.

**Acceptance Scenarios**:

1. **Given** an admin is in card view, **When** they switch to table view, **Then** the same cards are displayed in table format with current filters preserved
2. **Given** an admin is in table view, **When** they switch to card view, **Then** the same cards are displayed in card format with current filters preserved
3. **Given** an admin has applied filters in one view, **When** they switch to the other view, **Then** the same filters remain active
4. **Given** an admin is editing a card in one view, **When** they switch views, **Then** the edit state is preserved or they are prompted to save/cancel

---

### Edge Cases

- What happens when an admin deletes a category that is assigned to existing cards? Should there be a warning or automatic removal?
- How does the system handle bulk operations (selecting multiple cards in table view)?
- What happens when an admin tries to create a duplicate category name?
- How does the system handle very large numbers of cards in table view (pagination, virtualization)?
- What happens when an admin filters by multiple criteria simultaneously (type + category + instruction level)?
- How does instruction level interact with existing card validation? Are there required levels for certain card types?
- What happens if an admin tries to assign an instruction level or category that doesn't exist?
- How does the system handle special characters in category names (Tibetan text, Unicode)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a table/spreadsheet view of cards for admins with sortable columns
- **FR-002**: System MUST allow admins to add new cards from the table view (inline or via modal)
- **FR-003**: System MUST allow admins to edit existing cards from the table view (inline editing or modal)
- **FR-004**: System MUST allow admins to delete cards from the table view with confirmation
- **FR-005**: System MUST support sorting cards by any column in table view (type, front, back, category, instruction level, date created/modified)
- **FR-006**: System MUST support filtering cards by type (number, word, phrase)
- **FR-007**: System MUST support filtering cards by instruction level
- **FR-008**: System MUST support filtering cards by category
- **FR-009**: System MUST support filtering cards by multiple criteria simultaneously (type + category + instruction level)
- **FR-010**: System MUST allow admins to assign instruction level to cards (e.g., Beginner, Intermediate, Advanced, or custom levels)
- **FR-011**: System MUST display instruction level for each card in both card and table views
- **FR-012**: System MUST allow admins to view all existing categories
- **FR-013**: System MUST allow admins to create new categories through the admin interface
- **FR-014**: System MUST allow admins to edit existing category names
- **FR-015**: System MUST allow admins to delete categories (with appropriate warnings if cards use them)
- **FR-016**: System MUST allow admins to assign one or more categories to each card
- **FR-017**: System MUST display assigned categories for each card in both card and table views
- **FR-018**: System MUST allow admins to switch between card view and table view seamlessly
- **FR-019**: System MUST preserve filters when switching between card and table views
- **FR-020**: System MUST display existing card classification data (type) in both views
- **FR-021**: System MUST validate that instruction levels and categories exist before assignment
- **FR-022**: System MUST prevent duplicate category names (case-insensitive)
- **FR-023**: System MUST handle large card sets efficiently in table view (pagination, virtualization, or lazy loading)
- **FR-024**: System MUST provide clear feedback for all CRUD operations (success messages, error messages)
- **FR-025**: System MUST persist all classification data (instruction level, categories) with cards in the database

### Key Entities *(include if feature involves data)*

- **Card**: Represents a flashcard with front/back content. Enhanced with:
  - `instruction_level`: Proficiency level for the card (e.g., Beginner, Intermediate, Advanced, or custom levels)
  - `categories`: Array or relationship to category entities (can have multiple: greetings, family, nature, food, etc.)
  - Existing attributes: `type` (number, word, phrase), `front`, `back_*` fields, `tags`, `subcategory`, `notes`, `image_url`

- **Category**: Represents a topic category for organizing cards. Attributes:
  - `name`: Unique category name (e.g., "basic greetings", "family", "nature", "food")
  - `description`: Optional description of the category
  - `created_at`: When the category was created
  - `created_by`: Admin who created it
  - `card_count`: Number of cards assigned to this category (derived/calculated)

- **Instruction Level**: Represents student proficiency levels. Attributes:
  - `name`: Level name (e.g., "Beginner", "Intermediate", "Advanced")
  - `order`: Numeric order for sorting (e.g., 1=Beginner, 2=Intermediate, 3=Advanced)
  - `description`: Optional description of what this level means
  - `created_at`: When the level was defined
  - `is_default`: Whether this is a system default level (may have predefined defaults)

- **Table View Configuration**: Optional entity for storing user preferences:
  - `visible_columns`: Which columns are visible in table view
  - `sort_column`: Default sort column
  - `sort_direction`: Ascending/descending
  - `page_size`: Number of rows per page

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can view and manage 1000+ cards in table view without performance degradation (table loads in under 2 seconds, scrolling remains smooth)
- **SC-002**: Admins can complete card creation in table view in under 1 minute (from clicking "Add" to saving the card with all classification data)
- **SC-003**: Admins can filter and find specific cards (by type + category + instruction level) in under 10 seconds
- **SC-004**: Admins can create a new category and assign it to 10 cards in under 2 minutes
- **SC-005**: Admins can switch between card and table views without losing current filters or context (100% filter preservation)
- **SC-006**: Admins can sort cards by any column in table view and see results in under 1 second
- **SC-007**: All CRUD operations in table view provide clear feedback within 500ms of action completion
- **SC-008**: Category management allows admins to add new categories without developer intervention (100% self-service capability)
- **SC-009**: Table view displays all essential card information without horizontal scrolling on standard admin screens (1920x1080 or larger)
- **SC-010**: Instruction level assignment increases card organization capability by allowing cards to be filtered by student proficiency (measurable by admins successfully filtering cards by level)
