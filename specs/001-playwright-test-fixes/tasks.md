# Tasks: Systematic Playwright Test Failure Resolution

**Input**: Design documents from `/specs/001-playwright-test-fixes/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below use single project structure

---

## Phase 1: Setup (Debugging Environment)

**Purpose**: Ensure debugging tools and environment are ready for root cause investigation

- [ ] T001 Verify Playwright installation and version (1.56.1) in package.json
- [ ] T002 [P] Verify trace viewer is available: `npx playwright show-trace --help`
- [ ] T003 [P] Verify Playwright inspector is available: `npx playwright test --help | grep debug`
- [ ] T004 [P] Ensure git history access for reviewing recent changes
- [ ] T005 [P] Verify access to `.cursor/notes/root-cause-analysis.md` process documentation
- [ ] T006 [P] Verify access to `.cursor/notes/modesty.md` guidelines

**Checkpoint**: Debugging environment ready - can begin test failure investigation

---

## Phase 2: Foundational (Identify First Failing Test)

**Purpose**: Identify and evaluate the first failing test - CRITICAL prerequisite before any fixes

**⚠️ CRITICAL**: No test fixes can begin until first failing test is identified and evaluated

- [ ] T007 Run Playwright test suite to identify all failing tests: `npm run test:e2e` in tests/
- [ ] T008 Analyze test output to identify first/most critical failing test
- [ ] T009 Document first failing test: test name, file path, failure message in specs/001-playwright-test-fixes/
- [ ] T010 Evaluate first failing test: answer "What does this test verify?" in specs/001-playwright-test-fixes/
- [ ] T011 Evaluate first failing test: answer "Is this test valuable? Why?" in specs/001-playwright-test-fixes/
- [ ] T012 Evaluate first failing test: answer "Is it testing the right thing?" in specs/001-playwright-test-fixes/
- [ ] T013 Evaluate first failing test: answer "Is there a better way to test this?" in specs/001-playwright-test-fixes/
- [ ] T014 Review git history for recent changes that may have caused failure: `git log --oneline --since="7 days ago"` in repository root
- [ ] T015 Identify files changed between last passing commit and first failing commit using git history

**Checkpoint**: First failing test identified and evaluated - root cause investigation can begin

---

## Phase 3: User Story 1 - Identify and Fix First Test Failure (Priority: P1) 🎯 MVP

**Goal**: Systematically identify root cause of first failing test and fix underlying issue without workarounds

**Independent Test**: Run the specific failing test in isolation and confirm it passes after root cause is fixed, without any timeout increases or workarounds

### Root Cause Investigation for User Story 1

- [ ] T016 [US1] Determine failure type: classify as "real bug" or "test artifact" for first failing test
- [ ] T017 [US1] Trace execution path: identify where test gets stuck using Playwright trace viewer
- [ ] T018 [US1] Run test with trace: `npx playwright test --trace=on [test-file]` in tests/
- [ ] T019 [US1] Analyze trace output: identify exact point where execution fails using trace viewer
- [ ] T020 [US1] Review code execution path: trace from test → component → hook → service → API
- [ ] T021 [US1] Identify specific condition causing failure: document what prevents completion
- [ ] T022 [US1] Review relevant source files: check files identified in git history (e.g., src/hooks/useAuth.js, src/components/AdminPage.jsx)
- [ ] T023 [US1] Add diagnostic logging if needed: add console.log statements to trace execution flow
- [ ] T024 [US1] Document root cause: explain why failure occurs, not just how to prevent it

### Fix Implementation for User Story 1

- [ ] T025 [US1] Implement fix addressing root cause (not symptom) in identified source file
- [ ] T026 [US1] Verify fix does NOT add timeouts, delays, or workarounds per Constitution Principle X
- [ ] T027 [US1] Verify fix makes code work correctly, not just "not fail"
- [ ] T028 [US1] Remove any diagnostic logging added during investigation

### Verification for User Story 1

- [ ] T029 [US1] Run first failing test in isolation: `npx playwright test [test-file]` in tests/
- [ ] T030 [US1] Verify test passes without timeout increases or workarounds
- [ ] T031 [US1] Verify previously passing tests still pass: run full test suite to check for regressions
- [ ] T032 [US1] Document fix verification: explain why fix works and how it addresses root cause

**Checkpoint**: First test failure resolved - test passes, no regressions, root cause fixed (not masked)

---

## Phase 4: User Story 2 - Resolve Remaining Test Failures One at a Time (Priority: P2)

**Goal**: Fix each remaining test failure individually, ensuring each is fully resolved before moving to next

**Independent Test**: Confirm each test passes after its fix is applied, and that previously fixed tests continue to pass

### Test Failure 2 Investigation

- [ ] T033 [US2] Identify second failing test from test suite output
- [ ] T034 [US2] Evaluate second failing test: determine what it verifies, why valuable, if testing right thing
- [ ] T035 [US2] Determine failure type for second test: classify as "real bug" or "test artifact"
- [ ] T036 [US2] Trace execution path for second test: identify where it gets stuck
- [ ] T037 [US2] Run second test with trace: `npx playwright test --trace=on [test-file-2]` in tests/
- [ ] T038 [US2] Analyze trace for second test: identify exact failure point
- [ ] T039 [US2] Review git history for second test: identify recent changes that may have caused failure
- [ ] T040 [US2] Identify root cause for second test: document specific condition causing failure
- [ ] T041 [US2] Implement fix for second test addressing root cause in identified source file
- [ ] T042 [US2] Verify second test fix does NOT add workarounds per Constitution Principle X
- [ ] T043 [US2] Run second test to verify fix: `npx playwright test [test-file-2]` in tests/
- [ ] T044 [US2] Verify first test still passes after second test fix: run first test to check for regressions
- [ ] T045 [US2] Verify second test passes without timeout increases or workarounds

### Test Failure 3 Investigation

- [ ] T046 [US2] Identify third failing test from test suite output
- [ ] T047 [US2] Evaluate third failing test: determine what it verifies, why valuable, if testing right thing
- [ ] T048 [US2] Determine failure type for third test: classify as "real bug" or "test artifact"
- [ ] T049 [US2] Trace execution path for third test: identify where it gets stuck
- [ ] T050 [US2] Run third test with trace: `npx playwright test --trace=on [test-file-3]` in tests/
- [ ] T051 [US2] Analyze trace for third test: identify exact failure point
- [ ] T052 [US2] Review git history for third test: identify recent changes that may have caused failure
- [ ] T053 [US2] Identify root cause for third test: document specific condition causing failure
- [ ] T054 [US2] Implement fix for third test addressing root cause in identified source file
- [ ] T055 [US2] Verify third test fix does NOT add workarounds per Constitution Principle X
- [ ] T056 [US2] Run third test to verify fix: `npx playwright test [test-file-3]` in tests/
- [ ] T057 [US2] Verify previously fixed tests still pass: run first and second tests to check for regressions
- [ ] T058 [US2] Verify third test passes without timeout increases or workarounds

### Continue for Remaining Failures

- [ ] T059 [US2] Repeat investigation and fix process for each remaining failing test (one at a time)
- [ ] T060 [US2] After each fix, verify that test passes and previously fixed tests continue to pass
- [ ] T061 [US2] Run full test suite after all fixes: `npm run test:e2e` in tests/
- [ ] T062 [US2] Verify all tests pass reliably: confirm zero test failures remain

**Checkpoint**: All test failures resolved - each test passes, no regressions, all root causes fixed (not masked)

---

## Phase 5: User Story 3 - Document Root Causes and Solutions (Priority: P3)

**Goal**: Document what caused each test failure and how it was fixed for future reference

**Independent Test**: Review documentation and confirm it accurately describes root cause and solution for each resolved failure

### Documentation for User Story 3

- [ ] T063 [US3] Document root cause for first test failure: explain why failure occurred in specs/001-playwright-test-fixes/
- [ ] T064 [US3] Document fix for first test failure: explain how fix addresses root cause in specs/001-playwright-test-fixes/
- [ ] T065 [US3] Document root cause for second test failure: explain why failure occurred in specs/001-playwright-test-fixes/
- [ ] T066 [US3] Document fix for second test failure: explain how fix addresses root cause in specs/001-playwright-test-fixes/
- [ ] T067 [US3] Document root cause for third test failure: explain why failure occurred in specs/001-playwright-test-fixes/
- [ ] T068 [US3] Document fix for third test failure: explain how fix addresses root cause in specs/001-playwright-test-fixes/
- [ ] T069 [US3] Document root causes and fixes for all remaining test failures in specs/001-playwright-test-fixes/
- [ ] T070 [US3] Create summary document: list all failures, root causes, and fixes in specs/001-playwright-test-fixes/
- [ ] T071 [US3] Review documentation: verify it accurately describes what changed and why

**Checkpoint**: Documentation complete - all root causes and fixes documented for future reference

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup

- [ ] T072 [P] Run full test suite one final time: `npm run test:e2e` in tests/
- [ ] T073 [P] Verify all tests pass: confirm zero failures in test output
- [ ] T074 [P] Verify no workarounds were added: review all fixes to confirm no timeouts, delays, or workarounds
- [ ] T075 [P] Verify root cause analysis process was followed: review fixes against `.cursor/notes/root-cause-analysis.md`
- [ ] T076 [P] Verify tentative language was used: review commit messages and documentation against `.cursor/notes/modesty.md`
- [ ] T077 [P] Clean up any temporary diagnostic code or logging
- [ ] T078 [P] Update quickstart.md if new debugging techniques were discovered during investigation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all test fixes
- **User Story 1 (Phase 3)**: Depends on Foundational completion - Must complete before User Story 2
- **User Story 2 (Phase 4)**: Depends on User Story 1 completion - Must fix tests one at a time
- **User Story 3 (Phase 5)**: Depends on User Story 2 completion - Documents fixes after they're made
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start ONLY after User Story 1 is complete - Must verify first test passes before fixing next
- **User Story 3 (P3)**: Can start ONLY after User Story 2 is complete - Documents fixes after they're made

### Within Each User Story

- Investigation before implementation
- Root cause identification before fix implementation
- Fix implementation before verification
- Verification before moving to next test
- Story complete before moving to next priority

### Parallel Opportunities

- Setup tasks marked [P] can run in parallel (T002-T006)
- Foundational evaluation tasks can run sequentially (must identify first test before evaluating)
- Within User Story 1: Investigation tasks can run sequentially (must trace before analyzing)
- Within User Story 2: Each test failure must be fixed sequentially (one at a time)
- Documentation tasks marked [P] can run in parallel (T072-T078)

---

## Parallel Example: User Story 1

```bash
# Investigation phase (sequential):
Task: "Trace execution path: identify where test gets stuck using Playwright trace viewer"
Task: "Run test with trace: npx playwright test --trace=on [test-file]"
Task: "Analyze trace output: identify exact point where execution fails"

