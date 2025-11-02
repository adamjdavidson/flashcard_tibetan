un npx playwright test --project=chromium --project=firefox --trace=on
  npx playwright test --project=chromium --project=firefox --trace=on
  shell: /usr/bin/bash -e {0}
  env:
    VITE_SUPABASE_URL: ***
    VITE_SUPABASE_ANON_KEY: ***
    PLAYWRIGHT_ADMIN_EMAIL: ***
    PLAYWRIGHT_ADMIN_PASSWORD: ***
    SUPABASE_SERVICE_ROLE_KEY: ***
  
Running 41 tests using 2 workers
[AUTH-SETUP] ENV lengths: {
  urlHost: 'ncqrbqkxifqqtizengrp.supabase.co',
  anonKeyLen: 208,
  emailLen: 21,
  pwdLen: 20
}
[AUTH-SETUP] Inject keys: {
  storageKey: 'sb-ncqrbqkxifqqtizengrp-auth-token',
  legacyKey: 'supabase.auth.token'
}
[AUTH-SETUP] localStorage keys (post-boot): [ 'tibetan_flashcards_cards', 'supabase.auth.token' ]
[AUTH-SETUP] auth storage present (post-boot): true
[NET] 200 GET ***/rest/v1/themes?select=*&order=is_default.desc%2Cname.asc
[NET] 200 GET ***/rest/v1/themes?select=*&order=is_default.desc%2Cname.asc
[NET] 200 GET ***/auth/v1/user
[NET] 200 GET ***/rest/v1/themes?select=*&order=is_default.desc%2Cname.asc
[NET] 200 GET ***/rest/v1/user_roles?select=role&user_id=eq.6e9fd3bf-b1c2-40b8-8621-4f1162932a6a
[NET] 200 GET ***/rest/v1/user_roles?select=role&user_id=eq.6e9fd3bf-b1c2-40b8-8621-4f1162932a6a
[NET] 200 GET ***/rest/v1/user_theme_preferences?select=*%2Ctheme_id%2Ccustom_colors&user_id=eq.6e9fd3bf-b1c2-40b8-8621-4f1162932a6a
[NET] 200 GET ***/rest/v1/cards?select=*%2Cinstruction_levels%28id%2Cname%2Corder%29%2Ccard_categories%28categories%28id%2Cname%29%29&order=created_at.desc
[NET] 200 GET ***/rest/v1/card_progress?select=*&user_id=eq.6e9fd3bf-b1c2-40b8-8621-4f1162932a6a
[NET] 200 GET ***/rest/v1/themes?select=*&order=is_default.desc%2Cname.asc
[NET] 200 GET ***/rest/v1/themes?select=*&order=is_default.desc%2Cname.asc
[AUTH-SETUP] localStorage keys after setSession: [ 'tibetan_flashcards_cards', 'supabase.auth.token' ]
[AUTH-SETUP] storage item preview: {
  tibetan_flashcards_cards: '[{"id":"number_numeral_0","type":"number","category":"numbers","...',
  'supabase.auth.token': '{"currentSession":{"access_token":"***'
}
[AUTH-SETUP] Promote-admin result: { userId: '6e9fd3bf-b1c2-40b8-8621-4f1162932a6a', gotAdmin: true }
[AUTH-SETUP] role via anon client: { uid: null, role: null }
[AUTH-SETUP] headerText snippet: རིན་ཆེན་སྒྲིག་སྟངས། Tibetan FlashcardsStudyManage CardsSettings
  ✓   1 [setup] › tests/auth.setup.js:14:1 › authenticate (3.8s)
  -   3 [chromium] › tests/e2e/accessibility.spec.js:33:5 › Accessibility (global) › no critical violations on /
  -   4 [chromium] › tests/e2e/accessibility.spec.js:33:5 › Accessibility (global) › no critical violations on /admin
Unlabeled visible inputs: [
  '<input type="checkbox" checked="">',
  '<input type="checkbox">',
  '<input type="checkbox">',
  '<input type="checkbox">',
  '<input type="checkbox">'
]
  ✓   5 [chromium] › tests/e2e/accessibility.spec.js:52:3 › Accessibility (global) › inputs have labels and buttons have accessible names (1.3s)
  ✘   2 [chromium] › tests/e2e/admin-card-management.spec.js:20:3 › Admin Card Management - phase 1 › displays cards in table view (21.3s)
  ✘   6 [chromium] › tests/e2e/admin-workflows.spec.js:10:3 › Admin workflows › Statistics tab shows admin stats UI (21.1s)
  ✘   7 [chromium] › tests/e2e/admin-card-management.spec.js:36:3 › Admin Card Management - phase 1 › sorts by a column (Type) (21.1s)
  ✘   8 [chromium] › tests/e2e/admin-workflows.spec.js:17:3 › Admin workflows › User Management tab shows users UI (21.1s)
  ✘   9 [chromium] › tests/e2e/admin-card-management.spec.js:56:3 › Admin Card Management - phase 1 › filters by type (21.2s)
  ✘  10 [chromium] › tests/e2e/admin-workflows.spec.js:26:3 › Admin workflows › Card Review tab shows review UI (21.1s)
  ✘  11 [chromium] › tests/e2e/admin-card-management.spec.js:64:3 › Admin Card Management - phase 1 › view switch between Table and Cards (21.1s)
  ✘  12 [chromium] › tests/e2e/admin.spec.js:4:3 › Admin page › admin page is reachable and renders (21.3s)
  ✘  13 [chromium] › tests/e2e/admin-card-management.spec.js:78:3 › Admin Card Management - phase 1 › pagination works (Rows per page) (21.1s)
  ✘  14 [chromium] › tests/e2e/is-authenticated.spec.js:3:1 › is authenticated (20.4s)
  ✘  15 [chromium] › tests/e2e/admin-card-management.spec.js:91:3 › Admin Card Management - phase 1 › keyboard navigation on sortable header (21.1s)
  ✓  17 [chromium] › tests/e2e/navigation.spec.js:4:3 › Navigation › buttons navigate between views (796ms)
  ✓  18 [chromium] › tests/e2e/performance.spec.js:4:3 › Performance (global) › home page loads within budget (1.0s)
  ✘  16 [chromium] › tests/e2e/manage-cards.spec.js:4:3 › Manage Cards › form and filters render (20.6s)
  ✓  20 [chromium] › tests/e2e/study.spec.js:4:3 › Study flow › flip and rate a card (986ms)
  -  21 [firefox] › tests/e2e/accessibility.spec.js:33:5 › Accessibility (global) › no critical violations on /
  -  22 [firefox] › tests/e2e/accessibility.spec.js:33:5 › Accessibility (global) › no critical violations on /admin
