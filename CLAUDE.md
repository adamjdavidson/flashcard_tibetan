# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Tibetan language learning flashcard application with spaced repetition (SM-2 algorithm). React 19 + Vite frontend with Supabase backend, supporting offline-first operation with cloud sync.

## Common Commands

### Development
```bash
npm run dev                    # Start Vite dev server (port 5173)
npm run dev:vercel             # Start Vercel dev server (includes serverless API)
npm run build                  # Build for production
npm run lint                   # Run ESLint
npm run preview                # Preview production build
```

### Testing
```bash
npm run test                   # Vitest watch mode (unit tests)
npm run test:run              # Run all unit tests once
npm run test:coverage         # Generate coverage report
npm run test:components       # Component tests only
npm run test:integration      # Integration tests only

npm run test:e2e              # Playwright E2E tests
npm run test:e2e:ui           # Playwright UI mode
npm run test:e2e:admin        # Admin workflow E2E tests

npm run test:all              # Run both unit and E2E tests
```

### Running Single Tests
```bash
# Vitest (unit tests)
npx vitest src/components/__tests__/Flashcard.test.jsx

# Playwright (E2E tests)
npx playwright test tests/e2e/study.spec.js
npx playwright test --grep "flip and rate"  # Run specific test by name
```

### Database Setup
```bash
npm run setup:supabase        # Initialize Supabase tables and RLS policies
npm run setup:storage         # Configure storage bucket policies
```

## Architecture

### Data Flow Pattern: Offline-First with Cloud Sync

The app uses a **fallback architecture** where every operation tries Supabase first, then falls back to localStorage:

```
User Action → Service Layer → Try Supabase → Success ✓
                            ↓ Failure
                            → Fallback (localStorage) → Success ✓
```

**Key Files:**
- `src/services/cardsService.js` - Card CRUD with fallback pattern
- `src/services/progressService.js` - Progress tracking with fallback
- `src/utils/storage.js` - localStorage abstraction

### State Management

All state lives in `App.jsx` using React hooks (no Redux/Zustand):

```javascript
// Primary state
const [cards, setCards] = useState([]);              // All cards (master + user)
const [progressMap, setProgressMap] = useState({});  // cardId → progress tracking
const [currentCard, setCurrentCard] = useState(null);// Card being studied
const [user, setUser] = useState(null);              // Auth user object
```

**Data initialization flow (App.jsx lines 102-171):**
1. Load from localStorage (immediate)
2. If user logged in → override with Supabase data
3. Subscribe to real-time Postgres changes
4. Merge with seed data (built-in cards)

### Authentication & Authorization

**Auth Hook:** `src/hooks/useAuth.js`
- Returns: `{ user, isAdmin, loading, error }`
- Listens to Supabase auth state changes
- Checks `user_roles` table for admin status

**User Roles:**
- **Unauthenticated**: Study seed cards, create local cards (localStorage only)
- **User**: Create/edit own cards, cloud sync, progress tracking
- **Admin**: All user permissions + manage master cards, user management, system stats

**Master Cards vs User Cards:**
- `isMaster: true, userId: null` → Master cards (visible to everyone)
- `isMaster: false, userId: <uuid>` → User cards (visible only to owner)

**RLS Enforcement (Supabase):**
```sql
-- Users see master cards + own cards
WHERE is_master = true OR user_id = auth.uid()
```

### Component Architecture

**App.jsx (Root Component):**
- ~7000+ lines - main orchestrator
- Handles all state management
- Implements keyboard shortcuts (Space = flip, 1-4 = rate)
- Controls view routing: study/manage/admin/settings

**Key Components:**
- `Flashcard.jsx` - Card display with flip animation
- `CardButtons.jsx` - Rating UI (Forgot/Partial/Hard/Easy → quality 0/1/3/5)
- `CardManager.jsx` - Card CRUD interface
- `AdminPage.jsx` - Admin dashboard (tabs: stats, users, cards, themes)
- `ProgressStats.jsx` - Study statistics display

**Component Communication:**
- Props down, callbacks up (standard React)
- No context providers (except ThemeContext for styling)

### Services Layer

All service files in `src/services/` follow this pattern:

```javascript
export async function someOperation(params, fallbackFn) {
  if (!isSupabaseConfigured()) {
    return fallbackFn ? fallbackFn() : defaultValue;
  }

  try {
    const result = await supabase.from('table').operation();
    if (result.error) return fallbackFn ? fallbackFn() : defaultValue;
    return transformFromDB(result.data);
  } catch (error) {
    return fallbackFn ? fallbackFn() : defaultValue;
  }
}
```

