# Auth Setup Timeout Investigation

**Date**: 2025-01-XX  
**Issue**: `tests/auth.setup.js` times out at 60 seconds during `supabase.auth.signInWithPassword()`

## Step 1: Error Logs Analysis

### What Exactly Is Failing?
- **Error**: `Test timeout of 60000ms exceeded`
- **Location**: `tests/auth.setup.js:73` - `await supabase.auth.signInWithPassword()`
- **Test**: `authenticate` setup test
- **Failure condition**: The `signInWithPassword()` call never completes (hangs indefinitely)

### Failure Type
- **Type**: Timeout (operation never completes)
- **Consistency**: Persistent (user reports it's been happening throughout project)
- **Environment**: Both local and CI (based on user feedback)

### Patterns Observed
- **Logs show**: "Starting Supabase auth: signInWithPassword" ✅
- **Logs missing**: "Supabase auth completed" ❌
- **Network logs**: NO `[NET]` logs for Supabase requests ❌
- **Exception logs**: NO exception thrown ❌

### Execution Context
- **Environment**: Node.js (not browser)
- **Critical insight**: Supabase client runs in Node.js, making HTTP requests directly
- **Network monitoring**: `page.on('response')` only catches browser requests, NOT Node.js HTTP requests

## Step 2: Execution Path Analysis

### Where Does Code Get Stuck?
- **Function**: `supabase.auth.signInWithPassword()`
- **Line**: 73
- **Condition**: The promise never resolves or rejects

### Call Stack
```
test('authenticate')
  → createClient(supabaseUrl, supabaseKey)
  → supabase.auth.signInWithPassword({ email, password })
    → [HANGS HERE - never completes]
```

### Conditions for Success
- Supabase API must be reachable from Node.js
- Network connectivity must exist
- DNS resolution must work
- Supabase service must respond
- Credentials must be valid

### What Prevents Success?
**Hypothesis 1**: Network request never initiates
- DNS resolution hangs
- Connection establishment hangs
- Node.js fetch/HTTP client has issue

**Hypothesis 2**: Network request initiates but never completes
- Request sent but no response received
- Firewall/proxy blocking
- Supabase service issue

**Hypothesis 3**: Supabase client library issue
- Library bug causing hang
- Configuration issue
- Version incompatibility

## Step 3: Root Cause Hypotheses

### Why Would signInWithPassword Hang?

**Hypothesis A: DNS Resolution Issue**
- **Why**: Node.js DNS lookup hangs
- **Evidence needed**: Check DNS resolution time
- **Test**: Try IP address instead of hostname

**Hypothesis B: Network Connectivity Issue**
- **Why**: Node.js can't reach Supabase API
- **Evidence needed**: Check if other network requests work
- **Test**: Try curl/wget to Supabase API

**Hypothesis C: Supabase Client Library Issue**
- **Why**: Library has bug or misconfiguration
- **Evidence needed**: Check library version, configuration
- **Test**: Try different Supabase client version

**Hypothesis D: Environment Variable Issue**
- **Why**: URL or key malformed, causing client to hang
- **Evidence needed**: Verify env vars are correct
- **Test**: Log actual values (sanitized)

**Hypothesis E: Node.js Fetch/HTTP Client Issue**
- **Why**: Node.js HTTP client has timeout/connection issue
- **Evidence needed**: Check Node.js version, fetch implementation
- **Test**: Try explicit timeout, different HTTP client

## Step 4: Investigation Plan

### Immediate Diagnostic Steps

1. **Add explicit timeout to signInWithPassword**
   ```javascript
   const timeoutPromise = new Promise((_, reject) => 
     setTimeout(() => reject(new Error('Auth timeout after 10s')), 10000)
   );
   const result = await Promise.race([
     supabase.auth.signInWithPassword({ email, password }),
     timeoutPromise
   ]);
   ```
   **Purpose**: Determine if it's truly hanging or just slow

2. **Add network-level diagnostics**
   ```javascript
   // Before signInWithPassword
   console.log('[DIAG] Supabase URL:', supabaseUrl);
   console.log('[DIAG] Node.js version:', process.version);
   console.log('[DIAG] Testing DNS resolution...');
   const dnsStart = Date.now();
   const { lookup } = require('dns').promises;
   const hostname = new URL(supabaseUrl).hostname;
   await lookup(hostname);
   console.log('[DIAG] DNS resolved in:', Date.now() - dnsStart, 'ms');
   ```

3. **Test direct HTTP request**
   ```javascript
   // Test if we can reach Supabase at all
   const fetch = require('node-fetch'); // or use built-in fetch in Node 18+
   const testUrl = `${supabaseUrl}/rest/v1/`;
   console.log('[DIAG] Testing direct HTTP request to:', testUrl);
   const httpStart = Date.now();
   try {
     const response = await fetch(testUrl, {
       headers: { 'apikey': supabaseKey },
       signal: AbortSignal.timeout(5000)
     });
     console.log('[DIAG] HTTP request completed:', response.status, 'in', Date.now() - httpStart, 'ms');
   } catch (e) {
     console.log('[DIAG] HTTP request failed:', e.message);
   }
   ```

4. **Check Supabase client configuration**
   ```javascript
   // Log client configuration
   console.log('[DIAG] Supabase client config:', {
     url: supabaseUrl,
     keyLength: supabaseKey.length,
     authConfig: { autoRefreshToken: false, persistSession: false }
   });
   ```

5. **Add request/response interceptors** (if Supabase client supports it)
   - Check if Supabase client has debug mode
   - Check if we can intercept internal HTTP requests

### Deeper Investigation Steps

6. **Check Node.js HTTP agent settings**
   - Default timeouts might be too high
   - Connection pool might be exhausted

7. **Check for proxy/firewall issues**
   - Corporate proxy blocking requests
   - Local firewall rules

8. **Check Supabase service status**
   - Is Supabase API actually reachable?
   - Are there known outages?

9. **Try alternative authentication method**
   - Use browser-based auth instead of Node.js
   - Use different Supabase client version

10. **Check for resource exhaustion**
    - Too many concurrent requests?
    - Memory/CPU issues?

## Step 5: Alternative Approaches

### If Root Cause Is Network-Related

**Option A: Use browser-based auth**
- Navigate to login page
- Fill form and submit
- Extract session from browser
- **Pros**: Works around Node.js network issues
- **Cons**: Slower, more brittle

**Option B: Add explicit HTTP client timeout**
- Configure Supabase client with custom fetch
- Set explicit timeouts
- **Pros**: Fails fast instead of hanging
- **Cons**: Doesn't fix root cause

**Option C: Pre-authenticate outside test**
- Run auth setup separately
- Cache auth state
- **Pros**: Faster tests
- **Cons**: More complex setup

### If Root Cause Is Supabase Client Library

**Option A: Downgrade/upgrade library**
- Try different version
- Check changelog for known issues

**Option B: Use different auth method**
- Direct REST API calls instead of SDK
- **Pros**: More control
- **Cons**: More code to maintain

## Next Steps

1. ✅ Add diagnostic logging to identify where it hangs
2. ✅ Test DNS resolution separately
3. ✅ Test direct HTTP request to Supabase
4. ✅ Add explicit timeout to fail fast
5. ⏳ Based on diagnostics, determine root cause
6. ⏳ Implement fix based on root cause

## Key Insight

**The Supabase client runs in Node.js, not the browser.** This means:
- `page.on('response')` won't catch these requests
- Network issues affect Node.js HTTP client, not browser
- DNS/connectivity issues manifest differently
- Need Node.js-level diagnostics, not browser-level

