import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PersonaGlyph, IconArrow } from '../Icons/Icons';
import { useIsMobile } from '../../hooks/useIsMobile';

const CTA = 'linear-gradient(135deg, #a855f7 0%, #9333ea 60%, #7c3aed 100%)';

function getGrade(pct) {
  if (pct >= 90) return { letter: 'A+', label: 'Distinction',  color: '#a855f7' };
  if (pct >= 80) return { letter: 'A',  label: 'First Class',  color: '#a855f7' };
  if (pct >= 70) return { letter: 'B',  label: 'Upper Second', color: '#d8b4fe' };
  if (pct >= 60) return { letter: 'C',  label: 'Lower Second', color: '#60a5fa' };
  if (pct >= 50) return { letter: 'D',  label: 'Third Class',  color: '#eab308' };
  return             { letter: 'F',  label: 'Fail',          color: '#ef4444' };
}

function getScoreColor(pct) {
  if (pct >= 70) return '#a855f7';
  if (pct >= 50) return '#eab308';
  return '#ef4444';
}

function getPersonaRemark(personality, isHigh) {
  switch (personality.id) {
    case 'harsh':
      return isHigh
        ? 'Acceptable. Do not let the score flatter you — the exam will be harder.'
        : 'Unsatisfactory. Return to the slides before attempting this again.';
    case 'harvard':
      return isHigh
        ? 'Adequate performance. The standard remains high — continue.'
        : 'This performance is below threshold. A thorough review of the material is required.';
    case 'nice':
      return isHigh
        ? 'Wonderful work — you should feel genuinely proud of this result.'
        : 'That\'s okay — every attempt is a lesson in itself. You\'ll do better next time.';
    case 'reassuring':
      return isHigh
        ? 'You\'ve put in the work and it shows. Stay consistent.'
        : 'This is where the real learning begins. Don\'t be discouraged — you\'ll get there.';
    case 'easy':
      return isHigh
        ? 'Great job! That\'s exactly what we were looking for.'
        : 'Not quite there yet, but the questions were gentle — have another go.';
    case 'cheap':
      return isHigh
        ? 'Fine. I suppose that\'ll do.'
        : 'Even by my standards that could\'ve been better. Another read won\'t kill you.';
    case 'vague':
      return isHigh
        ? 'Something went right, I think. Unclear what, but sure.'
        : 'Murky results for a murky performance. Draw your own conclusions.';
    case 'fail':
      return isHigh
        ? 'Impressive. You somehow navigated the traps. I remain suspicious.'
        : 'As designed. Perhaps reconsider your relationship with this material.';
    default:
      return isHigh
        ? 'Good effort on this quiz. The work shows.'
        : 'There is room for improvement. Study the material again.';
  }
}

function CountingNumber({ target, duration = 1500, style }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    const startTime = performance.now();
    let raf;
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return <span style={style}>{display}</span>;
}