**Key Services:**
- `cardsService.js` - Card CRUD, real-time subscriptions, DB ↔ App transformations
- `progressService.js` - Progress CRUD, SM-2 integration
- `categoriesService.js` - Card classification
- `imagesService.js` - Image upload to Supabase storage

**Data Transformation:**
- Database uses `snake_case` (Postgres convention)
- App uses `camelCase` (JavaScript convention)
- Transform functions: `transformCardFromDB()`, `transformCardToDB()`

### Spaced Repetition Algorithm

**Implementation:** `src/utils/sm2Algorithm.js`

**SM-2 Algorithm Parameters:**
- `interval` - Days until next review
- `easeFactor` - Difficulty multiplier (1.3 - ∞, starts at 2.5)
- `repetitions` - Successful reviews in a row
- `quality` - Rating: 0 (forgot), 1 (partial), 3 (hard), 5 (easy)

**Learning Phase:**
- New cards: 1min → 10min → 1day (stepped intervals)
- After graduating: SM-2 exponential spacing
- Quality < 3 (forgot/partial): Reset to learning phase

**Next Card Selection (`src/utils/cardUtils.js`):**
1. Filter cards by selected tags
2. Get cards where `nextReviewDate <= now()`
3. Sort by due date (oldest first)
4. Random selection from top 5 most overdue

### Database Schema (Supabase)

**Main Tables:**
- `cards` - Flashcard content (type, front, back variations, tags[], isMaster, userId)
- `card_progress` - User progress tracking (interval, easeFactor, nextReviewDate)
- `card_categories` - Many-to-many join (card ↔ category)
- `categories` - Classification tags
- `instruction_levels` - Difficulty levels
- `user_roles` - Role assignments (user_id → role)
- `themes` - Custom color schemes

**RLS Policies:**
- Cards: Users see master + own; admins see all
- Progress: Users see only own progress
- Categories: Public read, admin write
- User roles: Users see own, admins see all

**Real-Time Sync:**
Postgres Change Feed subscriptions in service files:
```javascript
supabase
  .channel('cards-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'cards' }, callback)
  .subscribe();
```

### API Routes (Vercel Serverless)

Located in `api/` directory:
- `POST /api/translate` - Google Translate integration
- `POST /api/generate-image` - DALL-E/Gemini image generation
- `POST /api/upload-image` - Upload to Supabase storage
- `POST /api/admin/users` - User CRUD (admin only)
- `GET /api/admin/stats` - System statistics

**Authentication:** Service role key for admin endpoints (server-side only)

## Testing Strategy

### Unit Tests (Vitest)

**Setup:** `src/test/setup.js`
- Environment: jsdom (browser-like DOM)
- Testing Library: @testing-library/react
- Mocks: Supabase client, localStorage

**Test Locations:**
```
src/components/__tests__/     # Component tests
src/services/__tests__/        # Service layer tests
src/utils/__tests__/           # Utility tests (SM-2, cardUtils)
src/integration/__tests__/     # Integration tests (multi-component flows)
```

