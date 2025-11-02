/**
 * Performance monitoring utilities
 * Measures render times, operation durations, and tracks performance metrics
 */

/**
 * Mark a performance measurement point
 * @param {string} name - Name of the performance mark
 */
export function mark(name) {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(name);
  }
}

/**
 * Measure time between two marks
 * @param {string} name - Name of the measurement
 * @param {string} startMark - Name of the start mark
 * @param {string} endMark - Name of the end mark
 * @returns {number|null} Duration in milliseconds, or null if measurement not available
 */
export function measure(name, startMark, endMark) {
  if (typeof performance !== 'undefined' && performance.measure) {
    try {
      // Avoid throwing in test/JSDOM when marks are missing
      const hasStart = !!performance.getEntriesByName?.(startMark)?.length;
      const hasEnd = !!performance.getEntriesByName?.(endMark)?.length;
      if (!hasStart || !hasEnd) {
        return null;
      }
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      return measure ? measure.duration : null;
    } catch (error) {
      // Only warn in development to keep CI logs clean
      if (typeof import !== 'undefined' && (import.meta?.env?.DEV)) {
        // eslint-disable-next-line no-console
        console.warn('Performance measurement failed:', error);
      }
      return null;
    }
  }
  return null;
}

/**
 * Get measurement duration
 * @param {string} name - Name of the measurement
 * @returns {number|null} Duration in milliseconds
 */
export function getMeasurement(name) {
  if (typeof performance !== 'undefined') {
    const entries = performance.getEntriesByName(name);
    if (entries.length > 0) {
      return entries[entries.length - 1].duration;
    }
  }
  return null;
}

/**
 * Clear performance marks and measures
 * @param {string} name - Optional name to clear specific mark/measure
 */
export function clearMarks(name) {
  if (typeof performance !== 'undefined' && performance.clearMarks) {
    if (name) {
      performance.clearMarks(name);
    }
  }
}

export function clearMeasures(name) {
  if (typeof performance !== 'undefined' && performance.clearMeasures) {
    if (name) {
      performance.clearMeasures(name);
    }
  }
}

/**
 * Measure async function execution time
 * @param {string} label - Label for the measurement
 * @param {Function} fn - Async function to measure
 * @returns {Promise} Result of the function with measurement logged
 */
export async function measureAsync(label, fn) {
  const startMark = `${label}-start`;
  const endMark = `${label}-end`;
  const measureName = `${label}-duration`;
  
  mark(startMark);
  
  try {
    const result = await fn();
    mark(endMark);
    const duration = measure(measureName, startMark, endMark);
    
    // Only log in development (when not in production build)
    if (duration !== null && import.meta.env?.DEV) {
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    }
    
    // Clean up marks
    clearMarks(startMark);
    clearMarks(endMark);
    clearMeasures(measureName);
    
    return result;
  } catch (error) {
    mark(endMark);
    const duration = measure(measureName, startMark, endMark);
    
    // Only log in development (when not in production build)
    if (duration !== null && import.meta.env?.DEV) {
      console.log(`⏱️ ${label} (failed): ${duration.toFixed(2)}ms`);
    }
    
    clearMarks(startMark);
    clearMarks(endMark);
    clearMeasures(measureName);
    
    throw error;
  }
}

/**
 * Measure sync function execution time
 * @param {string} label - Label for the measurement
 * @param {Function} fn - Function to measure
 * @returns {*} Result of the function with measurement logged
 */
export function measureSync(label, fn) {
  const startMark = `${label}-start`;
  const endMark = `${label}-end`;
  const measureName = `${label}-duration`;
  
  mark(startMark);
  
  try {
    const result = fn();
    mark(endMark);
    const duration = measure(measureName, startMark, endMark);
    
    // Only log in development (when not in production build)
    if (duration !== null && import.meta.env?.DEV) {
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    }
    
    clearMarks(startMark);
    clearMarks(endMark);
    clearMeasures(measureName);
    
    return result;
  } catch (error) {
    mark(endMark);
    const duration = measure(measureName, startMark, endMark);
    
    // Only log in development (when not in production build)
    if (duration !== null && import.meta.env?.DEV) {
      console.log(`⏱️ ${label} (failed): ${duration.toFixed(2)}ms`);
    }
    
    clearMarks(startMark);
    clearMarks(endMark);
    clearMeasures(measureName);
    
    throw error;
  }
}

/**
 * Performance thresholds for admin card management
 */
export const PERFORMANCE_THRESHOLDS = {
  TABLE_LOAD: 2000, // 2 seconds - SC-001
  SORT: 1000, // 1 second - SC-006
  FILTER: 50, // 50ms - SC-003
  CRUD_FEEDBACK: 500, // 500ms - SC-007
  TABLE_RENDER: 2000 // 2 seconds for 1000+ cards
};

/**
 * Check if performance metric meets threshold
 * @param {string} metric - Metric name
 * @param {number} duration - Duration in milliseconds
 * @returns {boolean} True if within threshold
 */
export function checkThreshold(metric, duration) {
  const threshold = PERFORMANCE_THRESHOLDS[metric.toUpperCase()];
  if (!threshold) return true; // No threshold defined, consider passing
  
  const passed = duration <= threshold;
  
  // Only log in development
  if (!passed && import.meta.env?.DEV) {
    console.warn(`⚠️ Performance threshold exceeded: ${metric} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`);
  }
  
  return passed;
}

