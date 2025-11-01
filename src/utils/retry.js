/**
 * Retry utility for API calls with exponential backoff
 * Handles network errors, timeouts, and transient failures
 */

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - The async function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.initialDelay - Initial delay in ms (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in ms (default: 10000)
 * @param {number} options.backoffMultiplier - Backoff multiplier (default: 2)
 * @param {Function} options.shouldRetry - Function to determine if error should be retried (optional)
 * @returns {Promise} - Result of the function
 */
export async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    shouldRetry = (error) => {
      // Retry on network errors, timeouts, and 5xx errors
      if (!error) return false;
      
      // Network errors
      if (error.message?.includes('network') || 
          error.message?.includes('fetch') ||
          error.message?.includes('timeout')) {
        return true;
      }
      
      // Supabase errors that might be transient
      if (error.code === 'PGRST301' || // Too many requests
          error.code === 'PGRST302' || // Service unavailable
          error.status === 429 || // Rate limit
          error.status >= 500) { // Server errors
        return true;
      }
      
      // Don't retry validation errors (4xx except 429)
      if (error.status >= 400 && error.status < 500 && error.status !== 429) {
        return false;
      }
      
      return false;
    }
  } = options;

  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry this error
      if (attempt < maxRetries && shouldRetry(error)) {
        // Calculate delay with exponential backoff
        const delay = Math.min(
          initialDelay * Math.pow(backoffMultiplier, attempt),
          maxDelay
        );
        
        console.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms:`, error.message);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // Don't retry or max retries reached
        break;
      }
    }
  }
  
  // All retries exhausted
  throw lastError;
}

/**
 * Retry a Supabase query with exponential backoff
 * @param {Function} queryFn - Function that returns a Supabase query
 * @param {Object} options - Retry options (same as retryWithBackoff)
 * @returns {Promise} - Query result
 */
export async function retrySupabaseQuery(queryFn, options = {}) {
  return retryWithBackoff(async () => {
    const { data, error } = await queryFn();
    
    if (error) {
      // Create error object that shouldRetry can check
      const errorObj = {
        ...error,
        message: error.message,
        code: error.code,
        status: error.status || (error.code ? parseInt(error.code) : null)
      };
      throw errorObj;
    }
    
    return { data, error: null };
  }, options);
}

