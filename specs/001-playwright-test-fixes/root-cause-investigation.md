# Root Cause Investigation - User Story 1

**Date**: 2025-11-10  
**Test**: `tests/e2e/admin-card-management.spec.js:54` - "sorts by a column (Type)"

## Root Cause Identified

**Location**: `src/hooks/useAuth.js` lines 78-132  
**Issue**: `Promise.race` with timeout wrapper - **PROHIBITED WORKAROUND**

### The Workaround

```javascript
const initializeAuth = async () => {
  // Add timeout to prevent hanging indefinitely
  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => resolve({ timedOut: true }), 10000); // 10 second timeout
  });

  const authPromise = (async () => {
    // ... auth initialization code ...
  })();

  // Race between auth initialization and timeout
  const result = await Promise.race([authPromise, timeoutPromise]);
  
  // If timeout occurred, ensure loading is false
  if (result?.timedOut) {
    console.warn('Auth initialization timed out after 10 seconds');
    setLoading(false);
    initializationComplete.current = true;
  }
};
```

### Why This Is a Workaround

1. **Violates Constitution Principle X**: Explicitly prohibits `Promise.race` with timeout promises
2. **Masks symptoms**: If auth initialization is hanging, this hides the hang rather than fixing it
3. **No root cause addressed**: Doesn't investigate WHY auth might hang
4. **Arbitrary timeout**: 10 seconds is arbitrary, not based on legitimate operation time

### What Should Happen Instead

1. **Investigate why auth might hang**: 
   - `getSession()` is a simple Supabase call - should complete quickly
   - `isAdmin()` is a database query - should complete quickly
   - If these hang, there's a real bug (network issue, Supabase config, etc.)

2. **Fix the root cause**:
   - If network issues: Handle network errors properly
   - If Supabase config issues: Handle configuration errors properly
   - If race conditions: Fix the race condition, don't timeout

3. **Remove the timeout wrapper**: The timeout is masking the real issue

## Investigation: Why Would Auth Hang?

Looking at the code:
- `getSession()` calls `supabase.auth.getSession()` - straightforward API call
- `isAdmin()` calls `supabase.from('user_roles').select()` - straightforward database query
- Both should complete in < 1 second normally

**Possible root causes if it hangs**:
1. Network connectivity issues (should error, not hang)
2. Supabase configuration issues (should error, not hang)
3. Race condition causing infinite loop (needs investigation)
4. Duplicate queries causing slowdown (observed 20+ `user_roles` queries)

## Fix Strategy

1. **Remove the timeout wrapper** (T025)
2. **Ensure proper error handling** - if auth fails, it should error, not hang
3. **Investigate duplicate queries** - 20+ `user_roles` queries suggest a loop or multiple components querying
4. **Verify auth initialization completes** - ensure `loading` becomes false correctly

## Next Steps

1. Remove `Promise.race` timeout wrapper
2. Add proper error handling for auth initialization
3. Investigate duplicate `user_roles` queries
4. Test that auth initialization completes correctly
5. Verify test passes after fix

