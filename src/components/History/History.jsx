import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizHistory } from '../../hooks/useQuizHistory';
import { PersonaGlyph, IconClock, IconX, IconDoc } from '../Icons/Icons';
import { PERSONALITIES } from '../PersonalitySelector/PersonalitySelector';
import { useIsMobile } from '../../hooks/useIsMobile';

function formatDate(ts) {
  if (!ts) return 'Unknown date';
  const d = ts.toDate ? ts.toDate() : ts instanceof Date ? ts : new Date(ts);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function gradeColor(pct) {
  if (pct === null || pct === undefined) return 'rgba(250,247,240,0.45)';
  if (pct >= 70) return '#4ade80';
  if (pct >= 50) return '#eab308';
  return '#ef4444';
}

function HistoryCard({ entry, onClick }) {
  const persona = PERSONALITIES.find(p => p.id === entry.personalityId) || PERSONALITIES[7];
  const pct = entry.scorePct ?? (entry.totalMCQ > 0
    ? Math.round((entry.mcqScore / entry.totalMCQ) * 100)
    : null);
  const color = gradeColor(pct);

  return (
    <motion.button
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(74,222,128,0.10)' }}
      onClick={onClick}
      style={{
        all: 'unset', cursor: 'pointer',
        width: '100%', display: 'flex', alignItems: 'center',
        gap: 16, padding: '16px 20px',
        background: '#161b22',
        border: '1px solid rgba(74,222,128,0.10)',
        borderRadius: 8, marginBottom: 8,
        transition: 'border-color 0.15s',
        boxSizing: 'border-box',
        boxShadow: '0 1px 4px rgba(0,0,0,0.30)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(74,222,128,0.35)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(74,222,128,0.10)';
      }}
    >
      <span style={{ color: persona.accent, flexShrink: 0 }}>
        <PersonaGlyph id={persona.id} size={32} />
      </span>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{
          fontFamily: '"Montserrat", sans-serif',
          fontWeight: 600, fontSize: 14, color: '#faf7f0',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {entry.filename}
        </span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 10, letterSpacing: '0.12em', color: 'rgba(250,247,240,0.40)',
          }}>
            {persona.title}
          </span>
          <span style={{ width: 1, height: 10, background: 'rgba(74,222,128,0.18)' }} />
          <span style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 10, letterSpacing: '0.1em', color: 'rgba(250,247,240,0.35)',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <IconClock size={11} /> {formatDate(entry.completedAt)}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
        {pct !== null ? (
          <>
            <span style={{
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 700, fontSize: 22, color, lineHeight: 1,
            }}>
              {pct}%
            </span>
            <span style={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'rgba(250,247,240,0.30)',
            }}>
              {entry.mcqScore}/{entry.totalMCQ} MCQ
            </span>
          </>
        ) : (
          <span style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 10, letterSpacing: '0.12em', color: 'rgba(250,247,240,0.35)',
          }}>
            Theory only
          </span>
        )}
      </div>
    </motion.button>
  );
}

