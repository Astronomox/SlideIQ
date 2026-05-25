/**
 * Error handling utilities for SlideIQ
 */

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  constructor(message, statusCode, originalError) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Get user-friendly error message from error object
 * @param {Error} error - Error object
 * @returns {string} User-friendly message
 */
export function getErrorMessage(error) {
  if (error instanceof ValidationError) {
    return error.message;
  }

  if (error instanceof APIError) {
    switch (error.statusCode) {
      case 400:
        return 'Invalid request. Please check your inputs.';
      case 401:
        return 'Authentication failed. Please log in again.';
      case 403:
        return 'You don\'t have permission for this action.';
      case 404:
        return 'The requested resource was not found.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }

  if (error instanceof TypeError) {
    if (error.message.includes('fetch')) {
      return 'Network error. Please check your connection.';
    }
  }

  // Generic fallback
  return error?.message || 'An unexpected error occurred. Please try again.';
}

/**
 * Log error to console with context
 * @param {string} context - Context string (e.g., 'QuizGeneration', 'Upload')
 * @param {Error} error - Error object
 * @param {Object} additionalInfo - Optional additional information to log
 */
export function logError(context, error, additionalInfo = {}) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [${context}] Error:`, {
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...additionalInfo,
  });

  // In production, you might want to send this to an error tracking service
  // Example: logErrorToSentry(context, error, additionalInfo);
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.initialDelay - Initial delay in ms (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in ms (default: 30000)
 * @returns {Promise} Result of function
 */
export async function retryWithBackoff(fn, options = {}) {
  const { maxRetries = 3, initialDelay = 1000, maxDelay = 30000 } = options;

  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx) except 408, 429
      if (error.statusCode >= 400 && error.statusCode < 500) {
        if (![408, 429].includes(error.statusCode)) {
          throw error;
        }
      }

      // Last attempt, throw error
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const exponentialDelay = initialDelay * Math.pow(2, attempt);
      const delay = Math.min(exponentialDelay, maxDelay);
      const jitter = Math.random() * delay * 0.1; // 10% jitter
      const totalDelay = delay + jitter;

      console.log(`[Retry] Attempt ${attempt + 1}/${maxRetries}, waiting ${Math.round(totalDelay)}ms`);
      await new Promise(resolve => setTimeout(resolve, totalDelay));
    }
  }

  throw lastError;
}

/**
 * Create a timeout promise that rejects after specified milliseconds
 * @param {number} ms - Milliseconds to wait
 * @param {string} message - Error message if timeout
 * @returns {Promise} Promise that rejects on timeout
 */
export function createTimeout(ms, message = 'Operation timed out') {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
}

/**
 * Race a promise against a timeout
 * @param {Promise} promise - Promise to race
 * @param {number} ms - Milliseconds before timeout
 * @param {string} message - Timeout error message
 * @returns {Promise} Whichever settles first
 */
export async function withTimeout(promise, ms, message = 'Operation timed out') {
  return Promise.race([
    promise,
    createTimeout(ms, message),
  ]);
}
