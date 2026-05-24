import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizHistory } from '../../hooks/useQuizHistory';
import { PersonaGlyph, IconClock, IconX, IconDoc } from '../Icons/Icons';
import { PERSONALITIES } from '../PersonalitySelector/PersonalitySelector';

function formatDate(ts) {
  if (!ts) return 'Unknown date';
  const d = ts.toDate ? ts.toDate() : ts instanceof Date ? ts : new Date(ts);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function gradeColor(pct) {
  if (pct === null || pct === undefined) return 'rgba(240,236,226,0.55)';
  if (pct >= 70) return '#7eb39a';
  if (pct >= 50) return '#c9a84c';
  return '#9c2b2b';
}

function HistoryCard({ entry, onClick }) {
  const persona = PERSONALITIES.find(p => p.id === entry.personalityId) || PERSONALITIES[7];
  const pct = entry.scorePct ?? (entry.totalMCQ > 0
    ? Math.round((entry.mcqScore / entry.totalMCQ) * 100)
    : null);
  const color = gradeColor(pct);

  return (
    <motion.button
      whileHover={{ x: 4 }}
      onClick={onClick}
      style={{
        all: 'unset',
        cursor: 'pointer',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '16px 20px',
        background: '#141b34',
        border: '1px solid rgba(201,168,76,0.12)',
        borderRadius: 6,
        marginBottom: 8,
        transition: 'border-color 0.15s',
        boxSizing: 'border-box',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.35)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.12)'}
    >
      {/* Persona glyph */}
      <span style={{ color: persona.accent, flexShrink: 0 }}>
        <PersonaGlyph id={persona.id} size={32} />
      </span>

      {/* Middle info */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontWeight: 600,
          fontSize: 14,
          color: '#f0ece2',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {entry.filename}
        </span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 10,
            letterSpacing: '0.12em',
            color: 'rgba(240,236,226,0.45)',
          }}>
            {persona.title}
          </span>
          <span style={{ width: 1, height: 10, background: 'rgba(201,168,76,0.18)' }} />
          <span style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 10,
            letterSpacing: '0.1em',
            color: 'rgba(240,236,226,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            <IconClock size={11} /> {formatDate(entry.completedAt)}
          </span>
        </div>
      </div>

      {/* Score on right */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 2,
        flexShrink: 0,
      }}>
        {pct !== null ? (
          <>
            <span style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontWeight: 700,
              fontSize: 22,
              color,
              lineHeight: 1,
            }}>
              {pct}%
            </span>
            <span style={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 9,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(240,236,226,0.38)',
            }}>
              {entry.mcqScore}/{entry.totalMCQ} MCQ
            </span>
          </>
        ) : (
          <span style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 10,
            letterSpacing: '0.12em',
            color: 'rgba(240,236,226,0.4)',
          }}>
            Theory only
          </span>
        )}
      </div>
    </motion.button>
  );
}

