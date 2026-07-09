import React from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable question count card component
 */
function QuestionCountCard({ label, description, value, onChange, min, max }) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(124, 58, 237,0.10)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      style={{
        background: '#ffffff',
        border: '1px solid rgba(124, 58, 237,0.12)',
        borderRadius: 10,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        boxShadow: '0 1px 8px rgba(41,28,66,0.10)',
      }}
    >
      <div>
        <h3 style={{
          fontFamily: '"Instrument Sans", sans-serif',
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: '-0.02em',
          color: '#211a2e',
          marginBottom: 4,
        }}>
          {label}
        </h3>
        <p style={{
          fontFamily: '"Newsreader", serif',
          fontSize: 13,
          color: 'rgba(33,26,46,0.60)',
          lineHeight: 1.5,
        }}>
          {description}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <button
          onClick={() => value > min && onChange(value - 1)}
          disabled={value <= min}
          style={{
            all: 'unset',
            cursor: value > min ? 'pointer' : 'not-allowed',
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '1.5px solid rgba(124, 58, 237,0.25)',
            background: 'transparent',
            color: '#7c3aed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            opacity: value <= min ? 0.25 : 1,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => {
            if (value > min) e.currentTarget.style.background = 'rgba(124, 58, 237,0.08)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          −
        </button>

        <motion.span
          key={value}
          initial={{ scale: 1.2, color: '#7c3aed' }}
          animate={{ scale: 1, color: '#7c3aed' }}
          style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 48,
            fontWeight: 600,
            color: '#7c3aed',
            lineHeight: 1,
          }}
        >
          {value}
        </motion.span>

        <button
          onClick={() => value < max && onChange(value + 1)}
          disabled={value >= max}
          style={{
            all: 'unset',
            cursor: value < max ? 'pointer' : 'not-allowed',
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '1.5px solid rgba(124, 58, 237,0.25)',
            background: 'transparent',
            color: '#7c3aed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            opacity: value >= max ? 0.25 : 1,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => {
            if (value < max) e.currentTarget.style.background = 'rgba(124, 58, 237,0.08)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          +
        </button>
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          left: 0,
          height: 2,
          background: 'linear-gradient(90deg, #7c3aed, #6d28d9)',
          width: `${((value - min) / (max - min)) * 100}%`,
          pointerEvents: 'none',
          transition: 'width 0.1s',
        }} />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(parseInt(e.target.value))}
          style={{ position: 'relative', zIndex: 1, width: '100%' }}
        />
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        fontSize: 10,
        color: 'rgba(33,26,46,0.42)',
        letterSpacing: '0.12em',
      }}>
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </motion.div>
  );
}

/**
 * Step 2: Configure quiz parameters (MCQ and theory counts)
 */
function ConfigStep({ mcqCount, theoryCount, onMcqChange, onTheoryChange, isMobile }) {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: 24,
        maxWidth: 680,
      }}
    >
      <QuestionCountCard
        label="MCQ Questions"
        description="Multiple choice questions to test understanding"
        value={mcqCount}
        onChange={onMcqChange}
        min={1}
        max={60}
      />
      <QuestionCountCard
        label="Theory Questions"
        description="Open-ended questions for deeper thinking"
        value={theoryCount}
        onChange={onTheoryChange}
        min={1}
        max={20}
      />
    </motion.div>
  );
}

export default ConfigStep;
