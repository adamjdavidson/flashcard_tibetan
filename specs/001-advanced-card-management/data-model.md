# Data Model: Advanced Admin Card Management

**Created**: 2025-11-01  
**Feature**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)

## Entities

### Card (Enhanced)

**Description**: Represents a flashcard with front/back content. Enhanced with instruction level and categories.

**Attributes**:
- `id` (TEXT, PRIMARY KEY) - Unique card identifier
- `type` (TEXT, NOT NULL) - Card type: 'number', 'word', 'phrase'
- `front` (TEXT, NOT NULL) - Front content (Tibetan script)
- `back_arabic` (TEXT, NULL) - Arabic numeral (for number cards)
- `back_english` (TEXT, NULL) - English translation (for word/phrase cards)
- `back_tibetan_script` (TEXT, NULL) - Tibetan script (for word/phrase cards)
- `back_tibetan_numeral` (TEXT, NULL) - Tibetan numeral (for number cards)
- `back_tibetan_spelling` (TEXT, NULL) - Romanized spelling (Wylie/phonetic) - optional for all types
- `tags` (TEXT[], DEFAULT '{}') - Legacy tags array (for backward compatibility)
- `subcategory` (TEXT, NULL) - Subcategory (e.g., 'numerals', 'script', 'english_to_tibetan')
- `notes` (TEXT, NULL) - Optional notes
- `image_url` (TEXT, NULL) - Optional image URL
- `instruction_level_id` (UUID, NULL, FK) - **NEW** References instruction_levels.id
- `user_id` (UUID, NULL, FK) - References auth.users.id (existing)
- `is_master` (BOOLEAN, DEFAULT false) - Whether card is in master library (existing)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW()) - Creation timestamp
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW()) - Last update timestamp

**Relationships**:
- Many-to-many with `Category` via `card_categories` junction table
- Many-to-one with `InstructionLevel` via `instruction_level_id`

**Validation Rules**:
- `type` MUST be one of: 'number', 'word', 'phrase'
- For number cards: `back_arabic` required, either `back_tibetan_script` or `back_tibetan_numeral` required
- For word/phrase cards: `back_english` and `back_tibetan_script` required
- `back_tibetan_spelling` is optional for all card types
- `instruction_level_id` can be NULL (cards can exist without instruction level)
- `instruction_level_id` MUST reference existing instruction_levels.id if set

**State Transitions**:
- None - card is a simple entity with CRUD operations

---

### Category

**Description**: Represents a topic category for organizing cards (e.g., greetings, family, nature, food).

**Attributes**:
- `id` (UUID, PRIMARY KEY, DEFAULT uuid_generate_v4()) - Unique category identifier
- `name` (TEXT, NOT NULL, UNIQUE) - Category name (case-insensitive uniqueness enforced)
- `description` (TEXT, NULL) - Optional description of the category
- `created_by` (UUID, NULL, FK) - Admin who created it (references auth.users.id)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW()) - Creation timestamp
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW()) - Last update timestamp

**Relationships**:
- Many-to-many with `Card` via `card_categories` junction table

**Validation Rules**:
- `name` MUST be unique (case-insensitive)
- `name` MUST NOT be empty
- `name` supports Unicode (Tibetan text, special characters)

**State Transitions**:
- None - category is a simple entity with CRUD operations

---

### Instruction Level

**Description**: Represents student proficiency levels (e.g., Beginner, Intermediate, Advanced).

**Attributes**:
- `id` (UUID, PRIMARY KEY, DEFAULT uuid_generate_v4()) - Unique level identifier
- `name` (TEXT, NOT NULL, UNIQUE) - Level name (e.g., "Beginner", "Intermediate", "Advanced")
- `order` (INTEGER, NOT NULL) - Numeric order for sorting (e.g., 1=Beginner, 2=Intermediate, 3=Advanced)
- `description` (TEXT, NULL) - Optional description of what this level means
- `is_default` (BOOLEAN, DEFAULT false) - Whether this is a system default level
- `created_at` (TIMESTAMPTZ, DEFAULT NOW()) - Creation timestamp

**Relationships**:
- One-to-many with `Card` via `instruction_level_id`

**Validation Rules**:
- `name` MUST be unique
- `name` MUST NOT be empty
- `order` MUST be positive integer
- `order` SHOULD be unique (enforced by application logic, not database constraint for flexibility)

