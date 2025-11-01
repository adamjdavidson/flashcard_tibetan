# Quickstart: Advanced Admin Card Management

**Created**: 2025-11-01  
**Feature**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)

## Overview

This quickstart guide helps admins understand and use the advanced card management features.

## Prerequisites

- Admin access to the application
- Understanding of existing card management basics

## Getting Started

### Access Advanced Card Management

1. Log in as admin
2. Navigate to **Admin** → **Advanced Card Management** tab
3. You'll see the card management interface with view toggle (Card View / Table View)

---

## Core Features

### 1. Table View

**What it does**: Displays all cards in a table/spreadsheet format for efficient management.

**How to use**:
- Click **"Table View"** button to switch from card view
- Cards are displayed in rows with columns: Type, Front, Back Content, Categories, Instruction Level, Created Date, Actions
- Click column headers to sort (ascending/descending toggle)
- Scroll through table to view all cards

**Key Benefits**:
- Quick scanning of large card libraries
- Sortable columns for organization
- Efficient bulk management

---

### 2. CRUD Operations in Table View

**Add Card**:
1. Click **"Add Card"** button in table view
2. Fill out the form (type, front, back content, instruction level, categories)
3. Click **"Save"**
4. Card appears in table immediately

**Edit Card**:
1. Click **"Edit"** button on a card row
2. Modal opens with current card data
3. Modify fields as needed
4. Click **"Save"**
5. Table updates with changes

**Delete Card**:
1. Click **"Delete"** button on a card row
2. Confirmation dialog appears
3. Confirm deletion
4. Card is removed from table

---

### 3. Instruction Levels

**What it is**: Classification system for organizing cards by student proficiency (Beginner, Intermediate, Advanced).

**Default Levels**: System comes with three default levels:
- **Beginner** (Order: 1)
- **Intermediate** (Order: 2)
- **Advanced** (Order: 3)

**Assigning Levels to Cards**:
1. Create or edit a card
2. Select **Instruction Level** from dropdown
3. Save card
4. Card now has instruction level assigned

**Filtering by Instruction Level**:
1. Use **Instruction Level** filter dropdown
2. Select desired level (e.g., "Beginner")
3. Table shows only cards with that level

**Managing Levels** (Admins):
- **View Levels**: Navigate to category/level management section
- **Create Level**: Click "Add Instruction Level", provide name, order, description
- **Edit Level**: Click "Edit" on a level, modify name/order/description
- **Delete Level**: Click "Delete", confirm (warning shown if cards use it)

---

### 4. Categories

**What it is**: Topic categories for organizing cards (e.g., greetings, family, nature, food).

**Existing Categories**: System may have categories like:
- Basic greetings
- Family
- Nature
- Food

**Assigning Categories to Cards**:
1. Create or edit a card
2. Select one or more **Categories** from multi-select dropdown
3. Save card
4. Card now has categories assigned

**Filtering by Category**:
1. Use **Category** filter dropdown
2. Select desired category (e.g., "Family")
3. Table shows only cards with that category

**Managing Categories** (Admins):
- **View Categories**: Navigate to category management section
- **Create Category**: Click "Add Category", provide name and optional description
- **Edit Category**: Click "Edit" on a category, modify name/description
- **Delete Category**: Click "Delete", confirm (warning shown if cards use it)

**Important**: When deleting a category that's assigned to cards, you'll see a warning showing how many cards use it. Cards will retain the association but category lookup will fail until cards are reassigned.

---

### 5. View Switching

**What it does**: Seamlessly switch between card view and table view while preserving filters.

**How to use**:
1. Apply filters in current view (type, category, instruction level)
2. Click **"Table View"** or **"Card View"** toggle
3. Same cards displayed in new view format
4. All filters remain active

**Key Benefits**:
- Use best view for each task
- No data loss when switching views
- Flexible workflow

---

## Advanced Features

### Multi-Criteria Filtering

**What it does**: Filter cards by multiple criteria simultaneously (type + category + instruction level).

