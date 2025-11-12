# Root Cause Analysis - Mandatory Process

**⚠️ SEE ALSO**: `.cursor/rules/error-investigation.mdc` - **MANDATORY CHECKLIST** that must be completed before ANY fixes.

## CRITICAL RULE: NO WORKAROUNDS - EVER

**NEVER add timeouts, delays, or workarounds to "fix" test failures.**

**This is the #1 violation that must never happen again.**

**When ANY error logs or test failures are provided, you MUST follow the mandatory checklist in `.cursor/rules/error-investigation.mdc` BEFORE making any changes.**

### Important Distinction: Legitimate Timeouts vs Workarounds

**✅ LEGITIMATE timeout usage** (these are fine):
- Setting reasonable timeout values for operations that legitimately take time:
  - Network requests (e.g., API calls that might take 30 seconds)
  - Page loads (e.g., complex pages that might take 60 seconds)
  - File operations (e.g., large file uploads/downloads)
  - These are about defining "how long is reasonable to wait" for operations that SHOULD complete
- Using Playwright's built-in wait strategies appropriately:
  - `page.waitForLoadState('domcontentloaded')` - waiting for DOM to load
  - `page.waitForFunction()` - waiting for specific conditions to become true
  - `locator.waitFor()` - waiting for elements to appear
  - These are about waiting for things that SHOULD happen

**❌ ILLEGITIMATE timeout usage** (these are workarounds):
- Increasing timeouts because tests are timing out due to bugs
- Adding delays/timeouts to "let things settle" when the real issue is race conditions
- Using timeouts to wait for conditions that should already be true but aren't due to bugs
- Adding `setTimeout` or `waitForTimeout` to handle timing issues caused by bugs
- These are about masking symptoms rather than fixing root causes

**Key Question**: "Am I setting a timeout because this operation legitimately takes time, or because there's a bug causing it to take too long?"

If you find yourself thinking:
- "I'll add a timeout to prevent hanging" (when hanging indicates a bug)
- "I'll increase the wait time" (because something isn't happening that should)
- "I'll add a delay to let things settle" (when things should already be settled)
- "I'll add a Promise.race with a timeout" (to mask a bug)
- "I'll wrap it in a timeout wrapper" (to handle a failure mode)

**STOP IMMEDIATELY. This is a workaround, not a solution.**

**If you add ANY timeout, delay, or workaround to mask a bug, you have FAILED the task.**

## Mandatory Process

### Step 1: Test Evaluation
Before fixing anything, ask:
- What does this test actually verify?
- Is this test valuable? Why?
- Is it testing the right thing?
- Is there a better way to test this?

### Step 2: Determine Failure Type
- **Real bug**: The app is broken, fix the app
- **Test artifact**: The test is poorly designed, fix the test (or remove it)

### Step 3: Root Cause Investigation
**Assume YOUR recent changes caused the failure.**

1. **What changed?**
   - Review git history for recent changes
   - What did YOU change that could cause this?

2. **Why would it hang/fail?**
   - Don't assume "it might hang" - investigate WHY it would hang
   - What specific condition causes the failure?
   - What code path leads to the failure?

3. **Trace execution**
   - Step through the code execution path
   - Where does it get stuck?
   - What condition prevents completion?

### Step 4: Fix Root Cause
- Fix the underlying issue, not the symptom
- Make the code work correctly, not just "not fail"
- If you can't find the root cause, investigate more - don't add workarounds

## Examples

❌ **BAD (Workaround)**: "Tests are timing out, so I'll add a 10-second timeout to prevent hanging"
✅ **GOOD (Root Cause)**: "Tests are timing out. Let me investigate why `initializeAuth` might hang. What changed recently? What condition causes it to not complete?"

❌ **BAD (Workaround)**: "The test waits for elements that aren't appearing, so I'll increase the timeout"
✅ **GOOD (Root Cause)**: "The test waits for elements that aren't appearing. Why aren't they appearing? What prevents them from rendering? What changed in the rendering logic?"

✅ **GOOD (Legitimate Timeout)**: "This API call can take up to 30 seconds in slow network conditions, so I'll set the timeout to 30 seconds"
✅ **GOOD (Legitimate Timeout)**: "This page load can take up to 60 seconds for complex pages, so I'll set page load timeout to 60 seconds"
❌ **BAD (Workaround)**: "This API call is timing out because of a bug, so I'll increase the timeout to 60 seconds"

## When You're Stuck

If you can't find the root cause:
1. **Investigate more** - don't give up and add a workaround
2. **Ask for help** - explain what you've investigated and what you don't understand
3. **Propose removing the test** - if it's not valuable, remove it rather than work around it

## Red Flags - IMMEDIATE STOP SIGNALS

If you catch yourself:
- Adding `setTimeout` or `waitForTimeout` to "fix" timing issues caused by bugs
- Increasing timeouts in tests because they're timing out due to bugs
- Adding delays "to let things settle" when things should already be settled
- Adding `Promise.race` with a timeout promise to mask bugs
- Wrapping code in timeout wrappers to handle failure modes
- Adding try/catch to "handle" errors without understanding why they occur
- Thinking "this might hang, so I'll add a timeout" (when hanging indicates a bug)

**STOP IMMEDIATELY. You're adding a workaround. This violates the core principle.**

**Exception**: If you're setting a timeout because an operation legitimately takes time (e.g., "this API call can take up to 30 seconds"), that's fine. The key is: are you accommodating legitimate timing, or masking a bug?

**Before implementing ANY solution, ask yourself:**
1. "Am I fixing the root cause or masking a symptom?"
2. "Would this solution work if the underlying issue didn't exist?"
3. "Am I adding code to handle a failure mode instead of preventing it?"

If the answer to #1 is "masking a symptom" or #2 is "no" or #3 is "yes", **STOP. You're doing it wrong.**