export default function ScoreScreen({
  personality,
  mcqScore,
  totalMCQ,
  totalTheory,
  mcqAnswers,
  theoryAnswers,
  mcqQuestions,
  theoryQuestions,
  filename,
  onRetry,
  onDone,
}) {
  const isMobile = useIsMobile();
  const pct = totalMCQ > 0 ? Math.round((mcqScore / totalMCQ) * 100) : 0;
  const grade = getGrade(pct);
  const scoreColor = getScoreColor(pct);
  const isHigh = pct >= 70;
  const remark = getPersonaRemark(personality, isHigh);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: '#0d1117',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', overflowX: 'hidden',
      }}
    >
      {/* Watermark grade letter */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          fontFamily: '"Montserrat", sans-serif',
          fontWeight: 900,
          fontSize: isMobile ? 'clamp(120px, 40vw, 180px)' : 'clamp(200px, 30vw, 280px)',
          color: 'rgba(168, 85, 247,0.05)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -55%) rotate(-8deg)',
          pointerEvents: 'none', userSelect: 'none', lineHeight: 1,
        }}
      >
        {grade.letter}
      </motion.div>

      {/* Atmosphere glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(80% 60% at 50% 30%, ${
          isHigh ? 'rgba(168, 85, 247,0.07)' : 'rgba(239,68,68,0.05)'
        } 0%, transparent 70%)`,
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 20,
        textAlign: 'center', padding: 32,
        maxWidth: 720, width: '100%',
        overflowY: 'auto', maxHeight: '100vh',
      }}>

        {/* Persona badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <span style={{ color: personality.accent }}>
            <PersonaGlyph id={personality.id} size={24} />
          </span>
          <span style={{
            fontFamily: '"Lora", serif',
            fontStyle: 'italic', fontSize: 15, color: personality.accent,
          }}>
            {personality.title}
          </span>
        </motion.div>

        {/* QUIZ COMPLETE eyebrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#a855f7',
          }}
        >
          Quiz Complete
        </motion.div>

        {/* Percentage */}
        {totalMCQ > 0 && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
            style={{
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(44px, 18vw, 100px)',
              letterSpacing: '-0.02em',
              lineHeight: 1, color: scoreColor,
              display: 'flex', alignItems: 'baseline', gap: 4,
            }}
          >
            <CountingNumber
              target={pct}
              duration={1500}
              style={{
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 900,
                fontSize: 'clamp(44px, 18vw, 100px)',
                letterSpacing: '-0.02em',
                lineHeight: 1, color: scoreColor,
              }}
            />
            <span style={{ fontSize: 36 }}>%</span>
          </motion.div>
        )}

        {/* Grade letter + label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
        >
          <span style={{
            fontFamily: '"Montserrat", sans-serif',
            fontWeight: 900, fontSize: 'clamp(20px, 6vw, 28px)',
            letterSpacing: '-0.02em', color: scoreColor,
          }}>
            {grade.letter}
          </span>
          <span style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: scoreColor,
          }}>
            {grade.label}
          </span>
        </motion.div>

        {/* Persona remark */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            fontFamily: '"Lora", serif',
            fontStyle: 'italic', fontSize: 18,
            color: 'rgba(250,247,240,0.75)',
            maxWidth: 480, lineHeight: 1.55, margin: 0,
          }}
        >
          "{remark}"
        </motion.p>

        {/* Stat grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16, width: '100%', maxWidth: 480,
          }}
        >
          {[
            { label: 'Total Questions', value: totalMCQ + totalTheory },
            { label: 'MCQ Correct', value: totalMCQ > 0 ? `${mcqScore}/${totalMCQ}` : '—' },
            { label: 'Theory Done', value: totalTheory },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'rgba(250,247,240,0.35)', marginBottom: 6,
              }}>
                {stat.label}
              </div>
              <div style={{
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 700, fontSize: 24, color: '#faf7f0',
              }}>
                {stat.value}
              </div>
            </div>
          ))}
        </motion.div>

        {/* MCQ breakdown */}
        {mcqAnswers && mcqAnswers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            style={{
              width: '100%', maxWidth: 560,
              display: 'flex', flexDirection: 'column', gap: 6,
              maxHeight: 200, overflowY: 'auto',
            }}
          >
            <div style={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'rgba(250,247,240,0.35)', marginBottom: 4, textAlign: 'left',
            }}>
              MCQ Review
            </div>
            {mcqAnswers.map((a, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '7px 12px',
                background: a.isCorrect ? 'rgba(168, 85, 247,0.07)' : 'rgba(239,68,68,0.07)',
                border: `1px solid ${a.isCorrect ? 'rgba(168, 85, 247,0.25)' : 'rgba(239,68,68,0.25)'}`,
                borderRadius: 4,
              }}>
                <span style={{
                  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                  fontSize: 10, color: 'rgba(250,247,240,0.40)',
                  minWidth: 24, flexShrink: 0,
                }}>
                  Q{i + 1}
                </span>
                <span style={{
                  flex: 1,
                  fontFamily: '"Lora", serif',
                  fontSize: 12, color: 'rgba(250,247,240,0.60)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left',
                }}>
                  {mcqQuestions[i]?.question}
                </span>
                <span style={{
                  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                  fontSize: 11, color: a.isCorrect ? '#a855f7' : '#ef4444', flexShrink: 0,
                }}>
                  {a.isCorrect ? `✓ ${a.correct}` : `✗ ${a.selected} → ${a.correct}`}
                </span>
              </div>
            ))}
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRetry}
            style={{
              all: 'unset', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '14px 24px', background: CTA,
              color: '#0d1117', borderRadius: 8,
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 700, fontSize: 15,
            }}
          >
            Try again <IconArrow size={16} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onDone}
            style={{
              all: 'unset', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '14px 24px',
              border: '1px solid rgba(168, 85, 247,0.28)',
              color: 'rgba(250,247,240,0.60)', borderRadius: 8,
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 600, fontSize: 15, transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(168, 85, 247,0.55)';
              e.currentTarget.style.color = '#faf7f0';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(168, 85, 247,0.28)';
              e.currentTarget.style.color = 'rgba(250,247,240,0.60)';
            }}
          >
            Back to library
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
