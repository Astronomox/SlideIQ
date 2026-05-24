import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PersonaGlyph, Wordmark, IconArrow } from '../Icons/Icons';
import QuestionModal from '../QuestionModal/QuestionModal';
import ScoreScreen from '../ScoreScreen/ScoreScreen';
import { useQuizHistory } from '../../hooks/useQuizHistory';
import { useAuth } from '../../context/AuthContext';

const FOIL = 'linear-gradient(135deg, #f3dc92 0%, #c9a84c 38%, #8e7426 72%, #d9be6a 100%)';

// Explanation screen — full theatrical reveal
function ExplanationScreen({ content, personality, filename, mcqCount, theoryCount, onBegin }) {
  const paragraphs = content.explanation
    ? content.explanation.split('\n\n').filter(Boolean)
    : ['No summary available.'];

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
        overflow: 'hidden',
      }}
    >
      {/* Warm vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: `
          radial-gradient(60% 55% at 50% 35%, rgba(201,168,76,0.08) 0%, transparent 70%),
          radial-gradient(120% 90% at 50% 110%, rgba(0,0,0,0.3) 0%, transparent 60%)
        `,
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '28px 48px 32px',
        gap: 28,
      }}>
        {/* TOP BAR */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 16,
          borderBottom: '1px solid rgba(201,168,76,0.10)',
          flexShrink: 0,
        }}>
          <Wordmark size={20} />
          <span style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 10,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#c9a84c',
          }}>
            Explanation · Before the quiz
          </span>
        </div>

        {/* THREE COLUMN GRID: 220px 1fr 220px */}
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '220px 1fr 220px',
          gap: 48,
          minHeight: 0,
        }}>

          {/* LEFT — source info */}
          <aside style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            overflowY: 'auto',
          }}>
            {/* SOURCE eyebrow */}
            <div style={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 9,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#c9a84c',
            }}>
              Source
            </div>

            {/* PDF thumb + filename */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{
                width: 90,
                aspectRatio: '8.5/11',
                background: `repeating-linear-gradient(
                  180deg,
                  #141b34 0px, #141b34 14px,
                  #1c2547 14px, #1c2547 15px
                )`,
                border: '1px solid rgba(201,168,76,0.18)',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute',
                  bottom: 4,
                  right: 5,
                  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                  fontSize: 8,
                  letterSpacing: '0.2em',
                  color: '#c9a84c',
                }}>
                  PDF
                </div>
              </div>
              <span style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontWeight: 600,
                fontSize: 13,
                color: '#f0ece2',
                lineHeight: 1.3,
                wordBreak: 'break-word',
              }}>
                {filename}
              </span>
            </div>

            <div style={{ height: 1, background: 'rgba(201,168,76,0.18)' }} />

            {/* READ BY eyebrow */}
            <div style={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 9,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#c9a84c',
            }}>
              Read by
            </div>

            {/* Persona block */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ color: personality.accent }}>
                <PersonaGlyph id={personality.id} size={36} />
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: 18,
                  color: '#f0ece2',
                  lineHeight: 1.2,
                }}>
                  {personality.title}
                </span>
                <span style={{
                  fontFamily: '"Source Serif 4", Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: 12,
                  color: personality.accent,
                  lineHeight: 1.4,
                }}>
                  "{personality.tagline}"
                </span>
              </div>
            </div>
          </aside>

          {/* MIDDLE — manuscript */}
          <article style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            overflowY: 'auto',
            minHeight: 0,
            position: 'relative',
          }}>
            {/* Ornament row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 11,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#c9a84c',
              flexShrink: 0,
            }}>
              <span style={{ flex: 1, height: 1, background: 'rgba(201,168,76,0.35)' }} />
              Lecture Summary
              <span style={{ flex: 1, height: 1, background: 'rgba(201,168,76,0.35)' }} />
            </div>

            <div style={{
              height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.4) 50%, transparent)',
              flexShrink: 0,
            }} />

            {/* Paragraphs */}
            <div style={{
              fontFamily: '"Source Serif 4", Georgia, serif',
              fontSize: 15.5,
              lineHeight: 1.75,
              color: '#f0ece2',
              flex: 1,
            }}>
              {paragraphs.map((para, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.18, duration: 0.5 }}
                  style={{ marginBottom: 16 }}
                >
                  {i === 0 ? (
                    <>
                      <span style={{
                        fontFamily: '"Playfair Display", Georgia, serif',
                        fontWeight: 900,
                        float: 'left',
                        fontSize: 72,
                        lineHeight: 0.82,
                        color: '#c9a84c',
                        paddingRight: 10,
                        paddingTop: 4,
                      }}>
                        {para[0]}
                      </span>
                      {para.slice(1)}
                    </>
                  ) : (
                    <span style={{ color: i >= 3 ? 'rgba(240,236,226,0.72)' : '#f0ece2' }}>
                      {para}
                    </span>
                  )}
                </motion.p>
              ))}
            </div>

            {/* Fade-out gradient at bottom */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 60,
              background: 'linear-gradient(to bottom, transparent, #0a0f1e)',
              pointerEvents: 'none',
            }} />
          </article>

          {/* RIGHT — quiz ahead */}
          <aside style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}>
            {/* QUIZ AHEAD eyebrow */}
            <div style={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 9,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#c9a84c',
            }}>
              Quiz ahead
            </div>

            {/* Stats boxes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Total */}
              <div style={{
                padding: 16,
                background: '#141b34',
                border: '1px solid rgba(201,168,76,0.18)',
              }}>
                <div style={{
                  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                  fontSize: 32,
                  fontWeight: 600,
                  color: '#f0ece2',
                  lineHeight: 1,
                }}>
                  {mcqCount + theoryCount}
                </div>
                <div style={{
                  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                  fontSize: 10,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'rgba(240,236,226,0.4)',
                  marginTop: 4,
                }}>
                  Total questions
                </div>
              </div>

              {/* MCQ + Theory side by side */}
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: '#141b34',
                  border: '1px solid rgba(201,168,76,0.18)',
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                    fontSize: 22,
                    fontWeight: 600,
                    color: '#f0ece2',
                  }}>
                    {mcqCount}
                  </div>
                  <div style={{
                    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                    fontSize: 9,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'rgba(240,236,226,0.4)',
                  }}>
                    MCQ
                  </div>
                </div>
                <div style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: '#141b34',
                  border: '1px solid rgba(201,168,76,0.18)',
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                    fontSize: 22,
                    fontWeight: 600,
                    color: '#f0ece2',
                  }}>
                    {theoryCount}
                  </div>
                  <div style={{
                    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                    fontSize: 9,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'rgba(240,236,226,0.4)',
                  }}>
                    Theory
                  </div>
                </div>
              </div>
            </div>

            {/* Divider pushed to bottom */}
            <div style={{ height: 1, background: 'rgba(201,168,76,0.18)', marginTop: 'auto' }} />

            {/* Begin button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onBegin}
              style={{
                all: 'unset',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                padding: 17,
                background: FOIL,
                color: '#1a1305',
                fontFamily: '"Playfair Display", Georgia, serif',
                fontWeight: 700,
                fontSize: 16,
                width: '100%',
              }}
            >
              Begin the quiz <IconArrow size={16} />
            </motion.button>

            {/* Subtitle */}
            <div style={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 9,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'rgba(240,236,226,0.38)',
              textAlign: 'center',
            }}>
              {mcqCount} MCQ · {theoryCount} Theory
            </div>
          </aside>
        </div>
      </div>
    </motion.div>
  );
}