function downloadQuizResult(entry, persona) {
  const lines = [];
  lines.push('SlideIQ Quiz Export');
  lines.push('===================');
  lines.push(`File:     ${entry.filename}`);
  lines.push(`Date:     ${formatDate(entry.completedAt)}`);
  lines.push(`Lecturer: ${persona.title}`);
  if (entry.scorePct !== null && entry.scorePct !== undefined) {
    lines.push(`Score:    ${entry.scorePct}% (${entry.mcqScore}/${entry.totalMCQ} MCQ correct)`);
  } else {
    lines.push(`Score:    Theory only`);
  }

  if (entry.mcqQuestions?.length > 0) {
    lines.push('');
    lines.push('MCQ QUESTIONS');
    lines.push('─────────────');
    entry.mcqQuestions.forEach((q, i) => {
      const ans = entry.mcqAnswers?.[i];
      lines.push('');
      lines.push(`Q${i + 1}: ${q.question}`);
      if (q.options) {
        Object.entries(q.options).forEach(([letter, text]) => {
          const mark = letter === (ans?.correct || q.answer) ? ' ← CORRECT' : '';
          const sel = letter === ans?.selected && !ans?.isCorrect ? ' ← YOUR ANSWER' : '';
          lines.push(`  ${letter}. ${text}${mark}${sel}`);
        });
      }
      lines.push(`Result: ${ans?.isCorrect ? 'Correct' : `Wrong (you chose ${ans?.selected}, correct: ${ans?.correct})`}`);
    });
  }

  if (entry.theoryQuestions?.length > 0) {
    lines.push('');
    lines.push('THEORY QUESTIONS');
    lines.push('────────────────');
    entry.theoryQuestions.forEach((q, i) => {
      const ans = entry.theoryAnswers?.[i];
      lines.push('');
      lines.push(`Q${i + 1}: ${q.question}`);
      lines.push('');
      lines.push('Your answer:');
      lines.push(ans?.answer || '(no answer recorded)');
      lines.push('');
      lines.push('Model answer:');
      lines.push(q.modelAnswer || '—');
    });
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `slideiq-${(entry.filename || 'quiz').replace(/\.pdf$/i, '')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function MCQReviewCard({ q, ans, index }) {
  const correct = ans?.correct || q.answer;
  const selected = ans?.selected;
  const isCorrect = ans?.isCorrect;
  const hasResult = ans !== undefined && ans !== null;

  // Normalise options — API returns object {A:…,B:…,C:…,D:…}
  const optionEntries = q.options
    ? Object.entries(q.options)
    : q.choices
      ? Object.entries(q.choices)
      : null;

  return (
    <div style={{
      padding: '16px',
      background: '#1c2128',
      border: `1px solid ${!hasResult ? 'rgba(74,222,128,0.12)' : isCorrect ? 'rgba(74,222,128,0.25)' : 'rgba(239,68,68,0.25)'}`,
      borderRadius: 8,
    }}>
      {/* Q number + result badge */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 10,
      }}>
        <span style={{
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          fontSize: 10, letterSpacing: '0.14em', color: 'rgba(250,247,240,0.35)',
        }}>
          Q{index + 1}
        </span>
        {hasResult && (
          <span style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: isCorrect ? '#4ade80' : '#ef4444',
            background: isCorrect ? 'rgba(74,222,128,0.10)' : 'rgba(239,68,68,0.10)',
            padding: '3px 8px', borderRadius: 3,
          }}>
            {isCorrect ? '✓ Correct' : '✗ Wrong'}
          </span>
        )}
      </div>

      {/* Question text */}
      <p style={{
        fontFamily: '"Lora", serif',
        fontSize: 14, color: '#faf7f0', lineHeight: 1.6,
        margin: '0 0 12px 0',
      }}>
        {q.question || q.text || '(question text unavailable)'}
      </p>

      {/* Options */}
      {optionEntries ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {optionEntries.map(([letter, text]) => {
            const isThisCorrect = letter === correct;
            const isThisWrong = hasResult && letter === selected && !isThisCorrect;
            let bg = 'transparent';
            let borderColor = 'rgba(250,247,240,0.08)';
            let textColor = 'rgba(250,247,240,0.50)';
            let letterColor = 'rgba(250,247,240,0.30)';
            if (isThisCorrect) {
              bg = 'rgba(74,222,128,0.10)';
              borderColor = 'rgba(74,222,128,0.45)';
              textColor = '#faf7f0';
              letterColor = '#4ade80';
            } else if (isThisWrong) {
              bg = 'rgba(239,68,68,0.08)';
              borderColor = 'rgba(239,68,68,0.40)';
              textColor = 'rgba(250,247,240,0.70)';
              letterColor = '#ef4444';
            }
            return (
              <div key={letter} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '8px 10px',
                background: bg, border: `1px solid ${borderColor}`,
                borderRadius: 5, boxSizing: 'border-box',
              }}>
                <span style={{
                  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                  fontSize: 11, fontWeight: 600, color: letterColor,
                  flexShrink: 0, minWidth: 18, lineHeight: 1.55,
                }}>
                  {letter}
                </span>
                <span style={{
                  fontFamily: '"Lora", serif',
                  fontSize: 13, color: textColor, lineHeight: 1.5, flex: 1,
                }}>
                  {text}
                </span>
                {isThisCorrect && (
                  <span style={{ color: '#4ade80', flexShrink: 0, fontSize: 13, lineHeight: 1.55 }}>✓</span>
                )}
                {isThisWrong && (
                  <span style={{ color: '#ef4444', flexShrink: 0, fontSize: 13, lineHeight: 1.55 }}>✗</span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Fallback when options are unavailable — show correct answer */
        <div style={{
          padding: '8px 10px',
          background: 'rgba(74,222,128,0.08)',
          border: '1px solid rgba(74,222,128,0.35)',
          borderRadius: 5,
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          fontSize: 11, color: '#4ade80',
        }}>
          Correct answer: {correct || q.answer || '—'}
          {hasResult && selected && selected !== correct && (
            <span style={{ color: '#ef4444', marginLeft: 16 }}>
              Your answer: {selected}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function HistoryDetail({ entry, onClose }) {
  const isMobile = useIsMobile();
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
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: isMobile ? '100%' : '100%',
        maxWidth: isMobile ? '100%' : 620,
        background: '#161b22',
        borderLeft: isMobile ? 'none' : '1px solid rgba(74,222,128,0.12)',
        zIndex: 50,
        display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.50)',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid rgba(74,222,128,0.10)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
        position: 'sticky', top: 0,
        background: '#161b22', zIndex: 1, flexShrink: 0,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
            color: '#4ade80', marginBottom: 4,
          }}>
            Quiz Review
          </div>
          <h2 style={{
            fontFamily: '"Montserrat", sans-serif',
            fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em',
            color: '#faf7f0', lineHeight: 1.2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {entry.filename}
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => downloadQuizResult(entry, persona)}
            style={{
              all: 'unset', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 14px',
              background: 'rgba(74,222,128,0.08)',
              border: '1px solid rgba(74,222,128,0.28)',
              borderRadius: 6,
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: '#4ade80', transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(74,222,128,0.14)';
              e.currentTarget.style.borderColor = 'rgba(74,222,128,0.50)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(74,222,128,0.08)';
              e.currentTarget.style.borderColor = 'rgba(74,222,128,0.28)';
            }}
          >
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 16V4M7 20h10M4 20h16M7 12l5 5 5-5" />
            </svg>
            Download
          </motion.button>
          <button
            onClick={onClose}
            style={{
              all: 'unset', cursor: 'pointer',
              color: 'rgba(250,247,240,0.35)', padding: 6, transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#faf7f0'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(250,247,240,0.35)'}
          >
            <IconX size={20} />
          </button>
        </div>
      </div>

      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Meta row */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: persona.accent }}>
            <PersonaGlyph id={persona.id} size={22} />
            <span style={{ fontFamily: '"Lora", serif', fontStyle: 'italic', fontSize: 13, color: persona.accent }}>
              {persona.title}
            </span>
          </div>
          <span style={{ width: 1, height: 16, background: 'rgba(74,222,128,0.18)', flexShrink: 0 }} />
          <span style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 11, color: 'rgba(250,247,240,0.40)', letterSpacing: '0.10em',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <IconClock size={11} /> {formatDate(entry.completedAt)}
          </span>
          {pct !== null && (
            <>
              <span style={{ width: 1, height: 16, background: 'rgba(74,222,128,0.18)', flexShrink: 0 }} />
              <span style={{
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 700, fontSize: 18, color: gradeColor(pct),
              }}>
                {pct}%
              </span>
              <span style={{
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                fontSize: 10, color: 'rgba(250,247,240,0.35)',
              }}>
                {entry.mcqScore}/{entry.totalMCQ} MCQ
              </span>
            </>
          )}
        </div>

        <div style={{ height: 1, background: 'rgba(74,222,128,0.10)' }} />

        {/* MCQ review */}
        {entry.mcqQuestions?.length > 0 && (
          <div>
            <div style={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
              color: '#4ade80', marginBottom: 12,
            }}>
              Multiple Choice · {entry.mcqQuestions.length} Questions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {entry.mcqQuestions.map((q, i) => (
                <MCQReviewCard
                  key={i}
                  q={q}
                  ans={entry.mcqAnswers?.[i]}
                  index={i}
                />
              ))}
            </div>
          </div>
        )}

        {/* Theory review */}
        {entry.theoryQuestions?.length > 0 && (
          <div>
            <div style={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
              color: '#4ade80', marginBottom: 12,
            }}>
              Theory · {entry.theoryQuestions.length} Questions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {entry.theoryQuestions.map((q, i) => {
                const ans = entry.theoryAnswers?.[i];
                return (
                  <div key={i} style={{
                    background: '#1c2128',
                    border: '1px solid rgba(74,222,128,0.12)',
                    borderRadius: 8, overflow: 'hidden',
                  }}>
                    {/* Question header */}
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(74,222,128,0.10)' }}>
                      <div style={{
                        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                        fontSize: 10, letterSpacing: '0.14em', color: 'rgba(250,247,240,0.35)',
                        marginBottom: 8,
                      }}>
                        Q{i + 1}
                      </div>
                      <p style={{
                        fontFamily: '"Lora", serif',
                        fontSize: 14, color: '#faf7f0', lineHeight: 1.55, margin: 0,
                      }}>
                        {q.question}
                      </p>
                    </div>

                    {/* User answer */}
                    {ans && (
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(74,222,128,0.08)' }}>
                        <div style={{
                          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                          fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase',
                          color: 'rgba(250,247,240,0.30)', marginBottom: 6,
                        }}>
                          Your answer
                        </div>
                        <p style={{
                          fontFamily: '"Lora", serif',
                          fontSize: 13, color: 'rgba(250,247,240,0.65)',
                          lineHeight: 1.6, margin: 0,
                        }}>
                          {ans.answer || '(no answer recorded)'}
                        </p>
                      </div>
                    )}

                    {/* Model answer */}
                    <div style={{ padding: '12px 16px', background: 'rgba(74,222,128,0.04)' }}>
                      <div style={{
                        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                        fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase',
                        color: '#4ade80', marginBottom: 6,
                      }}>
                        Model answer
                      </div>
                      <p style={{
                        fontFamily: '"Lora", serif',
                        fontSize: 13, color: 'rgba(250,247,240,0.75)',
                        lineHeight: 1.6, margin: 0,
                      }}>
                        {q.modelAnswer || '—'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom spacer */}
        <div style={{ height: 16 }} />
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
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: 300,
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        fontSize: 12, letterSpacing: '0.18em', color: 'rgba(250,247,240,0.35)',
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
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 16,
          padding: '80px 32px', textAlign: 'center',
        }}
      >
        <div style={{ color: 'rgba(250,247,240,0.22)' }}>
          <IconDoc size={48} stroke={1} />
        </div>
        <h2 style={{
          fontFamily: '"Montserrat", sans-serif',
          fontWeight: 700, fontSize: 28, color: '#faf7f0', lineHeight: 1.1,
        }}>
          No quizzes yet.
        </h2>
        <p style={{
          fontFamily: '"Lora", serif',
          fontSize: 15, color: 'rgba(250,247,240,0.50)',
          maxWidth: 360, lineHeight: 1.55,
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
                position: 'fixed', inset: 0, zIndex: 40,
                background: 'rgba(13,17,23,0.80)',
                backdropFilter: 'blur(4px)',
              }}
            />
            <HistoryDetail entry={selected} onClose={() => setSelected(null)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
