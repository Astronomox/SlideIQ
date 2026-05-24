import React from 'react';
import { motion } from 'framer-motion';
import { PersonaGlyph } from '../Icons/Icons';
import { useIsMobile } from '../../hooks/useIsMobile';

export const PERSONALITIES = [
  {
    id: 'vague',
    title: 'Vague',
    tagline: 'Figure it out yourself.',
    bio: 'Wanders the topic. Half-explains. You\'ll be guessing what was even asked.',
    accent: '#94a3b8',
    gradeLabel: 'Murky',
  },
  {
    id: 'harsh',
    title: 'Harsh',
    tagline: 'Tough love. No sugar.',
    bio: 'Calls out errors directly. Zero hand-holding. If you didn\'t read the slides, it shows.',
    accent: '#f87171',
    gradeLabel: 'Brutal',
  },
  {
    id: 'fail',
    title: 'Out to Fail You',
    tagline: 'Designed to expose weakness.',
    bio: 'Trick questions, out-of-syllabus traps, ambiguous phrasing. They want you to fall.',
    accent: '#a78bfa',
    gradeLabel: 'Adversarial',
  },
  {
    id: 'nice',
    title: 'Nice',
    tagline: 'Warm, gentle, encouraging.',
    bio: 'Explains carefully. Celebrates effort. Even wrong answers get a kind redirect.',
    accent: '#fb923c',
    gradeLabel: 'Kind',
  },
  {
    id: 'easy',
    title: 'Very Easy',
    tagline: 'Confidence-booster mode.',
    bio: 'Surface questions. Plain phrasing. Built to keep you moving and feeling capable.',
    accent: '#4ade80',
    gradeLabel: 'Generous',
  },
  {
    id: 'reassuring',
    title: 'Reassuring',
    tagline: 'Picks you back up after a fall.',
    bio: 'Warm and steady. Acknowledges difficulty. Reframes mistakes as the path to mastery.',
    accent: '#60a5fa',
    gradeLabel: 'Steady',
  },
  {
    id: 'cheap',
    title: 'Cheap',
    tagline: 'Bare-minimum effort.',
    bio: 'Lazy phrasing, recycled stems, surface-level recall. Probably wrote this on the bus.',
    accent: '#eab308',
    gradeLabel: 'Lazy',
  },
  {
    id: 'harvard',
    title: 'Harvard Grade',
    tagline: 'Elite, rigorous, unforgiving.',
    bio: 'International benchmark standard. Precise terminology required. Mastery is the floor.',
    accent: '#f87171',
    gradeLabel: 'Rigorous',
  },
];

function PersonaCard({ persona, index, selected, onSelect, compact }) {
  const isSelected = selected?.id === persona.id;
  const isDimmed = selected && !isSelected;

  return (
    <motion.button
      onClick={() => onSelect(persona)}
      initial={{ opacity: 0, y: 16 }}
      animate={{
        opacity: isDimmed ? 0.45 : 1,
        scale: isSelected ? 1.02 : isDimmed ? 0.97 : 1,
        y: 0,
      }}
      transition={{
        duration: 0.25,
        delay: index * 0.05,
        scale: { type: 'spring', stiffness: 280, damping: 22 },
      }}
      whileHover={!isSelected ? { y: isDimmed ? 0 : -2, boxShadow: '0 8px 32px rgba(74,222,128,0.10)' } : {}}
      style={{
        all: 'unset',
        cursor: 'pointer',
        position: 'relative',
        padding: compact ? '14px 12px' : '22px 20px',
        background: isSelected ? 'rgba(74,222,128,0.07)' : '#161b22',
        backdropFilter: isSelected ? 'blur(8px)' : 'none',
        WebkitBackdropFilter: isSelected ? 'blur(8px)' : 'none',
        border: isSelected
          ? '1.5px solid rgba(74,222,128,0.60)'
          : '1px solid rgba(74,222,128,0.10)',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        textAlign: 'left',
        overflow: 'hidden',
        transition: 'border-color 0.2s, background 0.2s',
        boxShadow: isSelected
          ? '0 0 0 1px rgba(74,222,128,0.30), 0 0 32px rgba(74,222,128,0.18), 0 4px 20px rgba(0,0,0,0.40)'
          : '0 1px 4px rgba(0,0,0,0.30)',
      }}
    >
      {/* Green top edge when selected */}
      {isSelected && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent, #4ade80, transparent)',
        }} />
      )}

      {/* SELECTED badge */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            position: 'absolute', top: 10, right: 10,
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase',
            color: '#4ade80', background: 'rgba(74,222,128,0.12)',
            padding: '3px 7px', borderRadius: 3,
          }}
        >
          Selected
        </motion.div>
      )}

      {/* Top row: glyph + grade label chip */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 14,
      }}>
        <span style={{ color: persona.accent }}>
          <PersonaGlyph id={persona.id} size={compact ? 32 : 44} />
        </span>
        <span style={{
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'rgba(250,247,240,0.38)',
          border: '1px solid rgba(74,222,128,0.18)',
          padding: '3px 8px', alignSelf: 'flex-start', marginTop: 4, borderRadius: 3,
        }}>
          {persona.gradeLabel}
        </span>
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: '"Montserrat", sans-serif',
        fontWeight: 700,
        fontSize: compact ? 15 : 18,
        letterSpacing: '-0.02em',
        color: '#faf7f0', lineHeight: 1.1, marginBottom: 4,
      }}>
        {persona.title}
      </h3>

      {/* Tagline */}
      <p style={{
        fontFamily: '"Lora", serif',
        fontStyle: 'italic', fontSize: 12,
        color: persona.accent, lineHeight: 1.4, marginBottom: 8,
      }}>
        "{persona.tagline}"
      </p>

      {/* Bio */}
      <p style={{
        fontFamily: '"Lora", serif',
        fontSize: 12, color: 'rgba(250,247,240,0.42)',
        lineHeight: 1.5, margin: 0,
      }}>
        {persona.bio}
      </p>
    </motion.button>
  );
}

export default function PersonalitySelector({ selected, onSelect }) {
  const isMobile = useIsMobile();

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: '#4ade80', marginBottom: 8,
        }}>
          Step 1 — Choose your lecturer
        </div>
        <h2 style={{
          fontFamily: '"Montserrat", sans-serif',
          fontWeight: 900, fontSize: 32,
          color: '#faf7f0', lineHeight: 1.05, marginBottom: 10,
        }}>
          Choose your lecturer.
        </h2>
        <p style={{
          fontFamily: '"Lora", serif',
          fontSize: 15, color: 'rgba(250,247,240,0.55)',
          maxWidth: 520, lineHeight: 1.6,
        }}>
          Each lecturer has a distinct voice, teaching style, and way of responding to your answers.
          Pick the one you want to study with today.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: isMobile ? 10 : 14,
      }}>
        {PERSONALITIES.map((p, i) => (
          <PersonaCard
            key={p.id}
            persona={p}
            index={i}
            selected={selected}
            onSelect={onSelect}
            compact={isMobile}
          />
        ))}
      </div>
    </div>
  );
}
