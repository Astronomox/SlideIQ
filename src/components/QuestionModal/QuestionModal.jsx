import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PersonaGlyph, Wordmark, IconX, IconArrow, IconCheck } from '../Icons/Icons';
import { generateFeedback } from '../../api/claude';

const FOIL = 'linear-gradient(135deg, #f3dc92 0%, #c9a84c 38%, #8e7426 72%, #d9be6a 100%)';

// Top progress bar + nav
function TopBar({ persona, phase, questionN, questionOf, progress, onExit }) {
  return (
    <div style={{
      position: 'sticky',
      top: 0,
      background: '#0a0f1e',
      padding: '20px 48px',
      borderBottom: '1px solid rgba(201,168,76,0.10)',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        {/* Left: wordmark + divider + persona */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <Wordmark size={18} />
          <span style={{ width: 1, height: 16, background: 'rgba(201,168,76,0.18)' }} />
          <span style={{ color: persona.accent, display: 'flex', alignItems: 'center' }}>
            <PersonaGlyph id={persona.id} size={20} />
          </span>
          <span style={{
            fontFamily: '"Source Serif 4", Georgia, serif',
            fontStyle: 'italic',
            fontSize: 13,
            color: persona.accent,
          }}>
            {persona.title}
          </span>
        </div>

        {/* Center progress bar */}
        <div style={{ flex: 2, height: 2, background: 'rgba(201,168,76,0.12)', position: 'relative', overflow: 'hidden' }}>
          <motion.div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, #8e7426, #c9a84c, #f3dc92)',
            }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          />
        </div>

        {/* Right: Q counter + exit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1, justifyContent: 'flex-end' }}>
          <span style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 11,
            letterSpacing: '0.14em',
            color: 'rgba(240,236,226,0.45)',
          }}>
            Q{String(questionN).padStart(2, '0')}/{String(questionOf).padStart(2, '0')} {phase === 'mcq' ? 'MCQ' : 'THEORY'}
          </span>
          <button
            onClick={onExit}
            style={{
              all: 'unset',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(240,236,226,0.4)',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#f0ece2'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,236,226,0.4)'}
          >
            Exit <IconX size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// MCQ option button
function MCQOption({ letter, text, selected, correct, showResult, onClick }) {
  let borderColor = 'rgba(201,168,76,0.18)';
  let bg = '#141b34';
  let badgeBorder = 'rgba(201,168,76,0.25)';
  let badgeColor = 'rgba(201,168,76,0.7)';

  if (showResult) {
    if (letter === correct) {
      borderColor = 'rgba(126,179,154,0.6)';
      bg = 'rgba(126,179,154,0.08)';
      badgeBorder = '#7eb39a';
      badgeColor = '#7eb39a';
    } else if (letter === selected && letter !== correct) {
      borderColor = 'rgba(156,43,43,0.6)';
      bg = 'rgba(156,43,43,0.08)';
      badgeBorder = '#9c2b2b';
      badgeColor = '#9c2b2b';
    }
  } else if (letter === selected) {
    borderColor = '#c9a84c';
    bg = 'rgba(201,168,76,0.10)';
    badgeBorder = '#c9a84c';
    badgeColor = '#c9a84c';
  }

  return (
    <motion.button
      whileHover={!showResult ? { borderColor: 'rgba(201,168,76,0.5)', backgroundColor: 'rgba(201,168,76,0.05)' } : {}}
      onClick={!showResult ? onClick : undefined}
      style={{
        all: 'unset',
        cursor: showResult ? 'default' : 'pointer',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '17px 20px',
        borderRadius: 8,
        background: bg,
        border: `1.5px solid ${borderColor}`,
        transition: 'all 0.18s',
      }}
    >
      {/* Letter badge */}
      <div style={{
        width: 34,
        height: 34,
        borderRadius: '50%',
        background: 'rgba(201,168,76,0.08)',
        border: `1px solid ${badgeBorder}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        fontSize: 14,
        fontWeight: 600,
        color: badgeColor,
        flexShrink: 0,
        transition: 'border-color 0.18s, color 0.18s',
      }}>
        {letter}
      </div>

      {/* Option text */}
      <span style={{
        fontFamily: '"Source Serif 4", Georgia, serif',
        fontSize: 15,
        color: 'rgba(240,236,226,0.8)',
        flex: 1,
        textAlign: 'left',
        lineHeight: 1.4,
      }}>
        {text}
      </span>

      {showResult && letter === correct && (
        <IconCheck size={17} stroke={2.5} style={{ color: '#7eb39a', flexShrink: 0 }} />
      )}
      {showResult && letter === selected && letter !== correct && (
        <IconX size={17} stroke={2.5} style={{ color: '#9c2b2b', flexShrink: 0 }} />
      )}
    </motion.button>
  );
}

// Feedback overlay (full screen modal)
function FeedbackOverlay({ isCorrect, feedback, loadingFeedback, onNext, isLast }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(10,15,30,0.96)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
        style={{
          background: '#141b34',
          border: '1px solid rgba(201,168,76,0.2)',
          borderRadius: 12,
          padding: 48,
          maxWidth: 520,
          width: '90%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
        }}
      >
        {/* Result icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.1 }}
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: isCorrect ? 'rgba(201,168,76,0.12)' : 'rgba(156,43,43,0.12)',
            border: `2px solid ${isCorrect ? '#c9a84c' : 'rgba(156,43,43,0.9)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isCorrect ? '#c9a84c' : 'rgba(156,43,43,0.9)',
            marginBottom: 20,
          }}
        >
          {isCorrect ? (
            <svg width={30} height={30} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <IconX size={30} stroke={2.5} />
          )}
        </motion.div>

        {/* CORRECT / INCORRECT label */}
        <div style={{
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          fontSize: 11,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: isCorrect ? '#c9a84c' : 'rgba(156,43,43,0.9)',
          marginBottom: 12,
        }}>
          {isCorrect ? 'Correct' : 'Incorrect'}
        </div>

        {/* Feedback text */}
        <div style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontStyle: 'italic',
          fontSize: 22,
          color: '#f0ece2',
          lineHeight: 1.4,
          marginBottom: 28,
          minHeight: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {loadingFeedback ? (
            <span style={{ color: 'rgba(240,236,226,0.45)', fontSize: 16 }}>Loading...</span>
          ) : (
            feedback ? `"${feedback}"` : ''
          )}
        </div>

        {/* Continue button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          style={{
            all: 'unset',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            width: '100%',
            padding: 14,
            background: FOIL,
            color: '#1a1305',
            fontFamily: '"Playfair Display", Georgia, serif',
            fontWeight: 700,
            fontSize: 15,
          }}
        >
          {isLast ? 'See results' : 'Next question'}
          <IconArrow size={16} />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default function QuestionModal({
  personality,
  mcqQuestions,
  theoryQuestions,
  onComplete,
  onExit,
}) {
  const totalQuestions = mcqQuestions.length + theoryQuestions.length;
  const [phase, setPhase] = useState('mcq');
  const [mcqIndex, setMcqIndex] = useState(0);
  const [theoryIndex, setTheoryIndex] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState([]);
  const [theoryAnswers, setTheoryAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [theoryText, setTheoryText] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [showFeedbackOverlay, setShowFeedbackOverlay] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const currentQuestion = phase === 'mcq'
    ? mcqQuestions[mcqIndex]
    : theoryQuestions[theoryIndex];

  const completedCount = mcqAnswers.length + theoryAnswers.length;
  const progress = completedCount / totalQuestions;

  const questionN = phase === 'mcq' ? mcqIndex + 1 : theoryIndex + 1;
  const questionOf = phase === 'mcq' ? mcqQuestions.length : theoryQuestions.length;

  const isLastQuestion = phase === 'theory'
    ? theoryIndex === theoryQuestions.length - 1
    : mcqIndex === mcqQuestions.length - 1 && theoryQuestions.length === 0;

  const fetchFeedback = async (question, userAnswer, correctAnswer, isCorrect, type) => {
    setLoadingFeedback(true);
    try {
      const text = await generateFeedback({
        personality,
        question: question.question,
        userAnswer,
        correctAnswer,
        isCorrect,
        questionType: type,
      });
      setFeedback(text);
    } catch {
      setFeedback(isCorrect ? 'Well answered.' : 'Review the material and try again.');
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleMCQConfirm = async () => {
    if (!selectedOption || showResult) return;
    const q = mcqQuestions[mcqIndex];
    const isCorrect = selectedOption === q.answer;
    setShowResult(true);
    setMcqAnswers(prev => [...prev, { selected: selectedOption, correct: q.answer, isCorrect }]);
    setFeedback(null);
    setShowFeedbackOverlay(true);
    await fetchFeedback(q, selectedOption, q.answer, isCorrect, 'mcq');
  };

  const handleNext = () => {
    setShowResult(false);
    setShowFeedbackOverlay(false);
    setFeedback(null);
    setSelectedOption(null);
    setTheoryText('');

    if (phase === 'mcq') {
      if (mcqIndex + 1 < mcqQuestions.length) {
        setMcqIndex(i => i + 1);
      } else if (theoryQuestions.length > 0) {
        setPhase('theory');
        setTheoryIndex(0);
      } else {
        handleComplete();
      }
    } else {
      if (theoryIndex + 1 < theoryQuestions.length) {
        setTheoryIndex(i => i + 1);
      } else {
        handleComplete();
      }
    }
  };

  const handleTheorySubmit = async () => {
    if (!theoryText.trim() || showResult) return;
    const q = theoryQuestions[theoryIndex];
    setShowResult(true);
    setTheoryAnswers(prev => [...prev, { answer: theoryText, modelAnswer: q.modelAnswer }]);
    setFeedback(null);
    setShowFeedbackOverlay(true);
    await fetchFeedback(q, theoryText, q.modelAnswer, true, 'theory');
  };

  const handleComplete = () => {
    const mcqScore = mcqAnswers.filter(a => a.isCorrect).length;
    onComplete({
      mcqAnswers,
      theoryAnswers,
      mcqScore,
      totalMCQ: mcqQuestions.length,
      totalTheory: theoryQuestions.length,
      mcqQuestions,
      theoryQuestions,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: '#0a0f1e',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {/* Vignette atmosphere */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 100% 60% at 50% 0%, rgba(201,168,76,0.04) 0%, transparent 60%),
          linear-gradient(to bottom, transparent 70%, rgba(0,0,0,0.3) 100%)
        `,
      }} />

      {/* Top bar */}
      <TopBar
        persona={personality}
        phase={phase}
        questionN={questionN}
        questionOf={questionOf}
        progress={progress}
        onExit={onExit}
      />

      {/* Question area */}
      <div style={{
        padding: '48px 48px 80px',
        maxWidth: 1100,
        margin: '0 auto',
        width: '100%',
        position: 'relative',
        zIndex: 1,
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${phase}-${phase === 'mcq' ? mcqIndex : theoryIndex}`}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* MCQ LAYOUT */}
            {phase === 'mcq' && currentQuestion && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.5fr',
                gap: 64,
                alignItems: 'start',
              }}>
                {/* Left column — question (sticky) */}
                <div style={{
                  position: 'sticky',
                  top: 80,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}>
                  {/* Eyebrow */}
                  <div style={{
                    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                    fontSize: 10,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: '#c9a84c',
                  }}>
                    Question {String(mcqIndex + 1).padStart(2, '0')}
                  </div>

                  {/* Question text */}
                  <h2 style={{
                    fontFamily: '"Playfair Display", Georgia, serif',
                    fontWeight: 600,
                    fontSize: 26,
                    color: '#f0ece2',
                    lineHeight: 1.4,
                  }}>
                    {currentQuestion.question}
                  </h2>

                  {/* Hint */}
                  <div style={{
                    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                    fontSize: 10,
                    letterSpacing: '0.14em',
                    color: 'rgba(240,236,226,0.38)',
                    marginTop: 2,
                  }}>
                    1 of 4 options is correct
                  </div>

                  {/* Thin rule */}
                  <div style={{ height: 1, background: 'rgba(201,168,76,0.18)', marginTop: 4 }} />
                </div>

                {/* Right column — options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {Object.entries(currentQuestion.options).map(([letter, text]) => (
                    <MCQOption
                      key={letter}
                      letter={letter}
                      text={text}
                      selected={selectedOption}
                      correct={currentQuestion.answer}
                      showResult={showResult}
                      onClick={() => !showResult && setSelectedOption(letter)}
                    />
                  ))}

                  {/* Confirm button */}
                  {!showResult && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                      <motion.button
                        whileHover={{ scale: selectedOption ? 1.02 : 1 }}
                        whileTap={{ scale: selectedOption ? 0.98 : 1 }}
                        onClick={handleMCQConfirm}
                        disabled={!selectedOption}
                        style={{
                          all: 'unset',
                          cursor: selectedOption ? 'pointer' : 'not-allowed',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '13px 24px',
                          background: selectedOption ? FOIL : '#141b34',
                          color: selectedOption ? '#1a1305' : 'rgba(240,236,226,0.38)',
                          fontFamily: '"Playfair Display", Georgia, serif',
                          fontWeight: 700,
                          fontSize: 15,
                          border: selectedOption ? 'none' : '1px solid rgba(201,168,76,0.18)',
                          opacity: selectedOption ? 1 : 0.6,
                          transition: 'all 0.2s',
                        }}
                      >
                        Confirm answer <IconArrow size={16} />
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* THEORY LAYOUT */}
            {phase === 'theory' && currentQuestion && (
              <div style={{
                maxWidth: 720,
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 28,
              }}>
                {/* Eyebrow */}
                <div style={{
                  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                  fontSize: 10,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: '#c9a84c',
                }}>
                  Theory Question {String(theoryIndex + 1).padStart(2, '0')}
                </div>

                {/* Question text */}
                <h2 style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontWeight: 600,
                  fontSize: 26,
                  color: '#f0ece2',
                  lineHeight: 1.4,
                }}>
                  {currentQuestion.question}
                </h2>

                <div style={{ height: 1, background: 'rgba(201,168,76,0.18)' }} />

                {/* Textarea */}
                <div>
                  <div style={{
                    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                    fontSize: 10,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'rgba(240,236,226,0.4)',
                    marginBottom: 10,
                  }}>
                    Your Answer
                  </div>
                  <textarea
                    value={theoryText}
                    onChange={e => setTheoryText(e.target.value)}
                    disabled={showResult}
                    placeholder="Write your answer here. Reference specific concepts from the lecture."
                    rows={9}
                    style={{
                      width: '100%',
                      minHeight: 220,
                      padding: 18,
                      background: 'rgba(0,0,0,0.3)',
                      border: '1.5px solid rgba(201,168,76,0.2)',
                      borderRadius: 6,
                      color: '#f0ece2',
                      fontFamily: '"Source Serif 4", Georgia, serif',
                      fontSize: 15,
                      lineHeight: 1.7,
                      outline: 'none',
                      resize: 'vertical',
                      opacity: showResult ? 0.65 : 1,
                      transition: 'border-color 0.15s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#c9a84c'}
                    onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.2)'}
                  />
                </div>

                {/* Model answer (shown after submit) */}
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      padding: '20px 22px',
                      background: 'rgba(201,168,76,0.05)',
                      border: '1px solid rgba(201,168,76,0.3)',
                      borderRadius: 6,
                    }}
                  >
                    <div style={{
                      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                      fontSize: 10,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: '#c9a84c',
                      marginBottom: 10,
                    }}>
                      Model Answer
                    </div>
                    <p style={{
                      fontFamily: '"Source Serif 4", Georgia, serif',
                      fontSize: 14,
                      color: 'rgba(240,236,226,0.72)',
                      lineHeight: 1.7,
                      margin: 0,
                    }}>
                      {currentQuestion.modelAnswer}
                    </p>
                  </motion.div>
                )}

                {/* Submit button */}
                {!showResult && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <motion.button
                      whileHover={{ scale: theoryText.trim() ? 1.02 : 1 }}
                      whileTap={{ scale: theoryText.trim() ? 0.98 : 1 }}
                      onClick={handleTheorySubmit}
                      disabled={!theoryText.trim()}
                      style={{
                        all: 'unset',
                        cursor: theoryText.trim() ? 'pointer' : 'not-allowed',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '13px 24px',
                        background: theoryText.trim() ? FOIL : '#141b34',
                        color: theoryText.trim() ? '#1a1305' : 'rgba(240,236,226,0.38)',
                        fontFamily: '"Playfair Display", Georgia, serif',
                        fontWeight: 700,
                        fontSize: 15,
                        border: theoryText.trim() ? 'none' : '1px solid rgba(201,168,76,0.18)',
                        opacity: theoryText.trim() ? 1 : 0.6,
                        transition: 'all 0.2s',
                      }}
                    >
                      Submit answer <IconArrow size={16} />
                    </motion.button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Feedback overlay */}
      <AnimatePresence>
        {showFeedbackOverlay && (
          <FeedbackOverlay
            isCorrect={phase === 'theory' ? true : mcqAnswers[mcqAnswers.length - 1]?.isCorrect}
            feedback={feedback}
            loadingFeedback={loadingFeedback}
            onNext={handleNext}
            isLast={isLastQuestion && phase === (theoryQuestions.length > 0 ? 'theory' : 'mcq')}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
