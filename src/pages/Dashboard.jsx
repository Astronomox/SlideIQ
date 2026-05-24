import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useUploads } from '../hooks/useUploads';
import UploadZone from '../components/Upload/UploadZone';
import PersonalitySelector, { PERSONALITIES } from '../components/PersonalitySelector/PersonalitySelector';
import QuizMode from '../components/QuizMode/QuizMode';
import { PersonaGlyph, IconArrow, IconSparkle } from '../components/Icons/Icons';
import { generateQuizContent } from '../api/claude';

// Step indicator
function StepIndicator({ steps, current }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 0,
      marginBottom: 40,
    }}>
      {steps.map((step, i) => {
        const isActive = i === current;
        const isCompleted = i < current;
        return (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: isCompleted
                  ? 'none'
                  : `1.5px solid ${isActive ? '#c9a84c' : 'rgba(201,168,76,0.2)'}`,
                background: isCompleted
                  ? '#c9a84c'
                  : isActive
                    ? 'rgba(201,168,76,0.12)'
                    : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                fontSize: 11,
                color: isCompleted ? '#0a0f1e' : isActive ? '#c9a84c' : 'rgba(240,236,226,0.38)',
                transition: 'all 0.3s',
                flexShrink: 0,
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
              <span style={{
                fontFamily: '"Source Serif 4", Georgia, serif',
                fontSize: 13,
                color: isActive ? '#f0ece2' : 'rgba(240,236,226,0.4)',
                transition: 'color 0.3s',
                whiteSpace: 'nowrap',
              }}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1,
                height: 1,
                margin: '0 16px',
                background: isCompleted ? '#c9a84c' : 'rgba(201,168,76,0.15)',
                transition: 'background 0.3s',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Plus/minus count card
function QuestionCountCard({ label, description, value, onChange, min, max }) {
  const [sliderVal, setSliderVal] = useState(value);

  const handlePlus = () => {
    if (value < max) onChange(value + 1);
  };
  const handleMinus = () => {
    if (value > min) onChange(value - 1);
  };

  return (
    <div style={{
      background: '#141b34',
      border: '1px solid rgba(201,168,76,0.18)',
      borderRadius: 8,
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
    }}>
      <div>
        <h3 style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontWeight: 700,
          fontSize: 20,
          color: '#f0ece2',
          marginBottom: 4,
        }}>
          {label}
        </h3>
        <p style={{
          fontFamily: '"Source Serif 4", Georgia, serif',
          fontSize: 13,
          color: 'rgba(240,236,226,0.55)',
          lineHeight: 1.5,
        }}>
          {description}
        </p>
      </div>

      {/* Large number + +/- buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        <button
          onClick={handleMinus}
          disabled={value <= min}
          style={{
            all: 'unset',
            cursor: value > min ? 'pointer' : 'not-allowed',
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '1.5px solid rgba(201,168,76,0.35)',
            background: 'transparent',
            color: '#c9a84c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            opacity: value <= min ? 0.3 : 1,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { if (value > min) e.currentTarget.style.background = 'rgba(201,168,76,0.10)'; }}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          −
        </button>

        <motion.span
          key={value}
          initial={{ scale: 1.2, color: '#c9a84c' }}
          animate={{ scale: 1, color: '#c9a84c' }}
          style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 48,
            fontWeight: 600,
            color: '#c9a84c',
            lineHeight: 1,
          }}
        >
          {value}
        </motion.span>

        <button
          onClick={handlePlus}
          disabled={value >= max}
          style={{
            all: 'unset',
            cursor: value < max ? 'pointer' : 'not-allowed',
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '1.5px solid rgba(201,168,76,0.35)',
            background: 'transparent',
            color: '#c9a84c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            opacity: value >= max ? 0.3 : 1,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { if (value < max) e.currentTarget.style.background = 'rgba(201,168,76,0.10)'; }}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          +
        </button>
      </div>

      {/* Slider */}
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          left: 0,
          height: 2,
          background: 'linear-gradient(135deg, #f3dc92, #c9a84c, #8e7426)',
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
        color: 'rgba(240,236,226,0.38)',
        letterSpacing: '0.12em',
      }}>
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { uploads } = useUploads();
  const [step, setStep] = useState(0);
  const [activeUpload, setActiveUpload] = useState(null);
  const [selectedPersonality, setSelectedPersonality] = useState(null);
  const [mcqCount, setMcqCount] = useState(5);
  const [theoryCount, setTheoryCount] = useState(3);
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [generateError, setGenerateError] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);

  const firstName = user?.displayName?.split(' ')[0] || 'Scholar';

  const handleUploadComplete = useCallback((doc) => {
    setActiveUpload(doc);
    setStep(1);
  }, []);

  const handleGenerate = async () => {
    if (!activeUpload?.extractedText || !selectedPersonality) return;
    setGenerating(true);
    setGenerateError('');
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
      setGenerating(false);
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
        onExit={() => {
          setShowQuiz(false);
          setGeneratedContent(null);
          setStep(0);
        }}
      />
    );
  }

  const headings = [
    'Drop a lecture in.',
    'Choose your lecturer.',
    'Configure the quiz.',
  ];
  const subheadings = [
    'Upload a PDF — text is extracted in your browser and never stored on any server.',
    'Each lecturer has a distinct teaching style. Choose the one you want today.',
    'Set the number of MCQ and theory questions for your quiz.',
  ];

  return (
    <div style={{
      padding: '48px 56px',
      minHeight: '100%',
      position: 'relative',
    }}>
      {/* Top atmosphere glow */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 500,
        background: 'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(201,168,76,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* HEADER */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 32 }}
        >
          <div style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 11,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#c9a84c',
            marginBottom: 10,
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
                fontFamily: '"Playfair Display", Georgia, serif',
                fontWeight: 900,
                fontSize: 56,
                color: '#f0ece2',
                letterSpacing: '-0.02em',
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
                fontFamily: '"Source Serif 4", Georgia, serif',
                fontSize: 17,
                color: 'rgba(240,236,226,0.68)',
                lineHeight: 1.65,
                maxWidth: 520,
              }}
            >
              {subheadings[step]}
            </motion.p>
          </AnimatePresence>
        </motion.header>

        {/* STEP INDICATOR */}
        <StepIndicator steps={steps} current={step} />

        {/* STEP CONTENT */}
        <AnimatePresence mode="wait">

          {/* STEP 0: Upload */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              style={{ display: 'flex', justifyContent: 'center' }}
            >
              <UploadZone onUploadComplete={handleUploadComplete} />
            </motion.div>
          )}

          {/* STEP 1: Personality */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Back + continue row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
              }}>
                <button
                  onClick={() => setStep(0)}
                  style={{
                    all: 'unset',
                    cursor: 'pointer',
                    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                    fontSize: 11,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'rgba(240,236,226,0.45)',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#f0ece2'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,236,226,0.45)'}
                >
                  ← Back
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
                        all: 'unset',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '13px 24px',
                        background: 'linear-gradient(135deg, #f3dc92 0%, #c9a84c 38%, #8e7426 72%, #d9be6a 100%)',
                        color: '#1a1305',
                        fontFamily: '"Playfair Display", Georgia, serif',
                        fontWeight: 700,
                        fontSize: 15,
                        border: 'none',
                      }}
                    >
                      Continue <IconArrow size={15} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              <PersonalitySelector
                selected={selectedPersonality}
                onSelect={setSelectedPersonality}
              />
            </motion.div>
          )}

          {/* STEP 2: Configure */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              style={{ maxWidth: 600 }}
            >
              {/* Back button */}
              <button
                onClick={() => setStep(1)}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  marginBottom: 28,
                  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                  fontSize: 11,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'rgba(240,236,226,0.45)',
                  display: 'block',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#f0ece2'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,236,226,0.45)'}
              >
                ← Back
              </button>

              {/* Selected lecturer summary bar */}
              {selectedPersonality && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  background: 'rgba(201,168,76,0.06)',
                  border: '1px solid rgba(201,168,76,0.2)',
                  padding: '14px 18px',
                  borderRadius: 6,
                  marginBottom: 28,
                }}>
                  <span style={{ color: selectedPersonality.accent }}>
                    <PersonaGlyph id={selectedPersonality.id} size={28} />
                  </span>
                  <span style={{
                    fontFamily: '"Playfair Display", Georgia, serif',
                    fontSize: 18,
                    color: '#f0ece2',
                  }}>
                    {selectedPersonality.title}
                  </span>
                  <span style={{
                    fontFamily: '"Source Serif 4", Georgia, serif',
                    fontStyle: 'italic',
                    fontSize: 13,
                    color: 'rgba(240,236,226,0.55)',
                  }}>
                    — "{selectedPersonality.tagline}"
                  </span>
                </div>
              )}

              {/* Two question count cards side by side */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
                marginBottom: 24,
              }}>
                <QuestionCountCard
                  label="Multiple Choice"
                  description="Tests recall and recognition. 1 of 4 options is correct."
                  value={mcqCount}
                  onChange={setMcqCount}
                  min={1}
                  max={20}
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

              {/* Quiz summary row */}
              <div style={{
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                fontSize: 11,
                letterSpacing: '0.14em',
                color: 'rgba(240,236,226,0.45)',
                textAlign: 'center',
                marginBottom: 24,
              }}>
                {mcqCount} MCQ + {theoryCount} Theory = {mcqCount + theoryCount} total questions
              </div>

              {/* Error */}
              {generateError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    padding: '12px 16px',
                    marginBottom: 16,
                    background: 'rgba(156,43,43,0.15)',
                    border: '1px solid rgba(156,43,43,0.4)',
                    borderRadius: 4,
                    color: '#c97272',
                    fontSize: 13,
                    fontFamily: '"Source Serif 4", Georgia, serif',
                  }}
                >
                  {generateError}
                </motion.div>
              )}

              {/* Generate button */}
              <motion.button
                whileHover={{ scale: generating ? 1 : 1.01 }}
                whileTap={{ scale: generating ? 1 : 0.99 }}
                onClick={handleGenerate}
                disabled={generating}
                style={{
                  all: 'unset',
                  cursor: generating ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  padding: '17px 28px',
                  width: '100%',
                  background: generating
                    ? '#141b34'
                    : 'linear-gradient(135deg, #f3dc92 0%, #c9a84c 38%, #8e7426 72%, #d9be6a 100%)',
                  color: generating ? 'rgba(240,236,226,0.5)' : '#1a1305',
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontWeight: 700,
                  fontSize: 16,
                  border: generating ? '1px solid rgba(201,168,76,0.18)' : 'none',
                  transition: 'background 0.2s, color 0.2s',
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
                    Generating your quiz...
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
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    textAlign: 'center',
                    marginTop: 14,
                    fontFamily: '"Source Serif 4", Georgia, serif',
                    fontStyle: 'italic',
                    fontSize: 13,
                    color: 'rgba(240,236,226,0.45)',
                  }}
                >
                  The lecturer is reading your slides and composing questions...
                </motion.p>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
