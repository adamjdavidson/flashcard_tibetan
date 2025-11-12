# Quickstart: Systematic Playwright Test Failure Resolution

**Feature**: 001-playwright-test-fixes  
**Date**: 2025-11-10

## Overview

This guide explains how to systematically investigate and fix Playwright test failures using root cause analysis, without adding workarounds.

## Prerequisites

- Playwright test suite with failing tests
- Access to test execution logs and error messages
- Git history access
- Understanding of `.cursor/notes/root-cause-analysis.md` process
- Understanding of `.cursor/notes/modesty.md` guidelines

## Step-by-Step Process

### Step 1: Select One Failing Test

**Action**: Identify the first/most critical failing test

**Example**:
```bash
# Run tests to see failures
npm run test:e2e

# Identify first failing test from output
# Example: admin-card-management.spec.js beforeEach hook timing out
```

**Checklist**:
- [ ] Test identified
- [ ] Failure message understood
- [ ] Test file located

### Step 2: Evaluate the Test

**Action**: Answer these questions before fixing anything

**Questions**:
1. What does this test actually verify?
2. Is this test valuable? Why?
3. Is it testing the right thing?
4. Is there a better way to test this?

**Example**:
- Test: `admin-card-management.spec.js` beforeEach hook
- Verifies: Admin page loads and shows tabs after authentication
- Value: Critical - ensures admin UI is accessible
- Testing right thing: Yes - core admin functionality
- Better way: Possibly - could check auth state directly instead of DOM

**Checklist**:
- [ ] Test purpose understood
- [ ] Test value confirmed
- [ ] Test design evaluated

### Step 3: Determine Failure Type

**Action**: Classify the failure

**Types**:
- **Real bug**: App is broken → fix the app
- **Test artifact**: Test poorly designed → fix test or remove

**Example**:
- Failure: Timeout waiting for admin tabs
- Type: Likely real bug (tabs should appear)
- Evidence: Test was passing before, recent changes introduced failure

**Checklist**:
- [ ] Failure type determined
- [ ] Evidence collected

### Step 4: Investigate Root Cause

**Action**: Trace execution and identify root cause

**Process**:
1. **Review git history**: What changed recently?
   ```bash
   git log --oneline --since="3 days ago" -- src/hooks/useAuth.js src/components/AdminPage.jsx
   ```

2. **Trace execution path**:
   - Test → `page.goto('/admin')` → AdminPage component → useAuth hook → auth check → render tabs
   - Identify where execution gets stuck

3. **Use debugging tools**:
   ```bash
   # Run with trace
   npx playwright test --project=chromium --trace=on tests/e2e/admin-card-management.spec.js
   
   # View trace
   npx playwright show-trace test-results/...
   ```

4. **Add diagnostic logging** (if needed):
   - Log state changes
   - Log API calls
   - Log render cycles

**Checklist**:
- [ ] Git history reviewed
- [ ] Execution path traced
- [ ] Root cause identified
- [ ] Specific condition causing failure understood

### Step 5: Fix Root Cause

**Action**: Implement fix that addresses root cause, not symptoms

**Rules**:
- ❌ NO timeouts, delays, or workarounds
- ✅ Fix the underlying issue
- ✅ Make code work correctly

**Example**:
- Root cause: `SIGNED_IN` handler sets `loading = false` before `initializeAuth` completes
- Fix: Only set `loading = false` when initialization is complete
- NOT: Add timeout to wait longer

**Checklist**:
- [ ] Root cause fixed (not symptom masked)
- [ ] No workarounds added
- [ ] Code works correctly

### Step 6: Verify Fix

**Action**: Confirm fix works before moving to next test

**Verification**:
```bash
# Run the specific test
npx playwright test tests/e2e/admin-card-management.spec.js

# Verify it passes
# Verify previously fixed tests still pass
```

**Checklist**:
- [ ] Test passes
- [ ] No regressions introduced
- [ ] Fix verified

### Step 7: Document (Optional)

**Action**: Document root cause and fix for future reference

**Documentation**:
- What was the root cause?
- How was it fixed?
- Why did this fix work?

## Common Patterns

### Pattern 1: Auth Initialization Race Condition

**Symptoms**: "Access Denied" flash, tabs not appearing, test timeouts

**Root Cause**: `loading` becomes false before admin status determined

**Investigation**:
1. Check `useAuth` hook initialization
2. Check auth state change handlers
3. Trace when `loading` becomes false vs when `isAdminUser` is set

**Fix**: Proper initialization completion tracking

### Pattern 2: Duplicate API Requests

**Symptoms**: Slow initialization, timeouts, many duplicate requests in logs

**Root Cause**: Multiple components/hooks querying same data

**Investigation**:
1. Check network logs for duplicate requests
2. Identify which components are making requests
3. Check useEffect dependencies

**Fix**: Prevent duplicate queries, use proper dependencies

### Pattern 3: Element Not Found

**Symptoms**: Element not found errors, test timeouts

**Root Cause**: Elements not rendered yet, or rendered but not visible

**Investigation**:
1. Check if element exists in DOM
2. Check if element is visible
3. Check rendering conditions

**Fix**: Proper wait conditions, check rendering logic

## Debugging Tools

### Playwright Trace Viewer

```bash
# Run with trace
npx playwright test --trace=on

# View trace
npx playwright show-trace test-results/[test-name]/trace.zip
```

**Use for**: Understanding exact execution flow and timing

### Playwright Inspector

```bash
# Run in debug mode
npx playwright test --debug
```

**Use for**: Step-by-step debugging, inspecting page state

### Console Logging

Add diagnostic logging to identify execution flow:
```javascript
console.log('[DEBUG] Auth state:', { loading, isAdminUser, user });
```

**Use for**: Tracing state changes and execution flow

## Red Flags - STOP IMMEDIATELY

If you catch yourself:
- Adding `setTimeout` or `waitForTimeout`
- Increasing test timeouts
- Adding delays "to let things settle"
- Using `Promise.race` with timeout
- Thinking "this might hang, so I'll add a timeout"

**STOP. You're adding a workaround. Investigate the root cause instead.**

## Next Steps

After fixing one test:
1. Verify it passes
2. Verify no regressions
3. Move to next failing test
4. Repeat process

## Resources

- `.cursor/notes/root-cause-analysis.md` - Mandatory process
- `.cursor/notes/modesty.md` - Tentative language guidelines
- `.specify/memory/constitution.md` - Principle X: Root Cause Analysis