**Example Test Pattern:**
```javascript
import { render, screen } from '@testing-library/react';
import { expect, describe, it } from 'vitest';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component prop="value" />);
    expect(screen.getByText('expected')).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright)

**Config:** `playwright.config.js`
- Browsers: Chromium, Firefox (WebKit optional via WEBKIT=1)
- Base URL: http://localhost:5173
- Auth: Setup project creates `playwright/.auth/admin.json`

**Test Files:** `tests/e2e/*.spec.js`
- `study.spec.js` - Card flip and rating flow
- `admin.spec.js` - Admin dashboard operations
- `navigation.spec.js` - Route navigation
- `accessibility.spec.js` - WCAG compliance

**Running E2E in CI:**
Set environment variables for Supabase credentials + test user accounts.

## Environment Variables

Copy `.env.example` to `.env.local`:

**Required (if using Supabase):**
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # Server-side only
```

**Optional (for API features):**
```
TRANSLATION_API_KEY=...
IMAGE_GENERATION_API_KEY=...
UNSPLASH_ACCESS_KEY=...
```

**Note:** App works without environment variables (localStorage mode).

## Key Architectural Patterns

### 1. Fallback/Graceful Degradation
Every Supabase operation has a fallback to localStorage. The app never "breaks" - it just loses sync capability.

### 2. Optimistic Updates
UI updates immediately, then saves to backend asynchronously:
```javascript
setCards([...cards, newCard]);  // Update UI
saveCard(newCard, fallbackSave); // Save async (non-blocking)
```

### 3. Real-Time Sync
Postgres Change Feed allows multi-device sync. Edit on phone → desktop updates instantly.

### 4. Component Controlled/Uncontrolled Pattern
Components like `Flashcard.jsx` support both:
```javascript
const isFlipped = externalIsFlipped !== undefined
  ? externalIsFlipped    // Controlled (parent manages state)
  : internalIsFlipped;   // Uncontrolled (internal state)
```

### 5. Service + Transformation Layer
Database schema differs from app schema:
- DB: `back_tibetan_script`, `user_id`, `is_master`
- App: `backTibetanScript`, `userId`, `isMaster`

Transformation happens in service layer, never in components.

## Development Workflow

### Adding a New Feature

1. **Update Database Schema** (if needed):
   ```bash
   # Edit setup-supabase-complete.sh or create migration
   # Run: npm run setup:supabase
   ```

2. **Create/Update Service** (`src/services/`):
   - Add CRUD functions with fallback pattern
   - Add transformation functions (DB ↔ App)
   - Add real-time subscription if needed

3. **Update Components**:
   - Follow existing patterns (props down, callbacks up)
   - Use existing state in App.jsx (don't add new state unless necessary)

4. **Write Tests**:
   - Unit tests: Component behavior, service logic
   - Integration tests: Multi-component flows
   - E2E tests: Critical user paths

5. **Update Types** (if applicable):
   - Card schema: `src/data/cardSchema.js`
   - Validation functions: `src/utils/cardUtils.js`

### Working with Cards

**Card Type System:**
- `type: 'number'` - Numeric cards (0-30)
- `type: 'word'` - Vocabulary cards
- `type: 'phrase'` - Multi-word expressions

**Card Backs (conditionally used based on type):**
- `backArabic` - Number representation (e.g., "5")
- `backEnglish` - English translation
- `backTibetanScript` - Tibetan text (ང་)
- `backTibetanNumeral` - Tibetan numeral (༥)
- `backTibetanSpelling` - Phonetic spelling

**Validation:** `src/data/cardSchema.js` - `validateCard()`

### Working with Progress

**Never modify `progressMap` directly**. Always use:
```javascript
import { calculateReview } from './utils/sm2Algorithm.js';

const updatedProgress = calculateReview(currentProgress, quality);
setProgressMap({ ...progressMap, [cardId]: updatedProgress });
```

**Quality Ratings:**
- `0` - Forgot (reset to learning)
- `1` - Partial recall (minimal advancement)
- `3` - Hard recall (normal advancement)
- `5` - Easy recall (accelerated advancement)

## Code Style Notes

**From `.cursor/rules/specify-rules.mdc`:**
- JavaScript ES6+, React 19.1.1, Node.js 20.x
- Follow standard React conventions
- Test before committing: `npm test && npm run lint`

**General Patterns:**
- Prefer functional components (no class components)
- Use hooks for state/effects
- Keep components focused (single responsibility)
- Extract reusable logic to utils/

## Deployment

**Recommended Platform:** Vercel (see DEPLOYMENT.md for alternatives)

**Vercel Setup:**
1. Connect GitHub repo
2. Set environment variables (Supabase keys)
3. Auto-deploy on push to main

**Build Settings:**
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

**API Routes:** Serverless functions in `api/` auto-deploy with Vercel

## Troubleshooting

### "Supabase not configured" warning
- Check `.env.local` exists with valid `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server after adding env vars

### E2E tests failing
- Ensure `playwright/.auth/admin.json` exists (run setup project first)
- Check test user credentials in environment variables
- Verify dev server is running on port 5173

### RLS policy errors
- Verify user has correct role in `user_roles` table
- Check `setup-supabase-complete.sh` was run successfully
- Review Supabase logs for policy violations

### Cards not syncing
- Check browser console for Supabase errors
- Verify real-time subscriptions are active (check Network tab for WebSocket)
- Test with `npm run test:integration` to verify service layer

## Important Files Reference

**Core Logic:**
- `src/App.jsx` - Main application orchestrator (7000+ lines)
- `src/utils/sm2Algorithm.js` - Spaced repetition implementation
- `src/utils/cardUtils.js` - Card selection/filtering logic

**Services:**
- `src/services/supabase.js` - Singleton client
- `src/services/cardsService.js` - Card CRUD
- `src/services/progressService.js` - Progress tracking

**Database:**
- `setup-supabase-complete.sh` - Complete DB initialization script
- Schema lives in Supabase (not tracked in repo except in setup scripts)

**Configuration:**
- `vite.config.js` - Build configuration
- `playwright.config.js` - E2E test configuration
- `.env.example` - Environment variable template
