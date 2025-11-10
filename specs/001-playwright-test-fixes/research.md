# Research: Systematic Playwright Test Failure Resolution

**Feature**: 001-playwright-test-fixes  
**Date**: 2025-11-10  
**Purpose**: Consolidate research findings for root cause analysis approach

## Research Areas

### 1. Root Cause Analysis Techniques for Test Failures

**Decision**: Follow the mandatory process defined in `.cursor/notes/root-cause-analysis.md`

**Rationale**: 
- The project has explicit guidelines prohibiting workarounds
- Process requires: test evaluation → failure type determination → root cause investigation → fix root cause
- Assumes recent changes caused failures (systematic git history review)

**Key Techniques**:
- Trace execution paths step-by-step
- Identify specific conditions causing failures (not just symptoms)
- Review git history to find what changed
- Distinguish between app bugs and test design issues

**Alternatives Considered**:
- Adding timeouts/workarounds: **REJECTED** - violates Constitution Principle X
- Fixing multiple tests simultaneously: **REJECTED** - violates systematic approach requirement
- Assuming external causes: **REJECTED** - must assume our changes caused it first

**Patterns Identified**:
- Common failure types: timeouts, element not found, assertion failures
- Common root causes: race conditions, async timing, state initialization issues
- Debugging approach: trace from test → component → hook → service → API

### 2. Playwright Debugging Best Practices

**Decision**: Use Playwright's built-in debugging tools (trace viewer, inspector) and proper wait strategies

**Rationale**:
- Playwright provides trace viewer for detailed execution analysis
- Inspector allows step-by-step debugging
- Proper wait strategies prevent flaky tests

**Key Techniques**:
- Use `--trace=on` to capture execution traces
- Use `playwright show-trace` to analyze failures
- Prefer `domcontentloaded` over `networkidle` (networkidle can hang on continuous requests)
- Use `waitForFunction` for custom conditions (React hydration, state initialization)
- Use `page.waitForLoadState()` appropriately for page loads

**Alternatives Considered**:
- Increasing timeouts to mask bugs: **REJECTED** - masks symptoms, violates root cause principle
- Adding arbitrary delays: **REJECTED** - workaround, not solution
- Using networkidle everywhere: **REJECTED** - causes hangs on background requests

**Note on Timeouts**: Setting reasonable timeout values for operations that legitimately take time (e.g., 30 seconds for slow API calls, 60 seconds for complex page loads) is appropriate. The prohibition is against using timeouts to mask bugs or symptoms.

**Patterns Identified**:
- `domcontentloaded` is sufficient for most page loads
- `waitForFunction` needed for React-specific conditions (hydration, state)
- Trace viewer essential for understanding execution flow

### 3. React Authentication State Management Patterns

**Decision**: Investigate race conditions in auth initialization and prevent duplicate requests

**Rationale**:
- Auth state initialization involves multiple async operations
- Race conditions can cause UI to render before auth state is determined
- Duplicate requests slow down initialization and cause timeouts

**Key Patterns**:
- Use `loading` state to prevent premature rendering
- Track initialization completion to prevent race conditions
- Only check admin status on SIGNED_IN, not TOKEN_REFRESHED
- Ensure `loading` becomes false only after initialization completes

**Common Issues**:
- `TOKEN_REFRESHED` fires before `initializeAuth` completes → race condition
- `SIGNED_IN` fires before `initializeAuth` completes → race condition
- Multiple auth state change handlers setting `loading` independently → inconsistent state

**Solutions**:
- Use refs to track initialization completion
- Only set `loading = false` when initialization is complete
- Handle auth events appropriately based on initialization state

### 4. Supabase Auth Integration Patterns

**Decision**: Understand Supabase auth event timing and prevent duplicate queries

**Rationale**:
- Supabase fires auth events (SIGNED_IN, TOKEN_REFRESHED) during initialization
- Events can fire before initialization completes
- Duplicate `user_roles` queries slow down initialization

**Key Patterns**:
- `onAuthStateChange` subscription fires events immediately if session exists
- `TOKEN_REFRESHED` fires frequently (Supabase auto-refreshes tokens)
- Admin status doesn't change on token refresh → don't re-check
- Only check admin status on actual sign-in events

**Common Issues**:
- `TOKEN_REFRESHED` firing repeatedly → duplicate `isAdmin()` calls → duplicate `user_roles` queries
- Events firing before `initializeAuth` completes → race conditions
- Multiple components checking admin status simultaneously → duplicate queries

**Solutions**:
- Only check admin status on `SIGNED_IN`, not `TOKEN_REFRESHED`
- Track initialization completion to prevent race conditions
- Ensure single source of truth for auth state

## Consolidated Findings

### Root Cause Investigation Process

1. **Test Evaluation**:
   - What does the test verify?
   - Is it valuable?
   - Is it testing the right thing?

2. **Failure Type Determination**:
   - Real bug: App is broken → fix app
   - Test artifact: Test poorly designed → fix test or remove

3. **Root Cause Investigation**:
   - Assume recent changes caused it → review git history
   - Trace execution path → identify where it gets stuck
   - Identify specific condition → what prevents completion?

4. **Fix Root Cause**:
   - Fix underlying issue, not symptom
   - Make code work correctly, not just "not fail"
   - Verify fix works before moving to next

### Common Failure Patterns

1. **Auth Initialization Race Conditions**:
   - Symptoms: "Access Denied" flash, tabs not appearing
   - Root cause: `loading` becomes false before admin status determined
   - Fix: Proper initialization completion tracking

2. **Duplicate API Requests**:
   - Symptoms: Slow initialization, timeouts
   - Root cause: Multiple components/hooks querying same data
   - Fix: Prevent duplicate queries, use proper dependencies

3. **Element Visibility Issues**:
   - Symptoms: Element not found errors
   - Root cause: Elements not rendered yet, or rendered but not visible
   - Fix: Proper wait conditions, check rendering logic

4. **Async Timing Issues**:
   - Symptoms: Tests timing out waiting for conditions
   - Root cause: Conditions never become true, or take too long
   - Fix: Investigate why condition doesn't become true, fix underlying issue

### Debugging Tools and Techniques

1. **Playwright Trace Viewer**:
   - Run tests with `--trace=on`
   - Use `playwright show-trace` to analyze
   - Shows exact execution flow and timing

2. **Playwright Inspector**:
   - Use `--debug` flag to step through tests
   - Inspect page state at each step
   - Identify where execution diverges from expected

3. **Console Logging**:
   - Add diagnostic logging to identify execution flow
   - Log state changes, API calls, render cycles
   - Use to trace where things go wrong

4. **Git History Analysis**:
   - Review commits between last passing and first failing
   - Identify what changed that could cause failure
   - Focus on auth, rendering, and async code

## Next Steps

1. Begin with first failing test (admin-card-management.spec.js beforeEach hook)
2. Use trace viewer to understand execution flow
3. Review git history for recent changes
4. Trace execution path to identify root cause
5. Fix root cause, verify fix works
6. Move to next test only after first is fully resolved

