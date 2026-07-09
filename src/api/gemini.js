/**
 * Gemini API — drop-in replacement for claude.js
 * Quiz generation uses gemini-2.0-flash (large context, fast)
 * Feedback uses gemini-2.0-flash (low-latency, cheap)
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL      = 'gemini-2.0-flash';   // quiz generation
const FAST_MODEL = 'gemini-2.0-flash';   // feedback (same model, tiny prompts)

const PERSONALITY_DESCRIPTIONS = {
  vague:      'Vague — You wander the topic. You half-explain things and leave students guessing. Your questions are confusing and your feedback is noncommittal. You rarely say what you actually mean.',
  harsh:      'Harsh — You use tough love with zero sugar-coating. You call out wrong answers directly and show no sympathy for errors. If a student didn\'t read the slides, you make it obvious. You are blunt, cutting, and demanding.',
  fail:       'Out to Fail You — You write trick questions, include out-of-syllabus traps, and use deliberately ambiguous phrasing designed to expose weakness. You want students to fall. Your feedback after wrong answers is smug and unsurprised.',
  nice:       'Nice — You are warm, gentle, and encouraging. You explain carefully, celebrate effort, and even redirect wrong answers kindly. You want every student to feel capable and supported.',
  easy:       'Very Easy — You ask simple, surface-level questions with plain phrasing. Your questions are confidence-boosters. You never challenge, never trick. Students should feel good after every question.',
  reassuring: 'Reassuring — You are warm and steady. You acknowledge difficulty and reframe mistakes as stepping stones. After wrong answers you pick the student up. You are their academic support system.',
  cheap:      'Cheap — You made minimal effort. Your questions are recycled, surface-level, lazily phrased. You probably wrote this on the bus. Your feedback is terse and careless.',
  harvard:    'Harvard Grade — You hold students to an elite, internationally benchmarked standard. Precise terminology is required. Mastery is the floor, not the goal. Your feedback after wrong answers is curt and exacting.',
};

const PERSONALITY_HINTS = {
  vague:      'Vague, noncommittal, wandering. Never direct.',
  harsh:      'Blunt, tough love, no sympathy. Direct and cutting.',
  fail:       'Smug, unsurprised by failure. Subtly gloating.',
  nice:       'Warm, encouraging, kind even when wrong.',
  easy:       'Cheerful, supportive, always positive.',
  reassuring: 'Steady, picks you up, reframes mistakes as growth.',
  cheap:      'Terse, minimal effort, careless.',
  harvard:    'Exacting, measured, elite standards.',
};

/** Hit the Gemini generateContent endpoint */
async function callGemini(model, { system, prompt, maxTokens = 8192, temperature = 0.7 }) {
  const url = `${BASE}/${model}:generateContent?key=${GEMINI_API_KEY}`;

  const body = {
    ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned an empty response.');
  return text.trim();
}

/** Quiz generation — identical signature to the Claude version */
export async function generateQuizContent({ pdfText, personality, mcqCount, theoryCount }) {
  const personalityDesc = PERSONALITY_DESCRIPTIONS[personality.id] || personality.title;

  const estimatedTokens = 600 + mcqCount * 140 + theoryCount * 280;
  const maxTokens = Math.min(Math.max(estimatedTokens + 800, 3072), 16000);
  const pdfBudget  = Math.max(8000, 60000 - mcqCount * 600 - theoryCount * 900);

  const system = `You are a university lecturer: ${personalityDesc}

RULES (follow exactly):
- Base ALL questions ONLY on provided content. Never invent.
- Return ONLY valid JSON. No markdown fences, no preamble, no trailing text.
- Exactly ${mcqCount} MCQ questions, exactly ${theoryCount} theory questions.
- MCQ options: exactly A, B, C, D. One correct answer.
- Be concise. Short explanations, direct questions, tight answers.`;

  const prompt = `Lecture content below. Produce:
1. Brief 2-3 paragraph explanation in your personality voice
2. Exactly ${mcqCount} MCQ with 4 options
3. Exactly ${theoryCount} theory questions with model answers

JSON only — no other text:
{"explanation":"...","mcq":[{"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"answer":"A"}],"theory":[{"question":"...","modelAnswer":"..."}]}

CONTENT:
${pdfText.slice(0, pdfBudget)}`;

  const raw = await callGemini(MODEL, { system, prompt, maxTokens, temperature: 0.7 });

  // Strip accidental markdown fences
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('No JSON in Gemini response:', cleaned.slice(0, 400));
    throw new Error('Gemini returned invalid JSON. Please try again.');
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    console.error('JSON parse failed:', jsonMatch[0].slice(0, 400));
    throw new Error('Gemini returned malformed JSON. Please try again.');
  }
}

/** Feedback generation — identical signature to the Claude version */
export async function generateFeedback({ personality, question, userAnswer, correctAnswer, isCorrect, questionType }) {
  const hint = PERSONALITY_HINTS[personality.id] || personality.title;

  const prompt = `Personality: ${hint}
Question: ${question}
${questionType === 'mcq'
    ? `Correct: ${correctAnswer} | Student: ${userAnswer} | ${isCorrect ? 'CORRECT' : 'WRONG'}`
    : `Model answer: ${(correctAnswer || '').slice(0, 200)} | Student: ${(userAnswer || '').slice(0, 200)}`}

Write 2-3 sentences of feedback in this personality's voice. Return only the feedback text.`;

  return callGemini(FAST_MODEL, { prompt, maxTokens: 180, temperature: 0.8 });
}
