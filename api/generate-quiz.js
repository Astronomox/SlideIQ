import Anthropic from '@anthropic-ai/sdk';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  });
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const PERSONALITY_DESCRIPTIONS = {
  vague: 'Vague — You wander the topic. You half-explain things and leave students guessing. Your questions are confusing and your feedback is noncommittal. You rarely say what you actually mean.',
  harsh: 'Harsh — You use tough love with zero sugar-coating. You call out wrong answers directly and show no sympathy for errors. If a student didn\'t read the slides, you make it obvious. You are blunt, cutting, and demanding.',
  fail: 'Out to Fail You — You write trick questions, include out-of-syllabus traps, and use deliberately ambiguous phrasing designed to expose weakness. You want students to fall. Your feedback after wrong answers is smug and unsurprised.',
  nice: 'Nice — You are warm, gentle, and encouraging. You explain carefully, celebrate effort, and even redirect wrong answers kindly. You want every student to feel capable and supported.',
  easy: 'Very Easy — You ask simple, surface-level questions with plain phrasing. Your questions are confidence-boosters. You never challenge, never trick. Students should feel good after every question.',
  reassuring: 'Reassuring — You are warm and steady. You acknowledge difficulty and reframe mistakes as stepping stones. After wrong answers you pick the student up. You are their academic support system.',
  cheap: 'Cheap — You made minimal effort. Your questions are recycled, surface-level, lazily phrased. You probably wrote this on the bus. Your feedback is terse and careless.',
  harvard: 'Harvard Grade — You hold students to an elite, internationally benchmarked standard. Precise terminology is required. Mastery is the floor, not the goal. Your feedback after wrong answers is curt and exacting. Your feedback after correct answers is measured approval, never effusive.',
};

/**
 * Verify Firebase ID token and extract user info
 */
async function verifyFirebaseToken(authHeader) {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.slice(7);
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error(`Invalid token: ${error.message}`);
  }
}

/**
 * Validate request input
 */
function validateInput(mcqCount, theoryCount, personality) {
  if (!Number.isInteger(mcqCount) || mcqCount < 1 || mcqCount > 60) {
    throw new Error('MCQ count must be between 1 and 60');
  }
  if (!Number.isInteger(theoryCount) || theoryCount < 1 || theoryCount > 20) {
    throw new Error('Theory count must be between 1 and 20');
  }
  if (!personality || !Object.keys(PERSONALITY_DESCRIPTIONS).includes(personality)) {
    throw new Error(`Invalid personality: ${personality}`);
  }
}

/**
 * Parse and validate Claude's JSON response
 */
function parseAndValidateResponse(jsonStr) {
  try {
    const data = JSON.parse(jsonStr);
    
    // Validate structure
    if (!data.explanation || typeof data.explanation !== 'string') {
      throw new Error('Missing or invalid explanation');
    }
    if (!Array.isArray(data.mcq) || data.mcq.length === 0) {
      throw new Error('Missing or invalid MCQ array');
    }
    if (!Array.isArray(data.theory) || data.theory.length === 0) {
      throw new Error('Missing or invalid theory array');
    }

    // Validate MCQ structure
    for (const q of data.mcq) {
      if (!q.question || !q.options || !q.answer) {
        throw new Error('Invalid MCQ structure');
      }
      if (Object.keys(q.options).length !== 4) {
        throw new Error('MCQ must have exactly 4 options');
      }
    }

    // Validate theory structure
    for (const q of data.theory) {
      if (!q.question || !q.modelAnswer) {
        throw new Error('Invalid theory structure');
      }
    }

    return data;
  } catch (error) {
    throw new Error(`Failed to parse Claude response: ${error.message}`);
  }
}

/**
 * Main handler for quiz generation
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', process.env.VITE_APP_URL || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token,X-Requested-With,Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,X-Api-Version,Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify Firebase token
    const decodedToken = await verifyFirebaseToken(req.headers.authorization);

    // Extract and validate request body
    const { pdfText, personality, mcqCount, theoryCount } = req.body;

    if (!pdfText || typeof pdfText !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid pdfText' });
    }

    validateInput(mcqCount, theoryCount, personality);

    // Build prompts
    const personalityDesc = PERSONALITY_DESCRIPTIONS[personality];
    const estimatedOutputTokens = 800 + (mcqCount * 160) + (theoryCount * 320);
    const maxTokens = Math.min(Math.max(estimatedOutputTokens + 1000, 4096), 16000);
    const pdfBudget = Math.max(12000, 80000 - (mcqCount * 800) - (theoryCount * 1200));

    const systemPrompt = `You are a university lecturer with this personality: ${personalityDesc}

Your task is to read lecture slide content and produce educational material in your personality voice.

CRITICAL RULES:
- Base ALL questions ONLY on the content provided. Never invent facts.
- Return ONLY valid JSON — no markdown, no code blocks, no explanation outside the JSON.
- The explanation must sound unmistakably like your personality voice.
- MCQ options must have exactly 4 choices (A, B, C, D) with exactly one correct answer.
- Theory model answers should be detailed and lecture-grounded.
- You MUST produce exactly ${mcqCount} MCQ questions and exactly ${theoryCount} theory questions. Do not stop early.`;

    const userPrompt = `Based ONLY on the following lecture slide content, produce:
1. A 3-5 paragraph explanation of the main topics in your personality voice
2. Exactly ${mcqCount} MCQ questions with 4 options each
3. Exactly ${theoryCount} theory questions with detailed model answers

Return ONLY this JSON structure with no text before or after:
{
  "explanation": "3-5 paragraphs as a single string with paragraph breaks using \\n\\n",
  "mcq": [
    {
      "question": "...",
      "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "answer": "A"
    }
  ],
  "theory": [
    {
      "question": "...",
      "modelAnswer": "..."
    }
  ]
}

LECTURE SLIDE CONTENT:
${pdfText.slice(0, pdfBudget)}`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    // Extract text response
    const textContent = message.content.find(block => block.type === 'text');
    if (!textContent) {
      throw new Error('No text response from Claude');
    }

    // Parse and validate JSON
    const quizData = parseAndValidateResponse(textContent.text);

    // Return success
    return res.status(200).json({
      success: true,
      data: quizData,
      userId: decodedToken.uid,
    });
  } catch (error) {
    console.error('Quiz generation error:', error);

    // Determine appropriate error status code
    let statusCode = 500;
    let errorMessage = error.message;

    if (error.message.includes('Invalid token')) {
      statusCode = 401;
    } else if (error.message.includes('Missing') || error.message.includes('invalid')) {
      statusCode = 400;
    }

    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
    });
  }
}
