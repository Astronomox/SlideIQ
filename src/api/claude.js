const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const MODEL = 'claude-sonnet-4-20250514';
const FAST_MODEL = 'claude-haiku-4-5-20251001'; // Fast model for feedback

const PERSONALITY_DESCRIPTIONS = {
  vague: 'Vague — You wander the topic. You half-explain things and leave students guessing. Your questions are confusing and your feedback is noncommittal. You rarely say what you actually mean.',
  harsh: 'Harsh — You use tough love with zero sugar-coating. You call out wrong answers directly and show no sympathy for errors. If a student didn\'t read the slides, you make it obvious. You are blunt, cutting, and demanding.',
  fail: 'Out to Fail You — You write trick questions, include out-of-syllabus traps, and use deliberately ambiguous phrasing designed to expose weakness. You want students to fall. Your feedback after wrong answers is smug and unsurprised.',
  nice: 'Nice — You are warm, gentle, and encouraging. You explain carefully, celebrate effort, and even redirect wrong answers kindly. You want every student to feel capable and supported.',
  easy: 'Very Easy — You ask simple, surface-level questions with plain phrasing. Your questions are confidence-boosters. You never challenge, never trick. Students should feel good after every question.',
  reassuring: 'Reassuring — You are warm and steady. You acknowledge difficulty and reframe mistakes as stepping stones. After wrong answers you pick the student up. You are their academic support system.',
  cheap: 'Cheap — You made minimal effort. Your questions are recycled, surface-level, lazily phrased. You probably wrote this on the bus. Your feedback is terse and careless.',
  harvard: 'Harvard Grade — You hold students to an elite, internationally benchmarked standard. Precise terminology is required. Mastery is the floor, not the goal. Your feedback after wrong answers is curt and exacting.',
};

// Compact personality hint for feedback calls — shorter = faster
const PERSONALITY_HINTS = {
  vague: 'Vague, noncommittal, wandering. Never direct.',
  harsh: 'Blunt, tough love, no sympathy. Direct and cutting.',
  fail: 'Smug, unsurprised by failure. Subtly gloating.',
  nice: 'Warm, encouraging, kind even when wrong.',
  easy: 'Cheerful, supportive, always positive.',
  reassuring: 'Steady, picks you up, reframes mistakes as growth.',
  cheap: 'Terse, minimal effort, careless.',
  harvard: 'Exacting, measured, elite standards.',
};

export async function generateQuizContent({ pdfText, personality, mcqCount, theoryCount }) {
  const personalityDesc = PERSONALITY_DESCRIPTIONS[personality.id] || personality.title;

  // Tight token budget — Sonnet is fast but we don't want to overshoot
  const estimatedOutputTokens = 600 + (mcqCount * 140) + (theoryCount * 280);
  const maxTokens = Math.min(Math.max(estimatedOutputTokens + 800, 3072), 16000);

  // PDF text budget — trim aggressively, Claude doesn't need the whole thing
  const pdfBudget = Math.max(8000, 60000 - (mcqCount * 600) - (theoryCount * 900));

  const systemPrompt = `You are a university lecturer: ${personalityDesc}

RULES (follow exactly):
- Base ALL questions ONLY on provided content. Never invent.
- Return ONLY valid JSON. No markdown fences, no preamble, no trailing text.
- Exactly ${mcqCount} MCQ questions, exactly ${theoryCount} theory questions.
- MCQ options: exactly A, B, C, D. One correct answer.
- Be concise. Short explanations, direct questions, tight answers.`;

  const userPrompt = `Lecture content below. Produce:
1. Brief 2-3 paragraph explanation in your personality voice
2. Exactly ${mcqCount} MCQ with 4 options
3. Exactly ${theoryCount} theory questions with model answers

JSON only — no other text:
{"explanation":"...","mcq":[{"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"answer":"A"}],"theory":[{"question":"...","modelAnswer":"..."}]}

CONTENT:
${pdfText.slice(0, pdfBudget)}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const raw = data.content[0].text.trim();

  // Strip any accidental markdown fences
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  // Find the JSON object in the response even if there's surrounding text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('No JSON found in Claude response:', cleaned.slice(0, 400));
    throw new Error('Claude returned invalid JSON. Please try again.');
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    console.error('JSON parse failed:', jsonMatch[0].slice(0, 400));
    throw new Error('Claude returned malformed JSON. Please try again.');
  }
}

// Feedback uses Haiku — 3-5x faster than Sonnet, much cheaper
export async function generateFeedback({ personality, question, userAnswer, correctAnswer, isCorrect, questionType }) {
  const hint = PERSONALITY_HINTS[personality.id] || personality.title;

  const prompt = `Personality: ${hint}
Question: ${question}
${questionType === 'mcq'
  ? `Correct: ${correctAnswer} | Student: ${userAnswer} | ${isCorrect ? 'CORRECT' : 'WRONG'}`
  : `Model answer: ${(correctAnswer || '').slice(0, 200)} | Student: ${(userAnswer || '').slice(0, 200)}`}

Write 2-3 sentences of feedback in this personality's voice. Return only the feedback text.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: FAST_MODEL,
      max_tokens: 180,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) throw new Error('Feedback generation failed');
  const data = await response.json();
  return data.content[0].text.trim();
}