**How to use**:
1. Set **Type** filter (e.g., "word")
2. Set **Category** filter (e.g., "Family")
3. Set **Instruction Level** filter (e.g., "Beginner")
4. Table shows only cards matching ALL criteria

**Example**: Show all "word" cards in "Family" category at "Beginner" level.

---

### Sorting

**What it does**: Sort cards by any column in table view.

**How to use**:
1. Click a column header to sort ascending
2. Click again to sort descending
3. Click third time to clear sort (return to default)

**Sortable Columns**:
- Type (alphabetical)
- Front (alphabetical)
- Back Content (alphabetical)
- Categories (by first category name)
- Instruction Level (by order: Beginner < Intermediate < Advanced)
- Created Date (chronological)
- Updated Date (chronological)

---

## Workflows

### Workflow 1: Organizing Existing Cards

1. **Access Table View**: Admin → Advanced Card Management → Table View
2. **Assign Instruction Levels**: Edit each card, select appropriate level
3. **Assign Categories**: Edit each card, select relevant categories
4. **Filter & Review**: Use filters to review organization (e.g., all Beginner cards in Family category)

---

### Workflow 2: Creating New Cards with Classification

1. **Access Table View**: Admin → Advanced Card Management → Table View
2. **Click "Add Card"**: Opens card creation form
3. **Fill Card Content**: Type, front, back content (as before)
4. **Assign Classification**:
   - Select **Instruction Level** (e.g., "Intermediate")
   - Select **Categories** (e.g., "Food", "Greetings")
5. **Save Card**: Card appears in table with classification data

---

### Workflow 3: Managing Categories

1. **Access Category Management**: Admin → Advanced Card Management → Category Management
2. **View Existing Categories**: See all categories with card counts
3. **Create New Category**: Click "Add Category", enter name (e.g., "Travel")
4. **Assign to Cards**: Edit cards, select new category from multi-select
5. **Filter by Category**: Use category filter to see all cards in "Travel" category

---

### Workflow 4: Bulk Card Review

1. **Access Table View**: Admin → Advanced Card Management → Table View
2. **Filter Cards**: Apply filters to focus on specific subset (e.g., "Beginner" level, "Family" category)
3. **Review Cards**: Scan through table to review card content
4. **Edit in Bulk**: Edit multiple cards one by one, updating classification or content
5. **Sort for Organization**: Sort by instruction level or category to see organization patterns

---

## Tips & Best Practices

1. **Start with Defaults**: Use default instruction levels (Beginner, Intermediate, Advanced) before creating custom levels
2. **Create Categories as Needed**: Don't pre-create all categories - create them as you encounter topics
3. **Use Multi-Category**: Assign multiple categories to cards for flexible organization (e.g., "Greetings" + "Formal")
4. **Filter Before Sorting**: Apply filters first, then sort the filtered subset for best results
5. **Table View for Large Sets**: Use table view when managing 50+ cards, card view for smaller sets
6. **Preserve Filters**: Switch views frequently but remember filters are preserved - clear filters when needed

---

## Troubleshooting

**Q: I can't see the Advanced Card Management tab**
- **A**: Ensure you're logged in as admin. Regular users cannot access admin features.

**Q: Categories or instruction levels don't appear in dropdowns**
- **A**: Categories and instruction levels must be created before they can be assigned. Navigate to category/level management and create them first.

**Q: I deleted a category but cards still show it**
- **A**: Category deletion removes the category but cards retain associations. Edit cards to reassign them to new categories.

**Q: Table view is slow with many cards**
- **A**: Use pagination (50-100 rows per page) or apply filters to reduce the number of cards displayed.

**Q: I can't sort by a column**
- **A**: Ensure the column is sortable. Some columns (like Actions) are not sortable.

---

## Next Steps

After mastering the basics:
- Explore bulk operations (future enhancement)
- Customize instruction levels for your curriculum
- Organize cards into comprehensive category structure
- Use filters and sorting for curriculum planning

