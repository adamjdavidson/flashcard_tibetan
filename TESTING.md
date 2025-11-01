# Testing Guide

This document describes the comprehensive testing suite for the Tibetan Flashcards application.

## Test Structure

Tests are organized by feature area:

- **Unit Tests**: Test individual functions and utilities
  - `src/utils/__tests__/` - Utility function tests
  - `src/data/__tests__/` - Schema and validation tests
  - `src/services/__tests__/` - Service layer tests

- **Component Tests**: Test React components in isolation
  - `src/components/__tests__/` - React component tests
  - Uses React Testing Library for component testing

- **Integration Tests**: Test component interactions
  - `src/integration/__tests__/` - Integration tests for user flows

- **E2E Tests**: Test complete user flows
  - `src/integration/e2e/` - End-to-end tests with Playwright
  - Manual test checklist: `TEST_CHECKLIST.md`
  - API tests: `test-user-cards.js`, `test-gemini-api.js`

- **Performance Tests**: Test performance metrics
  - `src/utils/__tests__/performance.test.js` - Performance benchmarks

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests Once (CI mode)
```bash
npm run test:run
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with UI
```bash
npm run test:ui
```

### Generate Coverage Report
```bash
npm run test:coverage
```

### Run Specific Test Categories
```bash
npm run test:components      # Component tests only
npm run test:integration     # Integration tests only
npm run test:performance     # Performance tests only
npm run test:e2e            # E2E tests with Playwright
npm run test:all            # All tests (unit + e2e)
```

### Run Specific Test File
```bash
npm test src/utils/__tests__/cardUtils.test.js
```

## Test Coverage

### Utility Functions (`src/utils/__tests__/`)

#### `cardUtils.test.js`
- ✅ `getDueCards` - Filtering cards due for review
- ✅ `selectRandomCard` - Random card selection
- ✅ `getNextCard` - Smart card selection (prefers due cards)
- ✅ `filterCardsByType` - Filter by card type
- ✅ `filterCardsByCategory` - Filter by category
- ✅ `filterCardsByTags` - Filter by tags
- ✅ `getCardTypes` - Extract unique card types
- ✅ `getCardCategories` - Extract unique categories
- ✅ `calculateStats` - Statistics calculation

#### `sm2Algorithm.test.js`
- ✅ `initializeCardProgress` - Initialize new card progress
- ✅ `isInLearningPhase` - Check learning phase status
- ✅ `isCardDue` - Check if card is due for review
- ✅ `getQualityFromButton` - Map button to quality level
- ✅ `calculateReview` - SM-2 algorithm calculation
  - Learning phase behavior (Forgot, Partial, Hard, Easy)
  - Exponential phase behavior
  - Late review bonuses
  - Lapse handling

#### `storage.test.js`
- ✅ `loadCards` - Load cards from localStorage
- ✅ `saveCards` - Save cards to localStorage
- ✅ `loadProgress` - Load progress from localStorage
- ✅ `saveProgress` - Save progress to localStorage
- ✅ `updateCardProgress` - Update single card progress
- ✅ `getCardProgress` - Get single card progress
- ✅ `migrateCardTags` - Migrate card tags
- ✅ `mergeSeedData` - Merge seed data with existing cards
- ✅ `exportData` - Export all data
- ✅ `importData` - Import data

#### `translation.test.js`
- ✅ `translateText` - Translation API calls
- ✅ Cache validation and usage
- ✅ Error handling (API errors, network errors)
- ✅ Custom language code support
- ✅ `clearTranslationCache` - Cache clearing

#### `images.test.js`
- ✅ `generateAIImage` - AI image generation
- ✅ `searchImage` - Unsplash image search
- ✅ `uploadImage` - Image upload
- ✅ `validateImageFile` - File validation

#### `performance.test.js`
- ✅ Large card set operations (< 100ms)
- ✅ Filtering performance (< 50ms)
- ✅ Statistics calculation performance (< 50ms)
- ✅ SM-2 algorithm batch processing (< 1ms per calculation)
- ✅ Memory efficiency checks

### Schema Tests (`src/data/__tests__/`)

#### `cardSchema.test.js`
- ✅ `createCard` - Card creation with defaults
- ✅ `validateCard` - Card validation
  - Word cards validation
  - Number cards validation
  - Required field checks
  - Type validation

### Service Tests (`src/services/__tests__/`)

#### `cardsService.test.js`
- ✅ `loadCards` - Load cards from Supabase
- ✅ Fallback to localStorage
- ✅ Ownership filtering (non-admin users)
- ✅ `saveCard` - Save card to Supabase
- ✅ `deleteCard` - Delete card from Supabase

#### `progressService.test.js`
- ✅ `loadProgress` - Load progress from Supabase
- ✅ Fallback to localStorage
- ✅ `saveCardProgress` - Save progress to Supabase

### Component Tests (`src/components/__tests__/`)

#### `Flashcard.test.jsx`
- ✅ Renders flashcard with front content
- ✅ Flips card on click
- ✅ Displays back content after flip
- ✅ Resets flip state when card changes
- ✅ Handles number cards correctly
- ✅ Calls onFlip callback

#### `CardButtons.test.jsx`
- ✅ Renders all quality buttons
- ✅ Calls onRate with correct button type
- ✅ Handles disabled state
- ✅ All button types work correctly

#### `ProgressStats.test.jsx`
- ✅ Displays statistics correctly
- ✅ Shows all stat labels
- ✅ Handles zero values
- ✅ Handles missing/partial stats

#### `AddCardForm.test.jsx`
- ✅ Renders form fields
- ✅ Allows user input
- ✅ Calls onAdd with card data on submit
- ✅ Calls onCancel when cancelled
- ✅ Shows error for invalid card

#### `CardFilter.test.jsx`
- ✅ Renders filter checkboxes
- ✅ Calls onTagToggle when tag is selected
- ✅ Displays selected tags
- ✅ Handles "All cards" selection

### Integration Tests (`src/integration/__tests__/`)

#### `userFlows.test.js`
- ✅ Complete card creation and study flow
- ✅ Multiple cards study session
- ✅ Card filtering and selection flow
- ✅ Progress tracking through learning phase
- ✅ Forgot → relearn flow

### E2E Tests (`src/integration/e2e/`)

#### `studyFlow.spec.js`
- ✅ User can study a flashcard
- ✅ User can rate a card

#### `cardManagement.spec.js`
- ✅ User can navigate to card management
- ✅ User can filter cards

## CI/CD Integration

### GitHub Actions

The project includes a GitHub Actions workflow (`.github/workflows/test.yml`) that:

- Runs tests on push and pull requests
- Runs linter
- Runs unit tests
- Generates coverage reports
- Uploads coverage to Codecov
- Runs E2E tests with Playwright
- Builds the project to verify it compiles

### Workflow Steps

1. **Checkout code**
2. **Setup Node.js** (version 20.x)
3. **Install dependencies** (`npm ci`)
4. **Run linter** (`npm run lint`)
5. **Run unit tests** (`npm run test:run`)
6. **Generate coverage** (`npm run test:coverage`)
7. **Upload coverage** to Codecov
8. **Run E2E tests** (`npx playwright test`)
9. **Upload Playwright report** as artifact
10. **Build project** to verify compilation

## Test Best Practices

### Writing Tests

1. **Descriptive Names**: Use clear, descriptive test names
   ```javascript
   it('returns error when text is empty', async () => {
     // test code
   });
   ```

2. **Arrange-Act-Assert**: Structure tests clearly
   ```javascript
   it('validates a valid word card', () => {
     // Arrange
     const card = { type: 'word', front: 'test', backEnglish: 'test' };
     
     // Act
     const result = validateCard(card);
     
     // Assert
     expect(result).toBe(true);
   });
   ```

3. **Mock External Dependencies**: Mock Supabase, fetch, localStorage
   ```javascript
   vi.mock('../supabase.js', () => ({
     supabase: { from: vi.fn() },
     isSupabaseConfigured: vi.fn(() => true)
   }));
   ```

4. **Test Edge Cases**: Test error conditions, empty inputs, null values
   ```javascript
   it('handles empty array gracefully', () => {
     expect(getDueCards([], {})).toEqual([]);
   });
   ```

5. **Clean Up**: Use `beforeEach` and `afterEach` to reset state
   ```javascript
   beforeEach(() => {
     vi.clearAllMocks();
   });
   ```

6. **Component Testing**: Use React Testing Library best practices
   ```javascript
   // ✅ Good: Test user interactions
   await user.click(screen.getByRole('button'));
   
   // ❌ Bad: Test implementation details
   expect(component.state.isLoading).toBe(true);
   ```

### Test Organization

- One test file per source file
- Group related tests with `describe` blocks
- Keep tests focused and isolated
- Use meaningful assertions

## Performance Testing

Performance tests verify that critical operations complete within acceptable time limits:

- **Card Operations**: < 100ms for 1000 cards
- **Filtering**: < 50ms for 1000 cards
- **Statistics**: < 50ms for 500 cards
- **SM-2 Calculations**: < 1ms per calculation
- **Random Selection**: < 1ms average for large sets

Run performance tests:
```bash
npm run test:performance
```

## Continuous Testing

### Pre-commit Testing

Add a pre-commit hook to run tests:

```bash
# Install husky (if not already installed)
npm install --save-dev husky

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run test:run"
```

### CI/CD Integration

The GitHub Actions workflow automatically runs all tests on push and pull requests. See `.github/workflows/test.yml` for details.

## Manual Testing

For features that require user interaction or complex integration, see `TEST_CHECKLIST.md` for manual testing procedures.

## Troubleshooting

### Tests Failing After Code Changes

1. **Check Mock Updates**: Update mocks if interfaces changed
2. **Update Assertions**: Update expected values if behavior changed
3. **Clear Cache**: Clear test cache: `npm test -- --no-cache`

### Coverage Issues

1. **Check Exclusions**: Review `vitest.config.js` coverage exclusions
2. **Add Missing Tests**: Add tests for uncovered code paths
3. **Review Coverage Report**: Run `npm run test:coverage` and open `coverage/index.html`

### Mock Issues

1. **Verify Mock Setup**: Ensure mocks are set up correctly
2. **Check Import Order**: Mocks must be imported before source code
3. **Reset Mocks**: Use `vi.clearAllMocks()` in `beforeEach`
4. **Avoid Reassignment**: Use `.mockReturnValueOnce()` instead of reassigning mock functions

### E2E Test Issues

1. **Install Browsers**: Run `npx playwright install`
2. **Check Dev Server**: Ensure dev server is running or use `webServer` config
3. **Check Selectors**: Use stable selectors that don't change frequently
4. **Add Timeouts**: Use appropriate timeouts for async operations

## Next Steps

- [ ] Add more component tests for complex components (AdminPage, CardManager)
- [ ] Add E2E tests for admin workflows
- [ ] Add visual regression tests
- [ ] Set up automated performance monitoring
- [ ] Add accessibility tests

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