function HistoryDetail({ entry, onClose }) {
  const persona = PERSONALITIES.find(p => p.id === entry.personalityId) || PERSONALITIES[7];
  const pct = entry.scorePct ?? (entry.totalMCQ > 0
    ? Math.round((entry.mcqScore / entry.totalMCQ) * 100)
    : null);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        maxWidth: 600,
        background: '#0e1428',
        borderLeft: '1px solid rgba(201,168,76,0.15)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '24px 28px',
        borderBottom: '1px solid rgba(201,168,76,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        background: '#0e1428',
        zIndex: 1,
        flexShrink: 0,
      }}>
        <div>
          <div style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 10,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#c9a84c',
            marginBottom: 4,
          }}>
            Quiz Review
          </div>
          <h2 style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 20,
            color: '#f0ece2',
            lineHeight: 1.2,
          }}>
            {entry.filename}
          </h2>
        </div>
        <button
          onClick={onClose}
          style={{
            all: 'unset',
            cursor: 'pointer',
            color: 'rgba(240,236,226,0.4)',
            padding: 8,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#f0ece2'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,236,226,0.4)'}
        >
          <IconX size={20} />
        </button>
      </div>

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Meta row */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: persona.accent }}>
            <PersonaGlyph id={persona.id} size={24} />
            <span style={{
              fontFamily: '"Source Serif 4", Georgia, serif',
              fontSize: 14,
              color: '#f0ece2',
            }}>
              {persona.title}
            </span>
          </div>
          <span style={{ width: 1, height: 20, background: 'rgba(201,168,76,0.18)' }} />
          <span style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 11,
            color: 'rgba(240,236,226,0.45)',
            letterSpacing: '0.12em',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}>
            <IconClock size={12} /> {formatDate(entry.completedAt)}
          </span>
          {pct !== null && (
            <>
              <span style={{ width: 1, height: 20, background: 'rgba(201,168,76,0.18)' }} />
              <span style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontWeight: 700,
                fontSize: 18,
                color: gradeColor(pct),
              }}>
                {pct}%
              </span>
            </>
          )}
        </div>

        <div style={{ height: 1, background: 'rgba(201,168,76,0.12)' }} />

        {/* MCQ review */}
        {entry.mcqQuestions?.length > 0 && (
          <div>
            <div style={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 10,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#c9a84c',
              marginBottom: 12,
            }}>
              MCQ Questions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {entry.mcqQuestions.map((q, i) => {
                const ans = entry.mcqAnswers?.[i];
                return (
                  <div key={i} style={{
                    padding: '14px 16px',
                    background: ans?.isCorrect ? 'rgba(126,179,154,0.08)' : 'rgba(156,43,43,0.08)',
                    border: `1px solid ${ans?.isCorrect ? 'rgba(126,179,154,0.3)' : 'rgba(156,43,43,0.3)'}`,
                    borderRadius: 4,
                  }}>
                    <div style={{
                      fontFamily: '"Source Serif 4", Georgia, serif',
                      fontSize: 13,
                      color: '#f0ece2',
                      marginBottom: 8,
                      lineHeight: 1.45,
                    }}>
                      <span style={{
                        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                        fontSize: 10,
                        color: 'rgba(240,236,226,0.4)',
                        marginRight: 6,
                      }}>
                        Q{i + 1}
                      </span>
                      {q.question}
                    </div>
                    {ans && (
                      <div style={{
                        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                        fontSize: 11,
                        color: ans.isCorrect ? '#7eb39a' : '#9c2b2b',
                        letterSpacing: '0.1em',
                      }}>
                        {ans.isCorrect
                          ? `✓ ${ans.selected} — Correct`
                          : `✗ You chose ${ans.selected} · Correct: ${ans.correct}`}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Theory review */}
        {entry.theoryQuestions?.length > 0 && (
          <div>
            <div style={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 10,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#c9a84c',
              marginBottom: 12,
            }}>
              Theory Questions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {entry.theoryQuestions.map((q, i) => {
                const ans = entry.theoryAnswers?.[i];
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{
                      fontFamily: '"Source Serif 4", Georgia, serif',
                      fontSize: 14,
                      color: '#f0ece2',
                      lineHeight: 1.5,
                    }}>
                      <span style={{
                        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                        fontSize: 10,
                        color: 'rgba(240,236,226,0.4)',
                        marginRight: 6,
                      }}>
                        Q{i + 1}
                      </span>
                      {q.question}
                    </div>
                    {ans && (
                      <div style={{
                        padding: '12px 14px',
                        background: 'rgba(201,168,76,0.05)',
                        border: '1px solid rgba(201,168,76,0.2)',
                        borderRadius: 4,
                      }}>
                        <div style={{
                          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                          fontSize: 9,
                          letterSpacing: '0.18em',
                          textTransform: 'uppercase',
                          color: 'rgba(240,236,226,0.4)',
                          marginBottom: 6,
                        }}>
                          Your answer
                        </div>
                        <p style={{
                          fontFamily: '"Source Serif 4", Georgia, serif',
                          fontSize: 13,
                          color: 'rgba(240,236,226,0.65)',
                          lineHeight: 1.6,
                          margin: 0,
                        }}>
                          {ans.answer}
                        </p>
                      </div>
                    )}
                    <div style={{
                      padding: '12px 14px',
                      background: '#141b34',
                      border: '1px solid rgba(201,168,76,0.18)',
                      borderRadius: 4,
                    }}>
                      <div style={{
                        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                        fontSize: 9,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: '#c9a84c',
                        marginBottom: 6,
                      }}>
                        Model answer
                      </div>
                      <p style={{
                        fontFamily: '"Source Serif 4", Georgia, serif',
                        fontSize: 13,
                        color: 'rgba(240,236,226,0.65)',
                        lineHeight: 1.6,
                        margin: 0,
                      }}>
                        {q.modelAnswer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function History() {
  const { history, loadingHistory } = useQuizHistory();
  const [selected, setSelected] = useState(null);

  if (loadingHistory) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 300,
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        fontSize: 12,
        letterSpacing: '0.18em',
        color: 'rgba(240,236,226,0.4)',
      }}>
        Loading history...
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: '80px 32px',
          textAlign: 'center',
        }}
      >
        <div style={{ color: 'rgba(240,236,226,0.3)' }}>
          <IconDoc size={48} stroke={1} />
        </div>
        <h2 style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: 28,
          color: '#f0ece2',
          lineHeight: 1.1,
        }}>
          No quizzes yet.
        </h2>
        <p style={{
          fontFamily: '"Source Serif 4", Georgia, serif',
          fontSize: 15,
          color: 'rgba(240,236,226,0.55)',
          maxWidth: 360,
          lineHeight: 1.55,
        }}>
          Complete your first quiz and your results will appear here for review.
        </p>
      </motion.div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {history.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <HistoryCard entry={entry} onClick={() => setSelected(entry)} />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 40,
                background: 'rgba(0,0,0,0.55)',
              }}
            />
            <HistoryDetail entry={selected} onClose={() => setSelected(null)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
