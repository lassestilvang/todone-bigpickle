/**
 * Utility functions for handling timeouts and async operations
 */

export class TimeoutError extends Error {
  constructor(message: string = 'Operation timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Wraps a promise with a timeout
 * @param promise The promise to wrap
 * @param timeoutMs Timeout in milliseconds
 * @param errorMessage Optional custom error message
 * @returns Promise that rejects with TimeoutError if timeout occurs
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage?: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new TimeoutError(errorMessage || `Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    })
  ]);
}

/**
 * Creates a debounced function that delays execution
 * @param func The function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Creates a throttled function that limits execution rate
 * @param func The function to throttle
 * @param limit Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Safe async operation with error handling and timeout
 * @param operation Async operation to perform
 * @param timeoutMs Optional timeout in milliseconds (default: 5000)
 * @param fallback Optional fallback value on error
 * @returns Result of operation or fallback
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  timeoutMs: number = 5000,
  fallback?: T
): Promise<T | undefined> {
  try {
    return await withTimeout(operation(), timeoutMs);
  } catch (error) {
    if (error instanceof TimeoutError) {
      console.warn('Operation timed out:', error.message);
    } else {
      console.error('Operation failed:', error);
    }
    
    if (fallback !== undefined) {
      return fallback;
    }
    
    return undefined;
  }
}