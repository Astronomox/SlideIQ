/**
 * Validation utilities for SlideIQ
 */

/**
 * Validate PDF file
 * @param {File} file - File to validate
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validatePDFFile(file) {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  // Check file type
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'Only PDF files are allowed' };
  }

  // Check file size (max 50MB)
  const MAX_SIZE = 50 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File is too large (max 50MB)' };
  }

  return { valid: true };
}

/**
 * Validate MCQ count
 * @param {number} count - MCQ count
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateMCQCount(count) {
  const num = Number(count);
  if (!Number.isInteger(num) || num < 1 || num > 60) {
    return { valid: false, error: 'MCQ count must be between 1 and 60' };
  }
  return { valid: true };
}

/**
 * Validate theory count
 * @param {number} count - Theory count
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateTheoryCount(count) {
  const num = Number(count);
  if (!Number.isInteger(num) || num < 1 || num > 20) {
    return { valid: false, error: 'Theory count must be between 1 and 20' };
  }
  return { valid: true };
}

/**
 * Validate personality selection
 * @param {Object|string} personality - Personality object or ID
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validatePersonality(personality) {
  const validPersonalities = ['vague', 'harsh', 'fail', 'nice', 'easy', 'reassuring', 'cheap', 'harvard'];
  const personId = personality?.id || personality;

  if (!personId || !validPersonalities.includes(personId)) {
    return { valid: false, error: 'Invalid personality selected' };
  }

  return { valid: true };
}

/**
 * Validate PDF text extraction
 * @param {string} pdfText - Extracted PDF text
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validatePDFText(pdfText) {
  if (!pdfText || typeof pdfText !== 'string') {
    return { valid: false, error: 'No text extracted from PDF' };
  }

  const trimmed = pdfText.trim();
  if (trimmed.length < 50) {
    return { valid: false, error: 'PDF content is too short to generate meaningful questions' };
  }

  return { valid: true };
}

/**
 * Sanitize and validate quiz response
 * @param {Object} quizData - Quiz data from API
 * @returns {Object} { valid: boolean, error?: string, data?: Object }
 */
export function validateQuizResponse(quizData) {
  try {
    if (!quizData) {
      return { valid: false, error: 'No quiz data received' };
    }

    // Validate structure
    if (!quizData.explanation || typeof quizData.explanation !== 'string') {
      return { valid: false, error: 'Invalid explanation format' };
    }

    if (!Array.isArray(quizData.mcq) || quizData.mcq.length === 0) {
      return { valid: false, error: 'No MCQ questions in response' };
    }

    if (!Array.isArray(quizData.theory) || quizData.theory.length === 0) {
      return { valid: false, error: 'No theory questions in response' };
    }

    // Validate MCQ structure
    for (let i = 0; i < quizData.mcq.length; i++) {
      const q = quizData.mcq[i];
      if (!q.question || typeof q.question !== 'string') {
        return { valid: false, error: `MCQ ${i + 1}: Missing question` };
      }
      if (!q.options || typeof q.options !== 'object') {
        return { valid: false, error: `MCQ ${i + 1}: Missing options` };
      }
      if (Object.keys(q.options).length !== 4) {
        return { valid: false, error: `MCQ ${i + 1}: Must have exactly 4 options` };
      }
      if (!q.answer || !['A', 'B', 'C', 'D'].includes(q.answer)) {
        return { valid: false, error: `MCQ ${i + 1}: Invalid answer` };
      }
    }

    // Validate theory structure
    for (let i = 0; i < quizData.theory.length; i++) {
      const q = quizData.theory[i];
      if (!q.question || typeof q.question !== 'string') {
        return { valid: false, error: `Theory ${i + 1}: Missing question` };
      }
      if (!q.modelAnswer || typeof q.modelAnswer !== 'string') {
        return { valid: false, error: `Theory ${i + 1}: Missing model answer` };
      }
    }

    return { valid: true, data: quizData };
  } catch (error) {
    return { valid: false, error: `Validation error: ${error.message}` };
  }
}

/**
 * Sanitize text to prevent XSS
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
export function sanitizeText(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Validate all quiz generation inputs
 * @param {Object} params - Parameters object
 * @returns {Object} { valid: boolean, errors?: Object }
 */
export function validateQuizGenerationInputs(params) {
  const errors = {};

  const pdfFileValidation = validatePDFFile(params.pdfFile);
  if (!pdfFileValidation.valid) {
    errors.pdfFile = pdfFileValidation.error;
  }

  const mcqValidation = validateMCQCount(params.mcqCount);
  if (!mcqValidation.valid) {
    errors.mcqCount = mcqValidation.error;
  }

  const theoryValidation = validateTheoryCount(params.theoryCount);
  if (!theoryValidation.valid) {
    errors.theoryCount = theoryValidation.error;
  }

  const personalityValidation = validatePersonality(params.personality);
  if (!personalityValidation.valid) {
    errors.personality = personalityValidation.error;
  }

  const pdfTextValidation = validatePDFText(params.pdfText);
  if (!pdfTextValidation.valid) {
    errors.pdfText = pdfTextValidation.error;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  };
}