**Default Values**:
- Seed with "Beginner" (order: 1), "Intermediate" (order: 2), "Advanced" (order: 3) with `is_default: true`

**State Transitions**:
- None - instruction level is a simple entity with CRUD operations

---

### Card Categories (Junction Table)

**Description**: Many-to-many relationship between cards and categories.

**Attributes**:
- `card_id` (TEXT, FK) - References cards.id ON DELETE CASCADE
- `category_id` (UUID, FK) - References categories.id ON DELETE CASCADE
- PRIMARY KEY (`card_id`, `category_id`)

**Relationships**:
- Many-to-one with `Card`
- Many-to-one with `Category`

**Validation Rules**:
- Composite primary key ensures one card cannot have duplicate categories
- Cascade delete: deleting card removes associations, deleting category removes associations

---

### Table View Configuration (Optional)

**Description**: Stores admin user preferences for table view display.

**Attributes**:
- `user_id` (UUID, PRIMARY KEY, FK) - References auth.users.id ON DELETE CASCADE
- `visible_columns` (TEXT[], DEFAULT '{}') - Array of column names to display
- `sort_column` (TEXT, NULL) - Default sort column name
- `sort_direction` (TEXT, NULL) - 'asc' or 'desc'
- `page_size` (INTEGER, DEFAULT 50) - Number of rows per page
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW()) - Last update timestamp

**Relationships**:
- One-to-one with `auth.users` via `user_id`

**Validation Rules**:
- `sort_direction` MUST be 'asc' or 'desc' if `sort_column` is set
- `page_size` MUST be positive integer (10-200 recommended)

**Note**: This entity is optional for MVP but can be added later for user preference storage.

---

## Database Schema Changes

### New Tables

1. **categories** - Topic categories for organizing cards
2. **instruction_levels** - Student proficiency levels
3. **card_categories** - Junction table for card-category many-to-many relationship
4. **table_view_config** (optional) - User preferences for table view

### Modified Tables

1. **cards** - Add `instruction_level_id` column (UUID, NULL, FK to instruction_levels)

### Indexes

**New Indexes**:
- `idx_categories_name` - For quick category lookups (name is unique, so index exists)
- `idx_instruction_levels_order` - For sorting levels by order
- `idx_card_categories_card_id` - For finding categories for a card
- `idx_card_categories_category_id` - For finding cards in a category
- `idx_cards_instruction_level_id` - For filtering cards by instruction level

### Row Level Security (RLS)

**Categories**:
- Everyone can read categories (for card display)
- Only admins can insert/update/delete categories

**Instruction Levels**:
- Everyone can read instruction levels (for card display)
- Only admins can insert/update/delete instruction levels

**Card Categories (Junction)**:
- RLS inherited from cards and categories policies
- Admins can manage all associations
- Regular users cannot modify associations (cards are read-only for non-owners)

---

## Data Migration Strategy

### Existing Cards

1. **Instruction Level**: Existing cards will have `instruction_level_id = NULL` (acceptable per schema)
2. **Categories**: Existing cards will have no category associations initially
   - Admins can assign categories to existing cards through UI
   - No automatic migration needed (adopt-as-you-go approach)

### Default Instruction Levels

Migration seeds default levels:
- "Beginner" (order: 1, is_default: true)
- "Intermediate" (order: 2, is_default: true)
- "Advanced" (order: 3, is_default: true)

### Default Categories

No default categories - admins create categories as needed through UI.

---

## API Data Flow

### Reading Cards with Classification

1. Query `cards` table (RLS filters automatically)
2. Join with `instruction_levels` to get level name
3. Join with `card_categories` and `categories` to get category names
4. Transform to app format with `instruction_level` object and `categories` array

### Creating Card with Classification

1. Validate `instruction_level_id` exists (if provided)
2. Insert card into `cards` table
3. Insert associations into `card_categories` for each selected category
4. Return complete card with classification data

### Updating Card Classification

1. Update `instruction_level_id` in `cards` table
2. Replace associations in `card_categories` (delete old, insert new)
3. Return updated card with classification data

### Category Management

1. CRUD operations on `categories` table
2. Before delete: Query `card_categories` for count of associated cards
3. Show warning if cards use category
4. On confirmation: Delete category (junction entries remain but category lookup fails)