export default function QuizMode({ content, personality, filename, uploadId, onExit }) {
  const { saveQuizResult } = useQuizHistory();
  const { user } = useAuth();
  const [phase, setPhase] = useState('explanation');
  const [results, setResults] = useState(null);

  const handleQuizComplete = async (quizResults) => {
    setResults(quizResults);
    setPhase('score');

    try {
      await saveQuizResult({
        uid: user.uid,
        filename,
        uploadId,
        personalityId: personality.id,
        personalityTitle: personality.title,
        mcqScore: quizResults.mcqScore,
        totalMCQ: quizResults.totalMCQ,
        totalTheory: quizResults.totalTheory,
        scorePct: quizResults.totalMCQ > 0
          ? Math.round((quizResults.mcqScore / quizResults.totalMCQ) * 100)
          : null,
        mcqAnswers: quizResults.mcqAnswers,
        theoryAnswers: quizResults.theoryAnswers,
        mcqQuestions: quizResults.mcqQuestions,
        theoryQuestions: quizResults.theoryQuestions,
      });
    } catch (err) {
      console.error('Failed to save quiz result:', err);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {phase === 'explanation' && (
        <ExplanationScreen
          key="explanation"
          content={content}
          personality={personality}
          filename={filename}
          mcqCount={content.mcq.length}
          theoryCount={content.theory.length}
          onBegin={() => setPhase('quiz')}
        />
      )}

      {phase === 'quiz' && (
        <QuestionModal
          key="quiz"
          personality={personality}
          mcqQuestions={content.mcq}
          theoryQuestions={content.theory}
          onComplete={handleQuizComplete}
          onExit={onExit}
        />
      )}

      {phase === 'score' && results && (
        <ScoreScreen
          key="score"
          personality={personality}
          filename={filename}
          mcqScore={results.mcqScore}
          totalMCQ={results.totalMCQ}
          totalTheory={results.totalTheory}
          mcqAnswers={results.mcqAnswers}
          theoryAnswers={results.theoryAnswers}
          mcqQuestions={results.mcqQuestions}
          theoryQuestions={results.theoryQuestions}
          onRetry={() => setPhase('explanation')}
          onDone={onExit}
        />
      )}
    </AnimatePresence>
  );
}