# Fix implementation (sequential):
Task: "Implement fix addressing root cause (not symptom) in identified source file"
Task: "Verify fix does NOT add timeouts, delays, or workarounds"

# Verification (sequential):
Task: "Run first failing test in isolation: npx playwright test [test-file]"
Task: "Verify previously passing tests still pass: run full test suite"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all fixes)
3. Complete Phase 3: User Story 1 (Fix first test failure)
4. **STOP and VALIDATE**: Verify first test passes independently
5. Document learnings before proceeding

### Incremental Delivery

1. Complete Setup + Foundational → First test identified and evaluated
2. Fix User Story 1 → Test passes → Document root cause (MVP!)
3. Fix User Story 2 (first remaining test) → Test passes → Document root cause
4. Fix User Story 2 (second remaining test) → Test passes → Document root cause
5. Continue until all tests pass
6. Complete User Story 3 → Document all fixes
7. Each fix adds value without breaking previous fixes

### Sequential Strategy (Required)

This feature REQUIRES sequential execution:
- Must fix tests one at a time
- Must verify each fix before moving to next
- Cannot parallelize test fixes (they may share root causes)
- Documentation can happen in parallel after fixes are complete

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **CRITICAL**: Never add timeouts, delays, or workarounds to mask bugs (Constitution Principle X)
  - ✅ **Legitimate**: Setting reasonable timeout values for operations that legitimately take time (network requests, page loads)
  - ✅ **Legitimate**: Using Playwright's built-in wait strategies appropriately (`waitForLoadState`, `waitForFunction`)
  - ❌ **Prohibited**: Using timeouts to mask bugs or symptoms
  - See `.cursor/notes/root-cause-analysis.md` for detailed guidance on legitimate vs illegitimate timeout usage
- **CRITICAL**: Always investigate root cause before fixing (`.cursor/notes/root-cause-analysis.md`)
- **CRITICAL**: Use tentative language until fixes are proven (`.cursor/notes/modesty.md`)
- Verify each test passes before moving to next
- Commit after each test fix is verified
- Stop at any checkpoint to validate story independently
- Avoid: workarounds, parallel test fixes, claiming fixes before verification

