const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const MODEL = 'claude-sonnet-4-20250514';

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

export async function generateQuizContent({ pdfText, personality, mcqCount, theoryCount }) {
  const personalityDesc = PERSONALITY_DESCRIPTIONS[personality.id] || personality.title;

  const systemPrompt = `You are a university lecturer with this personality: ${personalityDesc}

Your task is to read lecture slide content and produce educational material in your personality voice.

CRITICAL RULES:
- Base ALL questions ONLY on the content provided. Never invent facts.
- Return ONLY valid JSON — no markdown, no code blocks, no explanation outside the JSON.
- The explanation must sound unmistakably like your personality voice.
- MCQ options must have exactly 4 choices (A, B, C, D) with exactly one correct answer.
- Theory model answers should be detailed and lecture-grounded.`;

  const userPrompt = `Based ONLY on the following lecture slide content, produce:
1. A 3-5 paragraph explanation of the main topics in your personality voice
2. ${mcqCount} MCQ questions with 4 options each
3. ${theoryCount} theory questions with detailed model answers

Return ONLY this JSON structure:
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
${pdfText.slice(0, 80000)}`;

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
      max_tokens: 8192,
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

  // Strip any accidental markdown code fences
  const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error('Claude returned invalid JSON. Please try again.');
  }
}

export async function generateFeedback({ personality, question, userAnswer, correctAnswer, isCorrect, questionType }) {
  const personalityDesc = PERSONALITY_DESCRIPTIONS[personality.id] || personality.title;

  const prompt = `You are a university lecturer with this personality: ${personalityDesc}

A student just answered a ${questionType} question.
Question: ${question}
${questionType === 'mcq' ? `Correct answer: ${correctAnswer}\nStudent's answer: ${userAnswer}` : `Model answer summary: ${correctAnswer?.slice(0, 300)}\nStudent's answer: ${userAnswer?.slice(0, 300)}`}
The student was: ${isCorrect ? 'CORRECT' : 'INCORRECT'}

Write a short (2-4 sentence) feedback response in your personality voice. Be authentic to your character. Return ONLY the feedback text, no JSON, no labels.`;

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
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) throw new Error('Feedback generation failed');
  const data = await response.json();
  return data.content[0].text.trim();
}
