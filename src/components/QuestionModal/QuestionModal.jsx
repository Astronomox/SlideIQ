import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PersonaGlyph, Wordmark, IconX, IconArrow, IconCheck } from '../Icons/Icons';
import { generateFeedback } from '../../api/gemini';
import { useIsMobile } from '../../hooks/useIsMobile';

const CTA = 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 60%, #5b21b6 100%)';

function TopBar({ persona, phase, questionN, questionOf, progress, onExit }) {
  const isMobile = useIsMobile();

  return (
    <div style={{
      position: 'sticky', top: 0,
      background: '#f7f5fb',
      padding: isMobile ? '12px 16px' : '20px 48px',
      borderBottom: '1px solid rgba(124, 58, 237,0.10)',
      zIndex: 10,
      display: 'flex', flexDirection: 'column',
      gap: isMobile ? 8 : 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, color: '#211a2e' }}>
          {!isMobile && <Wordmark size={18} />}
          {!isMobile && <span style={{ width: 1, height: 16, background: 'rgba(124, 58, 237,0.18)' }} />}
          <span style={{ color: persona.accent, display: 'flex', alignItems: 'center' }}>
            <PersonaGlyph id={persona.id} size={isMobile ? 16 : 20} />
          </span>
          <span style={{
            fontFamily: '"Newsreader", serif',
            fontStyle: 'italic',
            fontSize: isMobile ? 12 : 13,
            color: persona.accent,
          }}>
            {persona.title}
          </span>
        </div>

        <div style={{
          flex: 2, height: 2,
          background: 'rgba(124, 58, 237,0.12)',
          position: 'relative', overflow: 'hidden', borderRadius: 1,
        }}>
          <motion.div
            style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              background: 'linear-gradient(90deg, #6d28d9, #7c3aed, #8b5cf6)',
              boxShadow: '0 0 8px rgba(124, 58, 237,0.70), 0 0 20px rgba(124, 58, 237,0.30)',
            }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 20, flex: isMobile ? 0 : 1, justifyContent: 'flex-end' }}>
          <span style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 10, letterSpacing: '0.12em',
            color: 'rgba(33,26,46,0.52)', whiteSpace: 'nowrap',
          }}>
            {String(questionN).padStart(2, '0')}/{String(questionOf).padStart(2, '0')}
            {!isMobile && ` ${phase === 'mcq' ? 'MCQ' : 'THEORY'}`}
          </span>
          <button
            onClick={onExit}
            style={{
              all: 'unset', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: isMobile ? 10 : 11, letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'rgba(33,26,46,0.48)', transition: 'color 0.15s',
              padding: isMobile ? '6px 0' : 0,
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#211a2e'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(33,26,46,0.48)'}
          >
            Exit <IconX size={isMobile ? 12 : 13} />
          </button>
        </div>
      </div>
    </div>
  );
}

