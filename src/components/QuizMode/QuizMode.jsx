import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PersonaGlyph, Wordmark, IconArrow } from '../Icons/Icons';
import QuestionModal from '../QuestionModal/QuestionModal';
import ScoreScreen from '../ScoreScreen/ScoreScreen';
import { useQuizHistory } from '../../hooks/useQuizHistory';
import { useAuth } from '../../context/AuthContext';
import { useIsMobile } from '../../hooks/useIsMobile';

const CTA = 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 60%, #5b21b6 100%)';

function ExplanationScreen({ content, personality, filename, mcqCount, theoryCount, onBegin }) {
  const isMobile = useIsMobile();

  const paragraphs = content?.explanation
    ? content.explanation.split('\n\n').filter(Boolean)
    : ['No summary available.'];

  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: '#f7f5fb',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(60% 40% at 50% 0%, rgba(124, 58, 237,0.06) 0%, transparent 70%)',
        }} />

        <div style={{
          position: 'relative', zIndex: 1, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 16px 12px',
          borderBottom: '1px solid rgba(124, 58, 237,0.10)',
          color: '#211a2e',
        }}>
          <Wordmark size={18} />
          <span style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7c3aed',
          }}>
            Before the quiz
          </span>
        </div>

        <div style={{
          position: 'relative', zIndex: 1, flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 16px',
          borderBottom: '1px solid rgba(124, 58, 237,0.08)',
          background: 'rgba(124, 58, 237,0.02)',
        }}>
          <div style={{
            width: 32, aspectRatio: '8.5/11',
            background: 'repeating-linear-gradient(180deg, #ffffff 0px, #ffffff 5px, #f1edf9 5px, #f1edf9 6px)',
            border: '1px solid rgba(124, 58, 237,0.15)',
            flexShrink: 0,
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: '"Newsreader", serif',
              fontSize: 12, color: '#211a2e',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {filename}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <span style={{ color: personality.accent }}>
                <PersonaGlyph id={personality.id} size={14} />
              </span>
              <span style={{
                fontFamily: '"Newsreader", serif',
                fontStyle: 'italic', fontSize: 11, color: personality.accent,
              }}>
                {personality.title}
              </span>
            </div>
          </div>
          <div style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 9, letterSpacing: '0.12em', color: 'rgba(33,26,46,0.48)',
            textAlign: 'right',
          }}>
            {mcqCount + theoryCount} Qs
          </div>
        </div>

        <div style={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative', zIndex: 1,
          padding: '20px 16px 100px',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7c3aed',
          }}>
            <span style={{ flex: 1, height: 1, background: 'rgba(124, 58, 237,0.22)' }} />
            Lecture Summary
            <span style={{ flex: 1, height: 1, background: 'rgba(124, 58, 237,0.22)' }} />
          </div>

          <div style={{
            fontFamily: '"Newsreader", serif',
            fontSize: 15, lineHeight: 1.75, color: '#211a2e',
          }}>
            {paragraphs.map((para, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.12, duration: 0.4 }}
                style={{
                  marginBottom: 14,
                  color: i >= 3 ? 'rgba(33,26,46,0.64)' : '#211a2e',
                }}
              >
                {para}
              </motion.p>
            ))}
          </div>
        </div>

        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '12px 16px 20px',
          background: 'linear-gradient(to top, #f7f5fb 70%, transparent)',
          zIndex: 2,
          display: 'flex', flexDirection: 'column', gap: 8,
          boxSizing: 'border-box',
        }}>
          <div style={{
            display: 'flex', gap: 8, justifyContent: 'center',
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'rgba(33,26,46,0.48)',
          }}>
            <span>{mcqCount} MCQ</span>
            <span style={{ color: '#7c3aed' }}>·</span>
            <span>{theoryCount} Theory</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onBegin}
            style={{
              all: 'unset', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: 16, background: CTA,
              color: '#ffffff', fontFamily: '"Instrument Sans", sans-serif',
              fontWeight: 700, fontSize: 16, width: '100%', borderRadius: 8,
            }}
          >
            Begin the quiz <IconArrow size={16} />
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: '#f7f5fb',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(60% 55% at 50% 35%, rgba(124, 58, 237,0.06) 0%, transparent 70%),
          radial-gradient(120% 90% at 50% 110%, rgba(41,28,66,0.07) 0%, transparent 60%)
        `,
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column',
        height: '100%', padding: '28px 48px 32px', gap: 28,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingBottom: 16, borderBottom: '1px solid rgba(124, 58, 237,0.10)', flexShrink: 0,
          color: '#211a2e',
        }}>
          <Wordmark size={20} />
          <span style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7c3aed',
          }}>
            Explanation  Before the quiz
          </span>
        </div>

        <div style={{
          flex: 1, display: 'grid',
          gridTemplateColumns: '220px 1fr 220px',
          gap: 48, minHeight: 0,
        }}>
          {/* LEFT — source info */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
            <div style={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7c3aed',
            }}>
              Source
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{
                width: 90, aspectRatio: '8.5/11',
                background: `repeating-linear-gradient(180deg, #ffffff 0px, #ffffff 14px, #f1edf9 14px, #f1edf9 15px)`,
                border: '1px solid rgba(124, 58, 237,0.15)', position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', bottom: 4, right: 5,
                  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                  fontSize: 8, letterSpacing: '0.2em', color: '#7c3aed',
                }}>
                  PDF
                </div>
              </div>
              <span style={{
                fontFamily: '"Instrument Sans", sans-serif',
                fontWeight: 600, fontSize: 13, color: '#211a2e', lineHeight: 1.3, wordBreak: 'break-word',
              }}>
                {filename}
              </span>
            </div>

            <div style={{ height: 1, background: 'rgba(124, 58, 237,0.14)' }} />

            <div style={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7c3aed',
            }}>
              Read by
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ color: personality.accent }}>
                <PersonaGlyph id={personality.id} size={36} />
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{
                  fontFamily: '"Instrument Sans", sans-serif',
                  fontWeight: 700, fontSize: 17, color: '#211a2e', lineHeight: 1.2,
                }}>
                  {personality.title}
                </span>
                <span style={{
                  fontFamily: '"Newsreader", serif',
                  fontStyle: 'italic', fontSize: 12, color: personality.accent, lineHeight: 1.4,
                }}>
                  "{personality.tagline}"
                </span>
              </div>
            </div>
          </aside>

          {/* MIDDLE — manuscript */}
          <article style={{
            display: 'flex', flexDirection: 'column', gap: 16,
            overflowY: 'auto', minHeight: 0, position: 'relative',
            paddingBottom: 80,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7c3aed',
              flexShrink: 0,
            }}>
              <span style={{ flex: 1, height: 1, background: 'rgba(124, 58, 237,0.25)' }} />
              Lecture Summary
              <span style={{ flex: 1, height: 1, background: 'rgba(124, 58, 237,0.25)' }} />
            </div>
            <div style={{
              height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(124, 58, 237,0.30) 50%, transparent)',
              flexShrink: 0,
            }} />
            <div style={{
              fontFamily: '"Newsreader", serif',
              fontSize: 15.5, lineHeight: 1.8, color: '#211a2e', flex: 1,
            }}>
              {paragraphs.map((para, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.18, duration: 0.5 }}
                  style={{
                    marginBottom: 16,
                    color: i >= 3 ? 'rgba(33,26,46,0.64)' : '#211a2e',
                  }}
                >
                  {i === 0 ? (
                    <>
                      <span style={{
                        fontFamily: '"Instrument Sans", sans-serif',
                        fontWeight: 700, float: 'left',
                        fontSize: 72, lineHeight: 0.82, color: '#7c3aed',
                        paddingRight: 10, paddingTop: 4,
                      }}>
                        {para[0]}
                      </span>
                      {para.slice(1)}
                    </>
                  ) : (
                    para
                  )}
                </motion.p>
              ))}
            </div>
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
              background: 'linear-gradient(to bottom, transparent, #f7f5fb)',
              pointerEvents: 'none',
            }} />
          </article>

          {/* RIGHT — quiz ahead */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7c3aed',
            }}>
              Quiz ahead
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{
                padding: 16, background: '#ffffff',
                border: '1px solid rgba(124, 58, 237,0.12)', borderRadius: 8,
              }}>
                <div style={{
                  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                  fontSize: 32, fontWeight: 600, color: '#211a2e', lineHeight: 1,
                }}>
                  {mcqCount + theoryCount}
                </div>
                <div style={{
                  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                  fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
                  color: 'rgba(33,26,46,0.48)', marginTop: 4,
                }}>
                  Total questions
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ label: 'MCQ', val: mcqCount }, { label: 'Theory', val: theoryCount }].map(({ label, val }) => (
                  <div key={label} style={{
                    flex: 1, padding: '10px 12px', background: '#ffffff',
                    border: '1px solid rgba(124, 58, 237,0.12)', textAlign: 'center', borderRadius: 8,
                  }}>
                    <div style={{
                      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                      fontSize: 22, fontWeight: 600, color: '#211a2e',
                    }}>
                      {val}
                    </div>
                    <div style={{
                      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                      fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
                      color: 'rgba(33,26,46,0.48)',
                    }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ height: 1, background: 'rgba(124, 58, 237,0.12)', marginTop: 'auto' }} />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onBegin}
              style={{
                all: 'unset', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: 17, background: CTA,
                color: '#ffffff', fontFamily: '"Instrument Sans", sans-serif',
                fontWeight: 700, fontSize: 16, width: '100%', borderRadius: 8,
              }}
            >
              Begin the quiz <IconArrow size={16} />
            </motion.button>

            <div style={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase',
              color: 'rgba(33,26,46,0.45)', textAlign: 'center',
            }}>
              {mcqCount} MCQ  {theoryCount} Theory
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

  const mcqCount = content?.mcq?.length ?? 0;
  const theoryCount = content?.theory?.length ?? 0;

  const handleQuizComplete = async (quizResults) => {
    setResults(quizResults);
    setPhase('score');
    try {
      await saveQuizResult({
        uid: user.uid,
        filename, uploadId,
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
          mcqCount={mcqCount}
          theoryCount={theoryCount}
          onBegin={() => setPhase('quiz')}
        />
      )}

      {phase === 'quiz' && (
        <QuestionModal
          key="quiz"
          personality={personality}
          mcqQuestions={content?.mcq ?? []}
          theoryQuestions={content?.theory ?? []}
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