Unlabeled visible inputs: [
  '<input type="checkbox" checked="">',
  '<input type="checkbox">',
  '<input type="checkbox">',
  '<input type="checkbox">',
  '<input type="checkbox">'
]
  ✓  23 [firefox] › tests/e2e/accessibility.spec.js:52:3 › Accessibility (global) › inputs have labels and buttons have accessible names (1.7s)
  ✘  19 [chromium] › tests/e2e/performance.spec.js:12:3 › Performance (global) › admin table sort is responsive (30.0s)
  ✘  24 [firefox] › tests/e2e/admin-card-management.spec.js:20:3 › Admin Card Management - phase 1 › displays cards in table view (21.6s)
  ✓  25 [chromium] › tests/e2e/performance.spec.js:24:3 › Performance (global) › network requests are reasonable (1.4s)
  ✘  26 [firefox] › tests/e2e/admin-card-management.spec.js:36:3 › Admin Card Management - phase 1 › sorts by a column (Type) (22.9s)
  ✘  27 [firefox] › tests/e2e/admin-workflows.spec.js:10:3 › Admin workflows › Statistics tab shows admin stats UI (23.1s)
  ✘  28 [firefox] › tests/e2e/admin-card-management.spec.js:56:3 › Admin Card Management - phase 1 › filters by type (22.9s)
  ✘  29 [firefox] › tests/e2e/admin-workflows.spec.js:17:3 › Admin workflows › User Management tab shows users UI (23.1s)
  ✘  30 [firefox] › tests/e2e/admin-card-management.spec.js:64:3 › Admin Card Management - phase 1 › view switch between Table and Cards (23.0s)
  ✘  31 [firefox] › tests/e2e/admin-workflows.spec.js:26:3 › Admin workflows › Card Review tab shows review UI (23.1s)
  ✘  32 [firefox] › tests/e2e/admin-card-management.spec.js:78:3 › Admin Card Management - phase 1 › pagination works (Rows per page) (22.9s)
  ✘  33 [firefox] › tests/e2e/admin.spec.js:4:3 › Admin page › admin page is reachable and renders (22.7s)
  ✘  34 [firefox] › tests/e2e/admin-card-management.spec.js:91:3 › Admin Card Management - phase 1 › keyboard navigation on sortable header (22.8s)
  ✘  35 [firefox] › tests/e2e/is-authenticated.spec.js:3:1 › is authenticated (21.8s)
  ✓  37 [firefox] › tests/e2e/navigation.spec.js:4:3 › Navigation › buttons navigate between views (2.8s)
  ✓  38 [firefox] › tests/e2e/performance.spec.js:4:3 › Performance (global) › home page loads within budget (1.5s)
  ✘  36 [firefox] › tests/e2e/manage-cards.spec.js:4:3 › Manage Cards › form and filters render (22.4s)
  ✓  40 [firefox] › tests/e2e/study.spec.js:4:3 › Study flow › flip and rate a card (2.3s)
  ✘  39 [firefox] › tests/e2e/performance.spec.js:12:3 › Performance (global) › admin table sort is responsive (30.2s)
  ✓  41 [firefox] › tests/e2e/performance.spec.js:24:3 › Performance (global) › network requests are reasonable (2.3s)
  1) [chromium] › tests/e2e/admin-card-management.spec.js:20:3 › Admin Card Management - phase 1 › displays cards in table view 
    Error: expect(locator).toBeVisible() failed
    Locator: locator('.admin-tabs')
    Expected: visible
    Timeout: 20000ms
    Error: element(s) not found
    Call log:
      - Expect "toBeVisible" with timeout 20000ms
      - waiting for locator('.admin-tabs')
       9 |     // Wait for the admin tab bar to render
      10 |     const tabs = page.locator('.admin-tabs');
    > 11 |     await expect(tabs).toBeVisible({ timeout: 20000 });
         |                        ^
      12 |
      13 |     // Navigate to the explicit "Card Management" admin tab inside the tab bar
      14 |     await tabs.getByRole('button', { name: /^card management$/i }).click({ timeout: 20000 });
        at /home/runner/work/flashcard_tibetan/flashcard_tibetan/tests/e2e/admin-card-management.spec.js:11:24
    Error Context: test-results/e2e-admin-card-management--311d3-isplays-cards-in-table-view-chromium/error-context.md
    attachment #2: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/e2e-admin-card-management--311d3-isplays-cards-in-table-view-chromium/trace.zip
    Usage:
        npx playwright show-trace test-results/e2e-admin-card-management--311d3-isplays-cards-in-table-view-chromium/trace.zip
    ────────────────────────────────────────────────────────────────────────────────────────────────
  2) [chromium] › tests/e2e/admin-card-management.spec.js:36:3 › Admin Card Management - phase 1 › sorts by a column (Type) 
    Error: expect(locator).toBeVisible() failed
    Locator: locator('.admin-tabs')
    Expected: visible
    Timeout: 20000ms
    Error: element(s) not found
    Call log:
      - Expect "toBeVisible" with timeout 20000ms
      - waiting for locator('.admin-tabs')
       9 |     // Wait for the admin tab bar to render
      10 |     const tabs = page.locator('.admin-tabs');
    > 11 |     await expect(tabs).toBeVisible({ timeout: 20000 });
         |                        ^
      12 |
      13 |     // Navigate to the explicit "Card Management" admin tab inside the tab bar
      14 |     await tabs.getByRole('button', { name: /^card management$/i }).click({ timeout: 20000 });
        at /home/runner/work/flashcard_tibetan/flashcard_tibetan/tests/e2e/admin-card-management.spec.js:11:24
    Error Context: test-results/e2e-admin-card-management--4e753-e-1-sorts-by-a-column-Type--chromium/error-context.md
    attachment #2: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/e2e-admin-card-management--4e753-e-1-sorts-by-a-column-Type--chromium/trace.zip
    Usage:
        npx playwright show-trace test-results/e2e-admin-card-management--4e753-e-1-sorts-by-a-column-Type--chromium/trace.zip
    ────────────────────────────────────────────────────────────────────────────────────────────────
  3) [chromium] › tests/e2e/admin-card-management.spec.js:56:3 › Admin Card Management - phase 1 › filters by type 
    Error: expect(locator).toBeVisible() failed
    Locator: locator('.admin-tabs')
    Expected: visible
    Timeout: 20000ms
    Error: element(s) not found
    Call log:
      - Expect "toBeVisible" with timeout 20000ms
      - waiting for locator('.admin-tabs')
       9 |     // Wait for the admin tab bar to render
      10 |     const tabs = page.locator('.admin-tabs');
    > 11 |     await expect(tabs).toBeVisible({ timeout: 20000 });
         |                        ^
      12 |
      13 |     // Navigate to the explicit "Card Management" admin tab inside the tab bar
      14 |     await tabs.getByRole('button', { name: /^card management$/i }).click({ timeout: 20000 });
        at /home/runner/work/flashcard_tibetan/flashcard_tibetan/tests/e2e/admin-card-management.spec.js:11:24
    Error Context: test-results/e2e-admin-card-management--d124b-t---phase-1-filters-by-type-chromium/error-context.md
    attachment #2: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/e2e-admin-card-management--d124b-t---phase-1-filters-by-type-chromium/trace.zip
    Usage:
        npx playwright show-trace test-results/e2e-admin-card-management--d124b-t---phase-1-filters-by-type-chromium/trace.zip
    ────────────────────────────────────────────────────────────────────────────────────────────────
  4) [chromium] › tests/e2e/admin-card-management.spec.js:64:3 › Admin Card Management - phase 1 › view switch between Table and Cards 
    Error: expect(locator).toBeVisible() failed
    Locator: locator('.admin-tabs')
    Expected: visible
    Timeout: 20000ms
    Error: element(s) not found
    Call log:
      - Expect "toBeVisible" with timeout 20000ms
      - waiting for locator('.admin-tabs')
       9 |     // Wait for the admin tab bar to render
      10 |     const tabs = page.locator('.admin-tabs');
    > 11 |     await expect(tabs).toBeVisible({ timeout: 20000 });
         |                        ^
      12 |
      13 |     // Navigate to the explicit "Card Management" admin tab inside the tab bar
      14 |     await tabs.getByRole('button', { name: /^card management$/i }).click({ timeout: 20000 });
        at /home/runner/work/flashcard_tibetan/flashcard_tibetan/tests/e2e/admin-card-management.spec.js:11:24
    Error Context: test-results/e2e-admin-card-management--261c1-tch-between-Table-and-Cards-chromium/error-context.md
    attachment #2: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/e2e-admin-card-management--261c1-tch-between-Table-and-Cards-chromium/trace.zip
    Usage:
        npx playwright show-trace test-results/e2e-admin-card-management--261c1-tch-between-Table-and-Cards-chromium/trace.zip
    ────────────────────────────────────────────────────────────────────────────────────────────────
  5) [chromium] › tests/e2e/admin-card-management.spec.js:78:3 › Admin Card Management - phase 1 › pagination works (Rows per page) 
    Error: expect(locator).toBeVisible() failed
    Locator: locator('.admin-tabs')
    Expected: visible
    Timeout: 20000ms
    Error: element(s) not found
    Call log:
      - Expect "toBeVisible" with timeout 20000ms
      - waiting for locator('.admin-tabs')
       9 |     // Wait for the admin tab bar to render
      10 |     const tabs = page.locator('.admin-tabs');
    > 11 |     await expect(tabs).toBeVisible({ timeout: 20000 });
         |                        ^
      12 |
      13 |     // Navigate to the explicit "Card Management" admin tab inside the tab bar
      14 |     await tabs.getByRole('button', { name: /^card management$/i }).click({ timeout: 20000 });
        at /home/runner/work/flashcard_tibetan/flashcard_tibetan/tests/e2e/admin-card-management.spec.js:11:24
    Error Context: test-results/e2e-admin-card-management--998b9-nation-works-Rows-per-page--chromium/error-context.md
    attachment #2: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/e2e-admin-card-management--998b9-nation-works-Rows-per-page--chromium/trace.zip
    Usage:
        npx playwright show-trace test-results/e2e-admin-card-management--998b9-nation-works-Rows-per-page--chromium/trace.zip
    ────────────────────────────────────────────────────────────────────────────────────────────────
  6) [chromium] › tests/e2e/admin-card-management.spec.js:91:3 › Admin Card Management - phase 1 › keyboard navigation on sortable header 
    Error: expect(locator).toBeVisible() failed
    Locator: locator('.admin-tabs')
    Expected: visible
    Timeout: 20000ms
    Error: element(s) not found
    Call log:
      - Expect "toBeVisible" with timeout 20000ms
      - waiting for locator('.admin-tabs')
       9 |     // Wait for the admin tab bar to render
      10 |     const tabs = page.locator('.admin-tabs');
    > 11 |     await expect(tabs).toBeVisible({ timeout: 20000 });
         |                        ^
      12 |
      13 |     // Navigate to the explicit "Card Management" admin tab inside the tab bar
      14 |     await tabs.getByRole('button', { name: /^card management$/i }).click({ timeout: 20000 });
        at /home/runner/work/flashcard_tibetan/flashcard_tibetan/tests/e2e/admin-card-management.spec.js:11:24
    Error Context: test-results/e2e-admin-card-management--98627-vigation-on-sortable-header-chromium/error-context.md
    attachment #2: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/e2e-admin-card-management--98627-vigation-on-sortable-header-chromium/trace.zip
    Usage:
        npx playwright show-trace test-results/e2e-admin-card-management--98627-vigation-on-sortable-header-chromium/trace.zip
    ────────────────────────────────────────────────────────────────────────────────────────────────
  7) [chromium] › tests/e2e/admin-workflows.spec.js:10:3 › Admin workflows › Statistics tab shows admin stats UI 
    Error: expect(locator).toBeVisible() failed
    Locator: locator('.admin-tabs')
    Expected: visible
    Timeout: 20000ms
    Error: element(s) not found
    Call log:
      - Expect "toBeVisible" with timeout 20000ms
      - waiting for locator('.admin-tabs')
       5 |     await page.goto('/admin');
       6 |     await page.waitForLoadState('networkidle');
    >  7 |     await expect(page.locator('.admin-tabs')).toBeVisible({ timeout: 20000 });
         |                                               ^
       8 |   });
       9 |
      10 |   test('Statistics tab shows admin stats UI', async ({ page }) => {
        at /home/runner/work/flashcard_tibetan/flashcard_tibetan/tests/e2e/admin-workflows.spec.js:7:47
    Error Context: test-results/e2e-admin-workflows-Admin--18b5e-cs-tab-shows-admin-stats-UI-chromium/error-context.md
    attachment #2: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/e2e-admin-workflows-Admin--18b5e-cs-tab-shows-admin-stats-UI-chromium/trace.zip
    Usage:
        npx playwright show-trace test-results/e2e-admin-workflows-Admin--18b5e-cs-tab-shows-admin-stats-UI-chromium/trace.zip
    ────────────────────────────────────────────────────────────────────────────────────────────────
  8) [chromium] › tests/e2e/admin-workflows.spec.js:17:3 › Admin workflows › User Management tab shows users UI 
    Error: expect(locator).toBeVisible() failed
    Locator: locator('.admin-tabs')
    Expected: visible
    Timeout: 20000ms
    Error: element(s) not found
    Call log:
      - Expect "toBeVisible" with timeout 20000ms
      - waiting for locator('.admin-tabs')
       5 |     await page.goto('/admin');
       6 |     await page.waitForLoadState('networkidle');
    >  7 |     await expect(page.locator('.admin-tabs')).toBeVisible({ timeout: 20000 });
         |                                               ^
       8 |   });
       9 |
      10 |   test('Statistics tab shows admin stats UI', async ({ page }) => {
        at /home/runner/work/flashcard_tibetan/flashcard_tibetan/tests/e2e/admin-workflows.spec.js:7:47
    Error Context: test-results/e2e-admin-workflows-Admin--7872f-nagement-tab-shows-users-UI-chromium/error-context.md
    attachment #2: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/e2e-admin-workflows-Admin--7872f-nagement-tab-shows-users-UI-chromium/trace.zip
    Usage:
        npx playwright show-trace test-results/e2e-admin-workflows-Admin--7872f-nagement-tab-shows-users-UI-chromium/trace.zip
    ────────────────────────────────────────────────────────────────────────────────────────────────
  9) [chromium] › tests/e2e/admin-workflows.spec.js:26:3 › Admin workflows › Card Review tab shows review UI 
    Error: expect(locator).toBeVisible() failed
    Locator: locator('.admin-tabs')
    Expected: visible
    Timeout: 20000ms
    Error: element(s) not found
    Call log:
      - Expect "toBeVisible" with timeout 20000ms
      - waiting for locator('.admin-tabs')
       5 |     await page.goto('/admin');
       6 |     await page.waitForLoadState('networkidle');
    >  7 |     await expect(page.locator('.admin-tabs')).toBeVisible({ timeout: 20000 });
         |                                               ^
       8 |   });
       9 |
      10 |   test('Statistics tab shows admin stats UI', async ({ page }) => {
        at /home/runner/work/flashcard_tibetan/flashcard_tibetan/tests/e2e/admin-workflows.spec.js:7:47
    Error Context: test-results/e2e-admin-workflows-Admin--778e8--Review-tab-shows-review-UI-chromium/error-context.md
    attachment #2: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/e2e-admin-workflows-Admin--778e8--Review-tab-shows-review-UI-chromium/trace.zip
    Usage:
        npx playwright show-trace test-results/e2e-admin-workflows-Admin--778e8--Review-tab-shows-review-UI-chromium/trace.zip
    ────────────────────────────────────────────────────────────────────────────────────────────────
  10) [chromium] › tests/e2e/admin.spec.js:4:3 › Admin page › admin page is reachable and renders ──
    Error: expect(locator).toBeVisible() failed
    Locator: locator('.admin-page,.admin-tabs')
    Expected: visible
    Timeout: 20000ms
    Error: element(s) not found
    Call log:
      - Expect "toBeVisible" with timeout 20000ms
      - waiting for locator('.admin-page,.admin-tabs')
       7 |
       8 |     // Admin shell visible (tabs or page container)
    >  9 |     await expect(page.locator('.admin-page,.admin-tabs')).toBeVisible({ timeout: 20000 });
         |                                                           ^
      10 |     // No access denied
      11 |     await expect(page.locator('text=/access denied/i')).toHaveCount(0);
      12 |   });
        at /home/runner/work/flashcard_tibetan/flashcard_tibetan/tests/e2e/admin.spec.js:9:59
    Error Context: test-results/e2e-admin-Admin-page-admin-page-is-reachable-and-renders-chromium/error-context.md
    attachment #2: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/e2e-admin-Admin-page-admin-page-is-reachable-and-renders-chromium/trace.zip
    Usage:
        npx playwright show-trace test-results/e2e-admin-Admin-page-admin-page-is-reachable-and-renders-chromium/trace.zip
    ────────────────────────────────────────────────────────────────────────────────────────────────
  11) [chromium] › tests/e2e/is-authenticated.spec.js:3:1 › is authenticated ───────────────────────
    Error: expect(locator).toBeVisible() failed
    Locator: locator('.user-email').or(locator('[data-testid="user-menu"]').first())
    Expected: visible
    Timeout: 20000ms
    Error: element(s) not found
    Call log:
      - Expect "toBeVisible" with timeout 20000ms
      - waiting for locator('.user-email').or(locator('[data-testid="user-menu"]').first())
      4 |   await page.goto('/');
      5 |   const userIndicator = page.locator('.user-email').or(page.locator('[data-testid="user-menu"]').first());
    > 6 |   await expect(userIndicator).toBeVisible({ timeout: 20000 });
        |                               ^
      7 | });
      8 |
      9 |
        at /home/runner/work/flashcard_tibetan/flashcard_tibetan/tests/e2e/is-authenticated.spec.js:6:31
    Error Context: test-results/e2e-is-authenticated-is-authenticated-chromium/error-context.md
    attachment #2: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/e2e-is-authenticated-is-authenticated-chromium/trace.zip
    Usage:
        npx playwright show-trace test-results/e2e-is-authenticated-is-authenticated-chromium/trace.zip
    ────────────────────────────────────────────────────────────────────────────────────────────────
  12) [chromium] › tests/e2e/manage-cards.spec.js:4:3 › Manage Cards › form and filters render ─────
    Error: expect(locator).toBeVisible() failed
    Locator: getByRole('heading', { name: /quick translate|add cards/i })
    Expected: visible
    Timeout: 20000ms
    Error: element(s) not found
    Call log:
      - Expect "toBeVisible" with timeout 20000ms
      - waiting for getByRole('heading', { name: /quick translate|add cards/i })
      15 |
      16 |     // Quick add form visible
    > 17 |     await expect(page.getByRole('heading', { name: /quick translate|add cards/i })).toBeVisible({ timeout: 20000 });
         |                                                                                     ^
      18 |     await expect(page.getByLabel(/english word/i)).toBeVisible();
      19 |     await expect(page.getByRole('button', { name: /translate/i })).toBeVisible();
      20 |
        at /home/runner/work/flashcard_tibetan/flashcard_tibetan/tests/e2e/manage-cards.spec.js:17:85
    Error Context: test-results/e2e-manage-cards-Manage-Cards-form-and-filters-render-chromium/error-context.md
    attachment #2: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/e2e-manage-cards-Manage-Cards-form-and-filters-render-chromium/trace.zip
    Usage:
        npx playwright show-trace test-results/e2e-manage-cards-Manage-Cards-form-and-filters-render-chromium/trace.zip
    ────────────────────────────────────────────────────────────────────────────────────────────────
  13) [chromium] › tests/e2e/performance.spec.js:12:3 › Performance (global) › admin table sort is responsive 
    Test timeout of 30000ms exceeded.
    Error: locator.click: Test timeout of 30000ms exceeded.
    Call log:
      - waiting for getByRole('button', { name: /^card management$/i })
      12 |   test('admin table sort is responsive', async ({ page }) => {
      13 |     await page.goto('/admin');
    > 14 |     await page.getByRole('button', { name: /^card management$/i }).click();
         |                                                                    ^
      15 |     await page.getByRole('button', { name: /^table$/i }).click();
      16 |     const sortButton = page.getByRole('button', { name: /sort by type/i });
      17 |     const start = Date.now();
        at /home/runner/work/flashcard_tibetan/flashcard_tibetan/tests/e2e/performance.spec.js:14:68
    Error Context: test-results/e2e-performance-Performanc-7fc89-in-table-sort-is-responsive-chromium/error-context.md
    attachment #2: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/e2e-performance-Performanc-7fc89-in-table-sort-is-responsive-chromium/trace.zip
    Usage:
        npx playwright show-trace test-results/e2e-performance-Performanc-7fc89-in-table-sort-is-responsive-chromium/trace.zip
    ────────────────────────────────────────────────────────────────────────────────────────────────
  14) [firefox] › tests/e2e/admin-card-management.spec.js:20:3 › Admin Card Management - phase 1 › displays cards in table view 
    Error: expect(locator).toBeVisible() failed
    Locator: locator('.admin-tabs')
    Expected: visible
    Timeout: 20000ms
    Error: element(s) not found
    Call log:
      - Expect "toBeVisible" with timeout 20000ms
      - waiting for locator('.admin-tabs')
       9 |     // Wait for the admin tab bar to render
      10 |     const tabs = page.locator('.admin-tabs');
    > 11 |     await expect(tabs).toBeVisible({ timeout: 20000 });
         |                        ^
      12 |
      13 |     // Navigate to the explicit "Card Management" admin tab inside the tab bar
      14 |     await tabs.getByRole('button', { name: /^card management$/i }).click({ timeout: 20000 });
        at /home/runner/work/flashcard_tibetan/flashcard_tibetan/tests/e2e/admin-card-management.spec.js:11:24
    Error Context: test-results/e2e-admin-card-management--311d3-isplays-cards-in-table-view-firefox/error-context.md
    attachment #2: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/e2e-admin-card-management--311d3-isplays-cards-in-table-view-firefox/trace.zip
    Usage:
        npx playwright show-trace test-results/e2e-admin-card-management--311d3-isplays-cards-in-table-view-firefox/trace.zip
    ────────────────────────────────────────────────────────────────────────────────────────────────
  15) [firefox] › tests/e2e/admin-card-management.spec.js:36:3 › Admin Card Management - phase 1 › sorts by a column (Type) 
    Error: expect(locator).toBeVisible() failed
    Locator: locator('.admin-tabs')
    Expected: visible
    Timeout: 20000ms
    Error: element(s) not found
    Call log:
      - Expect "toBeVisible" with timeout 20000ms
      - waiting for locator('.admin-tabs')
       9 |     // Wait for the admin tab bar to render
      10 |     const tabs = page.locator('.admin-tabs');
    > 11 |     await expect(tabs).toBeVisible({ timeout: 20000 });
         |                        ^
      12 |
      13 |     // Navigate to the explicit "Card Management" admin tab inside the tab bar
      14 |     await tabs.getByRole('button', { name: /^card management$/i }).click({ timeout: 20000 });
        at /home/runner/work/flashcard_tibetan/flashcard_tibetan/tests/e2e/admin-card-management.spec.js:11:24
    Error Context: test-results/e2e-admin-card-management--4e753-e-1-sorts-by-a-column-Type--firefox/error-context.md
    attachment #2: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/e2e-admin-card-management--4e753-e-1-sorts-by-a-column-Type--firefox/trace.zip
    Usage:
        npx playwright show-trace test-results/e2e-admin-card-management--4e753-e-1-sorts-by-a-column-Type--firefox/trace.zip
    ────────────────────────────────────────────────────────────────────────────────────────────────
  16) [firefox] › tests/e2e/admin-card-management.spec.js:56:3 › Admin Card Management - phase 1 › filters by type 
    Error: expect(locator).toBeVisible() failed
    Locator: locator('.admin-tabs')
    Expected: visible
    Timeout: 20000ms
    Error: element(s) not found
    Call log:
      - Expect "toBeVisible" with timeout 20000ms
      - waiting for locator('.admin-tabs')
       9 |     // Wait for the admin tab bar to render
      10 |     const tabs = page.locator('.admin-tabs');
    > 11 |     await expect(tabs).toBeVisible({ timeout: 20000 });
         |                        ^
      12 |
      13 |     // Navigate to the explicit "Card Management" admin tab inside the tab bar
      14 |     await tabs.getByRole('button', { name: /^card management$/i }).click({ timeout: 20000 });
        at /home/runner/work/flashcard_tibetan/flashcard_tibetan/tests/e2e/admin-card-management.spec.js:11:24
    Error Context: test-results/e2e-admin-card-management--d124b-t---phase-1-filters-by-type-firefox/error-context.md
    attachment #2: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/e2e-admin-card-management--d124b-t---phase-1-filters-by-type-firefox/trace.zip
    Usage:
        npx playwright show-trace test-results/e2e-admin-card-management--d124b-t---phase-1-filters-by-type-firefox/trace.zip
    ────────────────────────────────────────────────────────────────────────────────────────────────
  17) [firefox] › tests/e2e/admin-card-management.spec.js:64:3 › Admin Card Management - phase 1 › view switch between Table and Cards 
    Error: expect(locator).toBeVisible() failed
    Locator: locator('.admin-tabs')
    Expected: visible
    Timeout: 20000ms
    Error: element(s) not found
    Call log:
      - Expect "toBeVisible" with timeout 20000ms
      - waiting for locator('.admin-tabs')
       9 |     // Wait for the admin tab bar to render
      10 |     const tabs = page.locator('.admin-tabs');
    > 11 |     await expect(tabs).toBeVisible({ timeout: 20000 });
         |                        ^
      12 |
      13 |     // Navigate to the explicit "Card Management" admin tab inside the tab bar
      14 |     await tabs.getByRole('button', { name: /^card management$/i }).click({ timeout: 20000 });
        at /home/runner/work/flashcard_tibetan/flashcard_tibetan/tests/e2e/admin-card-management.spec.js:11:24
    Error Context: test-results/e2e-admin-card-management--261c1-tch-between-Table-and-Cards-firefox/error-context.md
    attachment #2: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/e2e-admin-card-management--261c1-tch-between-Table-and-Cards-firefox/trace.zip
    Usage:
        npx playwright show-trace test-results/e2e-admin-card-management--261c1-tch-between-Table-and-Cards-firefox/trace.zip
    ────────────────────────────────────────────────────────────────────────────────────────────────
  18) [firefox] › tests/e2e/admin-card-management.spec.js:78:3 › Admin Card Management - phase 1 › pagination works (Rows per page) 
    Error: expect(locator).toBeVisible() failed
    Locator: locator('.admin-tabs')
    Expected: visible
    Timeout: 20000ms
    Error: element(s) not found
    Call log:
      - Expect "toBeVisible" with timeout 20000ms
      - waiting for locator('.admin-tabs')
       9 |     // Wait for the admin tab bar to render
      10 |     const tabs = page.locator('.admin-tabs');
    > 11 |     await expect(tabs).toBeVisible({ timeout: 20000 });
         |                        ^
      12 |
      13 |     // Navigate to the explicit "Card Management" admin tab inside the tab bar
      14 |     await tabs.getByRole('button', { name: /^card management$/i }).click({ timeout: 20000 });
        at /home/runner/work/flashcard_tibetan/flashcard_tibetan/tests/e2e/admin-card-management.spec.js:11:24
    Error Context: test-results/e2e-admin-card-management--998b9-nation-works-Rows-per-page--firefox/error-context.md
    attachment #2: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/e2e-admin-card-management--998b9-nation-works-Rows-per-page--firefox/trace.zip
    Usage:
        npx playwright show-trace test-results/e2e-admin-card-management--998b9-nation-works-Rows-per-page--firefox/trace.zip
    ────────────────────────────────────────────────────────────────────────────────────────────────
  19) [firefox] › tests/e2e/admin-card-management.spec.js:91:3 › Admin Card Management - phase 1 › keyboard navigation on sortable header 
    Error: expect(locator).toBeVisible() failed
    Locator: locator('.admin-tabs')
    Expected: visible
    Timeout: 20000ms
    Error: element(s) not found
    Call log:
      - Expect "toBeVisible" with timeout 20000ms
      - waiting for locator('.admin-tabs')
       9 |     // Wait for the admin tab bar to render
      10 |     const tabs = page.locator('.admin-tabs');
    > 11 |     await expect(tabs).toBeVisible({ timeout: 20000 });
         |                        ^
      12 |
      13 |     // Navigate to the explicit "Card Management" admin tab inside the tab bar
      14 |     await tabs.getByRole('button', { name: /^card management$/i }).click({ timeout: 20000 });
        at /home/runner/work/flashcard_tibetan/flashcard_tibetan/tests/e2e/admin-card-management.spec.js:11:24
    Error Context: test-results/e2e-admin-card-management--98627-vigation-on-sortable-header-firefox/error-context.md
    attachment #2: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/e2e-admin-card-management--98627-vigation-on-sortable-header-firefox/trace.zip
    Usage:
        npx playwright show-trace test-results/e2e-admin-card-management--98627-vigation-on-sortable-header-firefox/trace.zip
    ────────────────────────────────────────────────────────────────────────────────────────────────
  20) [firefox] › tests/e2e/admin-workflows.spec.js:10:3 › Admin workflows › Statistics tab shows admin stats UI 
    Error: expect(locator).toBeVisible() failed
    Locator: locator('.admin-tabs')
    Expected: visible
    Timeout: 20000ms
    Error: element(s) not found
    Call log:
      - Expect "toBeVisible" with timeout 20000ms
      - waiting for locator('.admin-tabs')
       5 |     await page.goto('/admin');
       6 |     await page.waitForLoadState('networkidle');
    >  7 |     await expect(page.locator('.admin-tabs')).toBeVisible({ timeout: 20000 });
         |                                               ^
       8 |   });
       9 |
      10 |   test('Statistics tab shows admin stats UI', async ({ page }) => {
        at /home/runner/work/flashcard_tibetan/flashcard_tibetan/tests/e2e/admin-workflows.spec.js:7:47
    Error Context: test-results/e2e-admin-workflows-Admin--18b5e-cs-tab-shows-admin-stats-UI-firefox/error-context.md
    attachment #2: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/e2e-admin-workflows-Admin--18b5e-cs-tab-shows-admin-stats-UI-firefox/trace.zip
    Usage:
        npx playwright show-trace test-results/e2e-admin-workflows-Admin--18b5e-cs-tab-shows-admin-stats-UI-firefox/trace.zip
    ────────────────────────────────────────────────────────────────────────────────────────────────
  21) [firefox] › tests/e2e/admin-workflows.spec.js:17:3 › Admin workflows › User Management tab shows users UI 
    Error: expect(locator).toBeVisible() failed
    Locator: locator('.admin-tabs')
    Expected: visible
    Timeout: 20000ms
    Error: element(s) not found
    Call log:
      - Expect "toBeVisible" with timeout 20000ms
      - waiting for locator('.admin-tabs')
       5 |     await page.goto('/admin');
       6 |     await page.waitForLoadState('networkidle');
    >  7 |     await expect(page.locator('.admin-tabs')).toBeVisible({ timeout: 20000 });
         |                                               ^
       8 |   });
       9 |
      10 |   test('Statistics tab shows admin stats UI', async ({ page }) => {
        at /home/runner/work/flashcard_tibetan/flashcard_tibetan/tests/e2e/admin-workflows.spec.js:7:47
    Error Context: test-results/e2e-admin-workflows-Admin--7872f-nagement-tab-shows-users-UI-firefox/error-context.md
    attachment #2: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/e2e-admin-workflows-Admin--7872f-nagement-tab-shows-users-UI-firefox/trace.zip
    Usage:
        npx playwright show-trace test-results/e2e-admin-workflows-Admin--7872f-nagement-tab-shows-users-UI-firefox/trace.zip
    ────────────────────────────────────────────────────────────────────────────────────────────────
  22) [firefox] › tests/e2e/admin-workflows.spec.js:26:3 › Admin workflows › Card Review tab shows review UI 
    Error: expect(locator).toBeVisible() failed
    Locator: locator('.admin-tabs')
    Expected: visible
    Timeout: 20000ms
    Error: element(s) not found
    Call log:
      - Expect "toBeVisible" with timeout 20000ms
      - waiting for locator('.admin-tabs')
       5 |     await page.goto('/admin');
       6 |     await page.waitForLoadState('networkidle');
    >  7 |     await expect(page.locator('.admin-tabs')).toBeVisible({ timeout: 20000 });
         |                                               ^
       8 |   });
       9 |
      10 |   test('Statistics tab shows admin stats UI', async ({ page }) => {
        at /home/runner/work/flashcard_tibetan/flashcard_tibetan/tests/e2e/admin-workflows.spec.js:7:47
    Error Context: test-results/e2e-admin-workflows-Admin--778e8--Review-tab-shows-review-UI-firefox/error-context.md
    attachment #2: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/e2e-admin-workflows-Admin--778e8--Review-tab-shows-review-UI-firefox/trace.zip
    Usage:
        npx playwright show-trace test-results/e2e-admin-workflows-Admin--778e8--Review-tab-shows-review-UI-firefox/trace.zip
    ────────────────────────────────────────────────────────────────────────────────────────────────
  23) [firefox] › tests/e2e/admin.spec.js:4:3 › Admin page › admin page is reachable and renders ───
    Error: expect(locator).toBeVisible() failed
    Locator: locator('.admin-page,.admin-tabs')
    Expected: visible
    Timeout: 20000ms
    Error: element(s) not found
    Call log:
      - Expect "toBeVisible" with timeout 20000ms
      - waiting for locator('.admin-page,.admin-tabs')
       7 |
       8 |     // Admin shell visible (tabs or page container)
    >  9 |     await expect(page.locator('.admin-page,.admin-tabs')).toBeVisible({ timeout: 20000 });
         |                                                           ^
      10 |     // No access denied
      11 |     await expect(page.locator('text=/access denied/i')).toHaveCount(0);
      12 |   });
        at /home/runner/work/flashcard_tibetan/flashcard_tibetan/tests/e2e/admin.spec.js:9:59
    Error Context: test-results/e2e-admin-Admin-page-admin-page-is-reachable-and-renders-firefox/error-context.md
    attachment #2: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/e2e-admin-Admin-page-admin-page-is-reachable-and-renders-firefox/trace.zip
    Usage:
        npx playwright show-trace test-results/e2e-admin-Admin-page-admin-page-is-reachable-and-renders-firefox/trace.zip
    ────────────────────────────────────────────────────────────────────────────────────────────────
  24) [firefox] › tests/e2e/is-authenticated.spec.js:3:1 › is authenticated ────────────────────────
    Error: expect(locator).toBeVisible() failed
    Locator: locator('.user-email').or(locator('[data-testid="user-menu"]').first())
    Expected: visible
    Timeout: 20000ms
    Error: element(s) not found
    Call log:
      - Expect "toBeVisible" with timeout 20000ms
      - waiting for locator('.user-email').or(locator('[data-testid="user-menu"]').first())
      4 |   await page.goto('/');
      5 |   const userIndicator = page.locator('.user-email').or(page.locator('[data-testid="user-menu"]').first());
    > 6 |   await expect(userIndicator).toBeVisible({ timeout: 20000 });
        |                               ^
      7 | });
      8 |
      9 |
        at /home/runner/work/flashcard_tibetan/flashcard_tibetan/tests/e2e/is-authenticated.spec.js:6:31
    Error Context: test-results/e2e-is-authenticated-is-authenticated-firefox/error-context.md
    attachment #2: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/e2e-is-authenticated-is-authenticated-firefox/trace.zip
    Usage:
        npx playwright show-trace test-results/e2e-is-authenticated-is-authenticated-firefox/trace.zip
    ────────────────────────────────────────────────────────────────────────────────────────────────
  25) [firefox] › tests/e2e/manage-cards.spec.js:4:3 › Manage Cards › form and filters render ──────
    Error: expect(locator).toBeVisible() failed
    Locator: getByRole('heading', { name: /quick translate|add cards/i })
    Expected: visible
    Timeout: 20000ms
    Error: element(s) not found
    Call log:
      - Expect "toBeVisible" with timeout 20000ms
      - waiting for getByRole('heading', { name: /quick translate|add cards/i })
      15 |
      16 |     // Quick add form visible
    > 17 |     await expect(page.getByRole('heading', { name: /quick translate|add cards/i })).toBeVisible({ timeout: 20000 });
         |                                                                                     ^
      18 |     await expect(page.getByLabel(/english word/i)).toBeVisible();
      19 |     await expect(page.getByRole('button', { name: /translate/i })).toBeVisible();
      20 |
        at /home/runner/work/flashcard_tibetan/flashcard_tibetan/tests/e2e/manage-cards.spec.js:17:85
    Error Context: test-results/e2e-manage-cards-Manage-Cards-form-and-filters-render-firefox/error-context.md
    attachment #2: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/e2e-manage-cards-Manage-Cards-form-and-filters-render-firefox/trace.zip
    Usage:
        npx playwright show-trace test-results/e2e-manage-cards-Manage-Cards-form-and-filters-render-firefox/trace.zip
    ────────────────────────────────────────────────────────────────────────────────────────────────
  26) [firefox] › tests/e2e/performance.spec.js:12:3 › Performance (global) › admin table sort is responsive 
    Test timeout of 30000ms exceeded.
    Error: locator.click: Test timeout of 30000ms exceeded.
    Call log:
      - waiting for getByRole('button', { name: /^card management$/i })
      12 |   test('admin table sort is responsive', async ({ page }) => {
      13 |     await page.goto('/admin');
    > 14 |     await page.getByRole('button', { name: /^card management$/i }).click();
         |                                                                    ^
      15 |     await page.getByRole('button', { name: /^table$/i }).click();
      16 |     const sortButton = page.getByRole('button', { name: /sort by type/i });
      17 |     const start = Date.now();
        at /home/runner/work/flashcard_tibetan/flashcard_tibetan/tests/e2e/performance.spec.js:14:68
    Error Context: test-results/e2e-performance-Performanc-7fc89-in-table-sort-is-responsive-firefox/error-context.md
    attachment #2: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/e2e-performance-Performanc-7fc89-in-table-sort-is-responsive-firefox/trace.zip
    Usage:
        npx playwright show-trace test-results/e2e-performance-Performanc-7fc89-in-table-sort-is-responsive-firefox/trace.zip
    ────────────────────────────────────────────────────────────────────────────────────────────────
  26 failed
    [chromium] › tests/e2e/admin-card-management.spec.js:20:3 › Admin Card Management - phase 1 › displays cards in table view 
    [chromium] › tests/e2e/admin-card-management.spec.js:36:3 › Admin Card Management - phase 1 › sorts by a column (Type) 
    [chromium] › tests/e2e/admin-card-management.spec.js:56:3 › Admin Card Management - phase 1 › filters by type 
    [chromium] › tests/e2e/admin-card-management.spec.js:64:3 › Admin Card Management - phase 1 › view switch between Table and Cards 
    [chromium] › tests/e2e/admin-card-management.spec.js:78:3 › Admin Card Management - phase 1 › pagination works (Rows per page) 
    [chromium] › tests/e2e/admin-card-management.spec.js:91:3 › Admin Card Management - phase 1 › keyboard navigation on sortable header 
    [chromium] › tests/e2e/admin-workflows.spec.js:10:3 › Admin workflows › Statistics tab shows admin stats UI 
    [chromium] › tests/e2e/admin-workflows.spec.js:17:3 › Admin workflows › User Management tab shows users UI 
    [chromium] › tests/e2e/admin-workflows.spec.js:26:3 › Admin workflows › Card Review tab shows review UI 
    [chromium] › tests/e2e/admin.spec.js:4:3 › Admin page › admin page is reachable and renders ────
    [chromium] › tests/e2e/is-authenticated.spec.js:3:1 › is authenticated ─────────────────────────
    [chromium] › tests/e2e/manage-cards.spec.js:4:3 › Manage Cards › form and filters render ───────
    [chromium] › tests/e2e/performance.spec.js:12:3 › Performance (global) › admin table sort is responsive 
    [firefox] › tests/e2e/admin-card-management.spec.js:20:3 › Admin Card Management - phase 1 › displays cards in table view 
    [firefox] › tests/e2e/admin-card-management.spec.js:36:3 › Admin Card Management - phase 1 › sorts by a column (Type) 
    [firefox] › tests/e2e/admin-card-management.spec.js:56:3 › Admin Card Management - phase 1 › filters by type 
    [firefox] › tests/e2e/admin-card-management.spec.js:64:3 › Admin Card Management - phase 1 › view switch between Table and Cards 
    [firefox] › tests/e2e/admin-card-management.spec.js:78:3 › Admin Card Management - phase 1 › pagination works (Rows per page) 
    [firefox] › tests/e2e/admin-card-management.spec.js:91:3 › Admin Card Management - phase 1 › keyboard navigation on sortable header 
    [firefox] › tests/e2e/admin-workflows.spec.js:10:3 › Admin workflows › Statistics tab shows admin stats UI 
    [firefox] › tests/e2e/admin-workflows.spec.js:17:3 › Admin workflows › User Management tab shows users UI 
    [firefox] › tests/e2e/admin-workflows.spec.js:26:3 › Admin workflows › Card Review tab shows review UI 
    [firefox] › tests/e2e/admin.spec.js:4:3 › Admin page › admin page is reachable and renders ─────
    [firefox] › tests/e2e/is-authenticated.spec.js:3:1 › is authenticated ──────────────────────────
    [firefox] › tests/e2e/manage-cards.spec.js:4:3 › Manage Cards › form and filters render ────────
    [firefox] › tests/e2e/performance.spec.js:12:3 › Performance (global) › admin table sort is responsive 
  4 skipped
  11 passed (5.6m)
Error: Process completed with exit code 1.
0s
Run actions/upload-artifact@v4
No files were found with the provided path: playwright-report. No artifacts will be uploaded.
0s