function MCQOption({ letter, text, selected, correct, showResult, onClick }) {
  const isMobile = useIsMobile();
  let borderColor = 'rgba(124, 58, 237,0.14)';
  let bg = '#ffffff';
  let badgeBorder = 'rgba(124, 58, 237,0.25)';
  let badgeColor = 'rgba(124, 58, 237,0.60)';

  if (showResult) {
    if (letter === correct) {
      borderColor = 'rgba(124, 58, 237,0.55)'; bg = 'rgba(124, 58, 237,0.08)';
      badgeBorder = '#7c3aed'; badgeColor = '#7c3aed';
    } else if (letter === selected && letter !== correct) {
      borderColor = 'rgba(220,38,38,0.55)'; bg = 'rgba(220,38,38,0.08)';
      badgeBorder = '#dc2626'; badgeColor = '#dc2626';
    }
  } else if (letter === selected) {
    borderColor = '#7c3aed'; bg = 'rgba(124, 58, 237,0.08)';
    badgeBorder = '#7c3aed'; badgeColor = '#7c3aed';
  }

  const badgeSize = isMobile ? 40 : 34;

  return (
    <motion.button
      whileHover={!showResult ? { borderColor: 'rgba(124, 58, 237,0.40)', backgroundColor: 'rgba(124, 58, 237,0.04)' } : {}}
      onClick={!showResult ? onClick : undefined}
      style={{
        all: 'unset', cursor: showResult ? 'default' : 'pointer',
        width: '100%', display: 'flex',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? 12 : 16,
        padding: isMobile ? '14px 14px' : '17px 20px',
        borderRadius: 8, background: bg,
        border: `1.5px solid ${borderColor}`,
        transition: 'all 0.18s', boxSizing: 'border-box',
        minHeight: isMobile ? 56 : 'auto',
      }}
    >
      <div style={{
        width: badgeSize, height: badgeSize, borderRadius: '50%',
        background: 'rgba(124, 58, 237,0.06)',
        border: `1px solid ${badgeBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        fontSize: isMobile ? 15 : 14, fontWeight: 600, color: badgeColor,
        flexShrink: 0, transition: 'border-color 0.18s, color 0.18s',
      }}>
        {letter}
      </div>
      <span style={{
        fontFamily: '"Newsreader", serif',
        fontSize: isMobile ? 15 : 16,
        color: 'rgba(33,26,46,0.85)', flex: 1, textAlign: 'left', lineHeight: 1.5,
        wordBreak: 'break-word',
      }}>
        {text}
      </span>
      {showResult && letter === correct && (
        <IconCheck size={17} stroke={2.5} style={{ color: '#7c3aed', flexShrink: 0 }} />
      )}
      {showResult && letter === selected && letter !== correct && (
        <IconX size={17} stroke={2.5} style={{ color: '#dc2626', flexShrink: 0 }} />
      )}
    </motion.button>
  );
}

function FeedbackOverlay({ isCorrect, feedback, loadingFeedback, onNext, isLast }) {
  const isMobile = useIsMobile();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(247,245,251,0.90)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: isMobile ? 16 : 24,
        backdropFilter: 'blur(6px)',
        overflowX: 'hidden',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
        style={{
          background: '#ffffff',
          border: `1px solid ${isCorrect ? 'rgba(124, 58, 237,0.30)' : 'rgba(220,38,38,0.30)'}`,
          borderRadius: 12,
          padding: isMobile ? '32px 24px' : 48,
          maxWidth: 520, width: '100%',
          textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
          boxShadow: `0 20px 60px rgba(33,26,46,0.26), 0 0 0 1px ${isCorrect ? 'rgba(124, 58, 237,0.08)' : 'rgba(220,38,38,0.08)'}`,
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.1 }}
          style={{
            width: isMobile ? 60 : 72, height: isMobile ? 60 : 72,
            borderRadius: '50%',
            background: isCorrect ? 'rgba(124, 58, 237,0.12)' : 'rgba(220,38,38,0.12)',
            border: `2px solid ${isCorrect ? '#7c3aed' : '#dc2626'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isCorrect ? '#7c3aed' : '#dc2626',
            marginBottom: isMobile ? 16 : 20,
          }}
        >
          {isCorrect ? (
            <svg width={isMobile ? 24 : 30} height={isMobile ? 24 : 30} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <IconX size={isMobile ? 24 : 30} stroke={2.5} />
          )}
        </motion.div>

        <div style={{
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: isCorrect ? '#7c3aed' : '#dc2626',
          marginBottom: 12,
        }}>
          {isCorrect ? 'Correct' : 'Incorrect'}
        </div>

        <div style={{
          fontFamily: '"Newsreader", serif',
          fontStyle: 'italic',
          fontSize: isMobile ? 17 : 21,
          color: '#211a2e', lineHeight: 1.5,
          marginBottom: isMobile ? 20 : 28,
          minHeight: isMobile ? 48 : 60,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {loadingFeedback ? (
            <span style={{ color: 'rgba(33,26,46,0.48)', fontSize: 15 }}>Loading...</span>
          ) : (
            feedback ? `"${feedback}"` : ''
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          style={{
            all: 'unset', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            width: '100%', padding: isMobile ? 16 : 14,
            background: CTA, color: '#ffffff', borderRadius: 8,
            fontFamily: '"Instrument Sans", sans-serif',
            fontWeight: 700, fontSize: 15,
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
  const isMobile = useIsMobile();

  const mcqLen = mcqQuestions?.length ?? 0;
  const theoryLen = theoryQuestions?.length ?? 0;
  const totalQuestions = mcqLen + theoryLen;

  const [phase, setPhase] = useState(mcqLen > 0 ? 'mcq' : 'theory');
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
    ? (mcqQuestions ?? [])[mcqIndex]
    : (theoryQuestions ?? [])[theoryIndex];

  const completedCount = mcqAnswers.length + theoryAnswers.length;
  const progress = totalQuestions > 0 ? completedCount / totalQuestions : 0;
  const questionN = phase === 'mcq' ? mcqIndex + 1 : theoryIndex + 1;
  const questionOf = phase === 'mcq' ? mcqLen : theoryLen;

  const isLastQuestion = phase === 'theory'
    ? theoryIndex === theoryLen - 1
    : mcqIndex === mcqLen - 1 && theoryLen === 0;

  const fetchFeedback = async (question, userAnswer, correctAnswer, isCorrect, type) => {
    setLoadingFeedback(true);
    try {
      const text = await generateFeedback({
        personality, question: question.question,
        userAnswer, correctAnswer, isCorrect, questionType: type,
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
    const q = (mcqQuestions ?? [])[mcqIndex];
    if (!q) return;
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
      if (mcqIndex + 1 < mcqLen) {
        setMcqIndex(i => i + 1);
      } else if (theoryLen > 0) {
        setPhase('theory');
        setTheoryIndex(0);
      } else {
        handleComplete();
      }
    } else {
      if (theoryIndex + 1 < theoryLen) {
        setTheoryIndex(i => i + 1);
      } else {
        handleComplete();
      }
    }
  };

  const handleTheorySubmit = async () => {
    if (!theoryText.trim() || showResult) return;
    const q = (theoryQuestions ?? [])[theoryIndex];
    if (!q) return;
    setShowResult(true);
    setTheoryAnswers(prev => [...prev, { answer: theoryText, modelAnswer: q.modelAnswer }]);
    setFeedback(null);
    setShowFeedbackOverlay(true);
    await fetchFeedback(q, theoryText, q.modelAnswer, true, 'theory');
  };

  const handleComplete = () => {
    const mcqScore = mcqAnswers.filter(a => a.isCorrect).length;
    onComplete({
      mcqAnswers, theoryAnswers, mcqScore,
      totalMCQ: mcqLen, totalTheory: theoryLen,
      mcqQuestions: mcqQuestions ?? [],
      theoryQuestions: theoryQuestions ?? [],
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: '#f7f5fb',
        display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 100% 60% at 50% 0%, rgba(124, 58, 237,0.04) 0%, transparent 60%),
          linear-gradient(to bottom, transparent 70%, rgba(41,28,66,0.07) 100%)
        `,
      }} />

      <TopBar
        persona={personality}
        phase={phase}
        questionN={questionN}
        questionOf={questionOf}
        progress={progress}
        onExit={onExit}
      />

      <div style={{
        padding: isMobile ? '24px 16px 100px' : '48px 48px 80px',
        maxWidth: isMobile ? '100%' : 1100,
        margin: '0 auto', width: '100%',
        position: 'relative', zIndex: 1,
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${phase}-${phase === 'mcq' ? mcqIndex : theoryIndex}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* MCQ LAYOUT */}
            {phase === 'mcq' && currentQuestion && (
              isMobile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{
                      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                      fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7c3aed',
                    }}>
                      Question {String(mcqIndex + 1).padStart(2, '0')}
                    </div>
                    <h2 style={{
                      fontFamily: '"Newsreader", serif',
                      fontWeight: 400, fontSize: 18, color: '#211a2e', lineHeight: 1.6,
                    }}>
                      {currentQuestion.question}
                    </h2>
                    <div style={{ height: 1, background: 'rgba(124, 58, 237,0.14)' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {Object.entries(currentQuestion.options).map(([letter, text]) => (
                      <MCQOption
                        key={letter} letter={letter} text={text}
                        selected={selectedOption} correct={currentQuestion.answer}
                        showResult={showResult}
                        onClick={() => !showResult && setSelectedOption(letter)}
                      />
                    ))}
                    {!showResult && (
                      <motion.button
                        whileTap={{ scale: selectedOption ? 0.98 : 1 }}
                        onClick={handleMCQConfirm}
                        disabled={!selectedOption}
                        style={{
                          all: 'unset', cursor: selectedOption ? 'pointer' : 'not-allowed',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                          padding: '16px 24px', marginTop: 4,
                          background: selectedOption ? CTA : '#ffffff',
                          color: selectedOption ? '#ffffff' : 'rgba(33,26,46,0.45)',
                          fontFamily: '"Instrument Sans", sans-serif',
                          fontWeight: 700, fontSize: 15,
                          border: selectedOption ? 'none' : '1px solid rgba(124, 58, 237,0.14)',
                          borderRadius: 8,
                          opacity: selectedOption ? 1 : 0.6, width: '100%',
                        }}
                      >
                        Confirm answer <IconArrow size={16} />
                      </motion.button>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 64, alignItems: 'start' }}>
                  <div style={{ position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{
                      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                      fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7c3aed',
                    }}>
                      Question {String(mcqIndex + 1).padStart(2, '0')}
                    </div>
                    <h2 style={{
                      fontFamily: '"Newsreader", serif',
                      fontWeight: 400, fontSize: 22, color: '#211a2e', lineHeight: 1.6,
                    }}>
                      {currentQuestion.question}
                    </h2>
                    <div style={{
                      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                      fontSize: 10, letterSpacing: '0.14em',
                      color: 'rgba(33,26,46,0.45)', marginTop: 2,
                    }}>
                      1 of 4 options is correct
                    </div>
                    <div style={{ height: 1, background: 'rgba(124, 58, 237,0.14)', marginTop: 4 }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {Object.entries(currentQuestion.options).map(([letter, text]) => (
                      <MCQOption
                        key={letter} letter={letter} text={text}
                        selected={selectedOption} correct={currentQuestion.answer}
                        showResult={showResult}
                        onClick={() => !showResult && setSelectedOption(letter)}
                      />
                    ))}
                    {!showResult && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                        <motion.button
                          whileHover={{ scale: selectedOption ? 1.02 : 1 }}
                          whileTap={{ scale: selectedOption ? 0.98 : 1 }}
                          onClick={handleMCQConfirm}
                          disabled={!selectedOption}
                          style={{
                            all: 'unset', cursor: selectedOption ? 'pointer' : 'not-allowed',
                            display: 'inline-flex', alignItems: 'center', gap: 10,
                            padding: '13px 24px',
                            background: selectedOption ? CTA : '#ffffff',
                            color: selectedOption ? '#ffffff' : 'rgba(33,26,46,0.45)',
                            fontFamily: '"Instrument Sans", sans-serif',
                            fontWeight: 700, fontSize: 15,
                            border: selectedOption ? 'none' : '1px solid rgba(124, 58, 237,0.14)',
                            borderRadius: 8,
                            opacity: selectedOption ? 1 : 0.6, transition: 'all 0.2s',
                          }}
                        >
                          Confirm answer <IconArrow size={16} />
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}

            {/* THEORY LAYOUT */}
            {phase === 'theory' && currentQuestion && (
              <div style={{
                maxWidth: isMobile ? '100%' : 720,
                margin: '0 auto',
                display: 'flex', flexDirection: 'column', gap: isMobile ? 20 : 28,
              }}>
                <div style={{
                  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                  fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7c3aed',
                }}>
                  Theory Question {String(theoryIndex + 1).padStart(2, '0')}
                </div>

                <h2 style={{
                  fontFamily: '"Newsreader", serif',
                  fontWeight: 400, fontSize: isMobile ? 18 : 22, color: '#211a2e', lineHeight: 1.6,
                }}>
                  {currentQuestion.question}
                </h2>

                <div style={{ height: 1, background: 'rgba(124, 58, 237,0.14)' }} />

                <div>
                  <div style={{
                    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                    fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
                    color: 'rgba(33,26,46,0.48)', marginBottom: 10,
                  }}>
                    Your Answer
                  </div>
                  <textarea
                    value={theoryText}
                    onChange={e => setTheoryText(e.target.value)}
                    disabled={showResult}
                    placeholder="Write your answer here. Reference specific concepts from the lecture."
                    rows={isMobile ? 6 : 9}
                    style={{
                      width: '100%', minHeight: isMobile ? 160 : 220,
                      padding: isMobile ? 14 : 18,
                      background: '#ffffff',
                      border: '1.5px solid rgba(124, 58, 237,0.18)',
                      borderRadius: 8, color: '#211a2e',
                      fontFamily: '"Newsreader", serif',
                      fontSize: isMobile ? 15 : 16, lineHeight: 1.7,
                      outline: 'none', resize: 'vertical',
                      boxSizing: 'border-box', maxWidth: '100%',
                      opacity: showResult ? 0.65 : 1, transition: 'border-color 0.15s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#7c3aed'}
                    onBlur={e => e.target.style.borderColor = 'rgba(124, 58, 237,0.18)'}
                  />
                </div>

                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      padding: '20px 22px',
                      background: 'rgba(124, 58, 237,0.05)',
                      border: '1px solid rgba(124, 58, 237,0.22)',
                      borderRadius: 8,
                    }}
                  >
                    <div style={{
                      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                      fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
                      color: '#7c3aed', marginBottom: 10,
                    }}>
                      Model Answer
                    </div>
                    <p style={{
                      fontFamily: '"Newsreader", serif',
                      fontSize: 14, color: 'rgba(33,26,46,0.76)', lineHeight: 1.7, margin: 0,
                    }}>
                      {currentQuestion.modelAnswer}
                    </p>
                  </motion.div>
                )}

                {!showResult && (
                  <div style={{ display: 'flex', justifyContent: isMobile ? 'stretch' : 'flex-end' }}>
                    <motion.button
                      whileHover={{ scale: theoryText.trim() ? 1.02 : 1 }}
                      whileTap={{ scale: theoryText.trim() ? 0.98 : 1 }}
                      onClick={handleTheorySubmit}
                      disabled={!theoryText.trim()}
                      style={{
                        all: 'unset', cursor: theoryText.trim() ? 'pointer' : 'not-allowed',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        padding: isMobile ? '16px 24px' : '13px 24px',
                        width: isMobile ? '100%' : 'auto',
                        background: theoryText.trim() ? CTA : '#ffffff',
                        color: theoryText.trim() ? '#ffffff' : 'rgba(33,26,46,0.45)',
                        fontFamily: '"Instrument Sans", sans-serif',
                        fontWeight: 700, fontSize: 15,
                        border: theoryText.trim() ? 'none' : '1px solid rgba(124, 58, 237,0.14)',
                        borderRadius: 8,
                        opacity: theoryText.trim() ? 1 : 0.6, transition: 'all 0.2s',
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

      <AnimatePresence>
        {showFeedbackOverlay && (
          <FeedbackOverlay
            isCorrect={phase === 'theory' ? true : mcqAnswers[mcqAnswers.length - 1]?.isCorrect}
            feedback={feedback}
            loadingFeedback={loadingFeedback}
            onNext={handleNext}
            isLast={isLastQuestion && phase === (theoryLen > 0 ? 'theory' : 'mcq')}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
