/**
 * Client-side API wrapper for calling backend functions
 * Handles authentication and error management
 */

import { withTimeout, APIError, logError } from '../utils/errors';

const API_TIMEOUT_MS = 120000; // 2 minutes for long operations

/**
 * Call the quiz generation endpoint
 * @param {string} idToken - Firebase ID token for authentication
 * @param {string} pdfText - Extracted PDF text
 * @param {string} personality - Personality ID
 * @param {number} mcqCount - Number of MCQ questions
 * @param {number} theoryCount - Number of theory questions
 * @returns {Promise<Object>} Quiz data with explanation, mcq, and theory
 */
export async function generateQuizContent({ idToken, pdfText, personality, mcqCount, theoryCount }) {
  const context = 'generateQuizContent';

  try {
    // Wrap fetch with timeout
    const fetchPromise = fetch('/api/generate-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        pdfText,
        personality: personality.id || personality,
        mcqCount,
        theoryCount,
      }),
    });

    const response = await withTimeout(
      fetchPromise,
      API_TIMEOUT_MS,
      'Quiz generation timed out. Please try again.'
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      const apiError = new APIError(
        error.error || `HTTP ${response.status}`,
        response.status,
        error
      );
      throw apiError;
    }

    const result = await response.json();
    if (!result.success) {
      throw new APIError(result.error || 'Unknown error', 500, result);
    }

    return result.data;
  } catch (error) {
    logError(context, error, { mcqCount, theoryCount, personality });
    throw error;
  }
}

/**
 * Call the feedback generation endpoint
 * @param {string} idToken - Firebase ID token for authentication
 * @param {string} personality - Personality ID
 * @param {string} question - The question text
 * @param {string} userAnswer - User's answer
 * @param {string} correctAnswer - Correct answer
 * @param {string} feedbackContext - PDF context for feedback
 * @returns {Promise<string>} Feedback text
 */
export async function generateFeedback({
  idToken,
  personality,
  question,
  userAnswer,
  correctAnswer,
  feedbackContext,
}) {
  const context = 'generateFeedback';

  try {
    const fetchPromise = fetch('/api/generate-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        personality: personality.id || personality,
        question,
        userAnswer,
        correctAnswer,
        context: feedbackContext,
      }),
    });

    const response = await withTimeout(
      fetchPromise,
      API_TIMEOUT_MS,
      'Feedback generation timed out. Please try again.'
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      const apiError = new APIError(
        error.error || `HTTP ${response.status}`,
        response.status,
        error
      );
      throw apiError;
    }

    const result = await response.json();
    if (!result.success) {
      throw new APIError(result.error || 'Unknown error', 500, result);
    }

    return result.data.feedback;
  } catch (error) {
    logError(context, error, { question, personality });
    throw error;
  }
}
