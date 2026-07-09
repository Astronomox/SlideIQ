import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useUploads } from '../hooks/useUploads';
import { useIsMobile } from '../hooks/useIsMobile';
import UploadZone from '../components/Upload/UploadZone';
import PersonalitySelector, { PERSONALITIES } from '../components/PersonalitySelector/PersonalitySelector';
import QuizMode from '../components/QuizMode/QuizMode';
import { PersonaGlyph, IconArrow, IconSparkle } from '../components/Icons/Icons';
import { generateQuizContent } from '../api/gemini';

const CTA = 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 60%, #5b21b6 100%)';

function StepIndicator({ steps, current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 36 }}>
      {steps.map((_, i) => {
        const isActive = i === current;
        const isCompleted = i < current;
        return (
          <React.Fragment key={i}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              border: isCompleted
                ? 'none'
                : `1.5px solid ${isActive ? '#7c3aed' : 'rgba(124, 58, 237,0.20)'}`,
              background: isCompleted
                ? '#7c3aed'
                : isActive
                  ? 'rgba(124, 58, 237,0.10)'
                  : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 11, fontWeight: 600,
              color: isCompleted
                ? '#ffffff'
                : isActive
                  ? '#7c3aed'
                  : 'rgba(33,26,46,0.38)',
              flexShrink: 0, transition: 'all 0.3s',
            }}>
              {isCompleted ? (
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 1.5, margin: '0 8px',
                background: isCompleted ? '#7c3aed' : 'rgba(124, 58, 237,0.12)',
                transition: 'background 0.3s',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function QuestionCountCard({ label, description, value, onChange, min, max }) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(124, 58, 237,0.10)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      style={{
        background: '#ffffff',
        border: '1px solid rgba(124, 58, 237,0.12)',
        borderRadius: 10, padding: 24,
        display: 'flex', flexDirection: 'column', gap: 14,
        boxShadow: '0 1px 8px rgba(41,28,66,0.10)',
      }}>
      <div>
        <h3 style={{
          fontFamily: '"Instrument Sans", sans-serif',
          fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em',
          color: '#211a2e', marginBottom: 4,
        }}>
          {label}
        </h3>
        <p style={{
          fontFamily: '"Newsreader", serif',
          fontSize: 13, color: 'rgba(33,26,46,0.60)', lineHeight: 1.5,
        }}>
          {description}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <button
          onClick={() => value > min && onChange(value - 1)}
          disabled={value <= min}
          style={{
            all: 'unset', cursor: value > min ? 'pointer' : 'not-allowed',
            width: 36, height: 36, borderRadius: '50%',
            border: '1.5px solid rgba(124, 58, 237,0.25)',
            background: 'transparent', color: '#7c3aed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, opacity: value <= min ? 0.25 : 1, transition: 'background 0.15s',
          }}
          onMouseEnter={e => { if (value > min) e.currentTarget.style.background = 'rgba(124, 58, 237,0.08)'; }}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          −
        </button>

        <motion.span
          key={value}
          initial={{ scale: 1.2, color: '#7c3aed' }}
          animate={{ scale: 1, color: '#7c3aed' }}
          style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 48, fontWeight: 600, color: '#7c3aed', lineHeight: 1,
          }}
        >
          {value}
        </motion.span>

        <button
          onClick={() => value < max && onChange(value + 1)}
          disabled={value >= max}
          style={{
            all: 'unset', cursor: value < max ? 'pointer' : 'not-allowed',
            width: 36, height: 36, borderRadius: '50%',
            border: '1.5px solid rgba(124, 58, 237,0.25)',
            background: 'transparent', color: '#7c3aed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, opacity: value >= max ? 0.25 : 1, transition: 'background 0.15s',
          }}
          onMouseEnter={e => { if (value < max) e.currentTarget.style.background = 'rgba(124, 58, 237,0.08)'; }}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          +
        </button>
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', top: '50%', transform: 'translateY(-50%)',
          left: 0, height: 2,
          background: 'linear-gradient(90deg, #7c3aed, #6d28d9)',
          width: `${((value - min) / (max - min)) * 100}%`,
          pointerEvents: 'none', transition: 'width 0.1s',
        }} />
        <input
          type="range" min={min} max={max} value={value}
          onChange={e => onChange(parseInt(e.target.value))}
          style={{ position: 'relative', zIndex: 1, width: '100%' }}
        />
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        fontSize: 10, color: 'rgba(33,26,46,0.42)', letterSpacing: '0.12em',
      }}>
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { uploads } = useUploads();
  const isMobile = useIsMobile();
  const [step, setStep] = useState(0);
  const [activeUpload, setActiveUpload] = useState(null);
  const [selectedPersonality, setSelectedPersonality] = useState(null);
  const [mcqCount, setMcqCount] = useState(5);
  const [theoryCount, setTheoryCount] = useState(3);
  const [generating, setGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState(0);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [generateError, setGenerateError] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);

  const GENERATION_MESSAGES = [
    'Reading your slides...',
    'The lecturer is composing questions...',
    'Crafting answer options...',
    'Almost done, finalising quiz...',
  ];

  const firstName = user?.displayName?.split(' ')[0] || 'Scholar';

  const handleUploadComplete = useCallback((doc) => {
    setActiveUpload(doc);
    setStep(1);
  }, []);

  const handleGenerate = async () => {
    if (!activeUpload?.extractedText || !selectedPersonality) return;
    setGenerating(true);
    setGenerateError('');
    setGenerationPhase(0);

    // Cycle through loading messages every 6 seconds
    const phaseInterval = setInterval(() => {
      setGenerationPhase(p => Math.min(p + 1, 3));
    }, 6000);

    try {
      const content = await generateQuizContent({
        pdfText: activeUpload.extractedText,
        personality: selectedPersonality,
        mcqCount,
        theoryCount,
      });
      setGeneratedContent(content);
      setShowQuiz(true);
    } catch (err) {
      console.error(err);
      setGenerateError(err.message || 'Generation failed. Please try again.');
    } finally {
      clearInterval(phaseInterval);
      setGenerating(false);
      setGenerationPhase(0);
    }
  };

  const steps = ['Choose lecture', 'Choose lecturer', 'Configure quiz'];

  if (showQuiz && generatedContent) {
    return (
      <QuizMode
        content={generatedContent}
        personality={selectedPersonality}
        filename={activeUpload?.filename}
        uploadId={activeUpload?.id}
        onExit={() => { setShowQuiz(false); setGeneratedContent(null); setStep(0); }}
      />
    );
  }

  const headings = [
    'Drop a lecture in.',
    'Choose your lecturer.',
    'Configure the quiz.',
  ];
  const subheadings = [
    'Upload a PDF. Text is extracted in your browser and never stored on any server.',
    'Each lecturer has a distinct teaching style. Choose the one you want today.',
    'Set the number of MCQ and theory questions for your quiz.',
  ];

  return (
    <div style={{
      padding: isMobile ? '24px 16px' : '48px 56px',
      minHeight: '100%', position: 'relative',
    }}>
      {/* Top atmosphere glow */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 400,
        background: 'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(124, 58, 237,0.05) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      {/* Grain texture overlay */}
      <svg aria-hidden="true" style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0, opacity: 0.035,
      }}>
        <filter id="dashGrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#dashGrain)" />
      </svg>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
          style={{ marginBottom: 28 }}
        >
          <div style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
            color: '#7c3aed', marginBottom: 10,
          }}>
            Welcome back, {firstName.toUpperCase()}
          </div>

          <AnimatePresence mode="wait">
            <motion.h1
              key={`h-${step}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              style={{
                fontFamily: '"Instrument Serif", serif',
                fontWeight: 400,
                fontSize: isMobile ? 38 : 62,
                color: '#211a2e',
                letterSpacing: '-0.015em',
                lineHeight: 1.0,
                marginBottom: 10,
              }}
            >
              {headings[step]}
            </motion.h1>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.p
              key={`p-${step}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                fontFamily: '"Newsreader", serif',
                fontSize: 16,
                color: 'rgba(33,26,46,0.72)',
                lineHeight: 1.75, maxWidth: 520,
              }}
            >
              {subheadings[step]}
            </motion.p>
          </AnimatePresence>
        </motion.header>

        <StepIndicator steps={steps} current={step} />

        <AnimatePresence mode="wait">

          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(8px)', scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 240, damping: 26 }}
              style={{ display: 'flex', justifyContent: 'center' }}
            >
              <UploadZone onUploadComplete={handleUploadComplete} />
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 40, filter: 'blur(8px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -40, filter: 'blur(8px)' }}
              transition={{ type: 'spring', stiffness: 240, damping: 26 }}
            >
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 24,
              }}>
                <button
                  onClick={() => setStep(0)}
                  style={{
                    all: 'unset', cursor: 'pointer',
                    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                    fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
                    color: 'rgba(33,26,46,0.48)', transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#211a2e'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(33,26,46,0.48)'}
                >
                  Back
                </button>

                <AnimatePresence>
                  {selectedPersonality && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(2)}
                      style={{
                        all: 'unset', cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: 10,
                        padding: '13px 24px', borderRadius: 8,
                        background: CTA,
                        color: '#ffffff',
                        fontFamily: '"Instrument Sans", sans-serif',
                        fontWeight: 700, fontSize: 15, border: 'none',
                      }}
                    >
                      Continue <IconArrow size={15} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              <PersonalitySelector selected={selectedPersonality} onSelect={setSelectedPersonality} />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 40, filter: 'blur(8px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -40, filter: 'blur(8px)' }}
              transition={{ type: 'spring', stiffness: 240, damping: 26 }}
              style={{ maxWidth: isMobile ? '100%' : 600 }}
            >
              <button
                onClick={() => setStep(1)}
                style={{
                  all: 'unset', cursor: 'pointer', marginBottom: 28,
                  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                  fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
                  color: 'rgba(33,26,46,0.48)', display: 'block', transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#211a2e'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(33,26,46,0.48)'}
              >
                Back
              </button>

              {selectedPersonality && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: 'rgba(124, 58, 237,0.06)',
                  border: '1px solid rgba(124, 58, 237,0.15)',
                  padding: '14px 18px', borderRadius: 8, marginBottom: 28,
                }}>
                  <span style={{ color: selectedPersonality.accent }}>
                    <PersonaGlyph id={selectedPersonality.id} size={28} />
                  </span>
                  <span style={{
                    fontFamily: '"Instrument Sans", sans-serif',
                    fontSize: 17, color: '#211a2e', fontWeight: 700,
                  }}>
                    {selectedPersonality.title}
                  </span>
                  <span style={{
                    fontFamily: '"Newsreader", serif',
                    fontStyle: 'italic', fontSize: 13, color: 'rgba(33,26,46,0.56)',
                  }}>
                    "{selectedPersonality.tagline}"
                  </span>
                </div>
              )}

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: 16, marginBottom: 24,
              }}>
                <QuestionCountCard
                  label="Multiple Choice"
                  description="Tests recall and recognition. 1 of 4 options is correct."
                  value={mcqCount}
                  onChange={setMcqCount}
                  min={1}
                  max={60}
                />
                <QuestionCountCard
                  label="Theory"
                  description="Tests application and understanding. Write your answer."
                  value={theoryCount}
                  onChange={setTheoryCount}
                  min={0}
                  max={10}
                />
              </div>

              <div style={{
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                fontSize: 11, letterSpacing: '0.14em', color: 'rgba(33,26,46,0.48)',
                textAlign: 'center', marginBottom: 24,
              }}>
                {mcqCount} MCQ + {theoryCount} Theory = {mcqCount + theoryCount} total questions
              </div>

              {generateError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '14px 16px', marginBottom: 16,
                    background: 'rgba(220,38,38,0.08)',
                    border: '1px solid rgba(220,38,38,0.30)',
                    borderRadius: 8,
                  }}
                >
                  <div style={{ flexShrink: 0, color: '#dc2626', marginTop: 1 }}>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: '"Newsreader", serif', fontSize: 13, color: '#fca5a5', lineHeight: 1.5, marginBottom: 8 }}>
                      {generateError}
                    </div>
                    <button
                      onClick={handleGenerate}
                      style={{
                        all: 'unset', cursor: 'pointer',
                        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                        fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
                        color: '#dc2626', borderBottom: '1px solid rgba(220,38,38,0.40)', paddingBottom: 1,
                      }}
                    >
                      Try again →
                    </button>
                  </div>
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: generating ? 1 : 1.01 }}
                whileTap={{ scale: generating ? 1 : 0.99 }}
                onClick={handleGenerate}
                disabled={generating}
                style={{
                  all: 'unset', cursor: generating ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  padding: '17px 28px', width: '100%', borderRadius: 8,
                  background: generating ? '#ffffff' : CTA,
                  color: generating ? 'rgba(33,26,46,0.48)' : '#ffffff',
                  fontFamily: '"Instrument Sans", sans-serif',
                  fontWeight: 700, fontSize: 16,
                  border: generating ? '1px solid rgba(124, 58, 237,0.15)' : 'none',
                  transition: 'background 0.2s, color 0.2s',
                  boxSizing: 'border-box',
                }}
              >
                {generating ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      style={{ display: 'flex', alignItems: 'center' }}
                    >
                      <IconSparkle size={18} />
                    </motion.span>
                    Generating quiz...
                  </>
                ) : (
                  <>
                    <IconSparkle size={18} />
                    Generate quiz
                    <IconArrow size={16} />
                  </>
                )}
              </motion.button>

              {generating && (
                <div style={{ textAlign: 'center', marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={generationPhase}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.35 }}
                      style={{
                        fontFamily: '"Newsreader", serif', fontStyle: 'italic',
                        fontSize: 13, color: 'rgba(33,26,46,0.60)', margin: 0,
                      }}
                    >
                      {GENERATION_MESSAGES[generationPhase]}
                    </motion.p>
                  </AnimatePresence>
                  <p style={{
                    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                    fontSize: 10, letterSpacing: '0.14em',
                    color: 'rgba(33,26,46,0.22)', margin: 0,
                  }}>
                    This may take up to 30 seconds for large quizzes
                  </p>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
