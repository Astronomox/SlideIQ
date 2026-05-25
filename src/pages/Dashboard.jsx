import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useUploads } from '../hooks/useUploads';
import { useIsMobile } from '../hooks/useIsMobile';
import QuizMode from '../components/QuizMode/QuizMode';
import UploadStep from '../components/Dashboard/UploadStep';
import PersonalityStep from '../components/Dashboard/PersonalityStep';
import ConfigStep from '../components/Dashboard/ConfigStep';
import GenerationStep from '../components/Dashboard/GenerationStep';
import { IconArrow } from '../components/Icons/Icons';
import { generateQuizContent } from '../api/client';
import { validateQuizGenerationInputs, validateQuizResponse } from '../utils/validation';
import { getErrorMessage, logError } from '../utils/errors';

const CTA_GRADIENT = 'linear-gradient(135deg, #a855f7 0%, #9333ea 60%, #7c3aed 100%)';

/**
 * Step indicator showing progress through wizard
 */
function StepIndicator({ steps, current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 36 }}>
      {steps.map((_, i) => {
        const isActive = i === current;
        const isCompleted = i < current;
        return (
          <React.Fragment key={i}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              border: isCompleted ? 'none' : `1.5px solid ${isActive ? '#a855f7' : 'rgba(168, 85, 247,0.20)'}`,
              background: isCompleted ? '#a855f7' : isActive ? 'rgba(168, 85, 247,0.10)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 11,
              fontWeight: 600,
              color: isCompleted ? '#0d1117' : isActive ? '#a855f7' : 'rgba(250,247,240,0.25)',
              flexShrink: 0,
              transition: 'all 0.3s',
            }}>
              {isCompleted ? (
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1,
                height: 1.5,
                margin: '0 8px',
                background: isCompleted ? '#a855f7' : 'rgba(168, 85, 247,0.12)',
                transition: 'background 0.3s',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/**
 * Navigation buttons for multi-step flow
 */
function StepNavigation({ step, canAdvance, onBack, onNext, isGenerating }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 32,
    }}>
      {step > 0 && (
        <button
          onClick={onBack}
          disabled={isGenerating}
          style={{
            all: 'unset',
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 11,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'rgba(250,247,240,0.35)',
            transition: 'color 0.15s',
            opacity: isGenerating ? 0.5 : 1,
          }}
          onMouseEnter={e => !isGenerating && (e.currentTarget.style.color = '#faf7f0')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(250,247,240,0.35)')}
        >
          ← Back
        </button>
      )}
      {step < 3 && canAdvance && (
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          disabled={isGenerating}
          style={{
            all: 'unset',
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '13px 24px',
            borderRadius: 8,
            background: CTA_GRADIENT,
            color: '#0d1117',
            fontFamily: '"Montserrat", sans-serif',
            fontWeight: 700,
            fontSize: 15,
            border: 'none',
            marginLeft: 'auto',
            opacity: isGenerating ? 0.6 : 1,
          }}
        >
          Continue <IconArrow size={15} />
        </motion.button>
      )}
    </div>
  );
}

/**
 * Main Dashboard component - orchestrates multi-step quiz generation workflow
 */
export default function Dashboard() {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Step state (0=upload, 1=personality, 2=config, 3=generation)
  const [step, setStep] = useState(0);
  const [activeUpload, setActiveUpload] = useState(null);
  const [selectedPersonality, setSelectedPersonality] = useState(null);
  const [mcqCount, setMcqCount] = useState(5);
  const [theoryCount, setTheoryCount] = useState(3);

  // Quiz generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [generatedContent, setGeneratedContent] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);

  const firstName = user?.displayName?.split(' ')[0] || 'Scholar';

  const handleUploadComplete = useCallback((doc) => {
    setActiveUpload(doc);
    setStep(1);
  }, []);

  const handlePersonalitySelect = useCallback((personality) => {
    setSelectedPersonality(personality);
  }, []);

  const handleGenerate = async () => {
    if (!activeUpload?.extractedText || !selectedPersonality) return;
    setIsGenerating(true);
    setGenerateError('');

    try {
      // Validate inputs
      const validation = validateQuizGenerationInputs({
        pdfFile: { type: 'application/pdf' },
        pdfText: activeUpload.extractedText,
        personality: selectedPersonality,
        mcqCount,
        theoryCount,
      });

      if (!validation.valid) {
        throw new Error(Object.values(validation.errors)[0]);
      }

      // Get Firebase ID token
      const idToken = await user.getIdToken();

      // Call backend API
      const content = await generateQuizContent({
        idToken,
        pdfText: activeUpload.extractedText,
        personality: selectedPersonality,
        mcqCount,
        theoryCount,
      });

      // Validate response
      const responseValidation = validateQuizResponse(content);
      if (!responseValidation.valid) {
        throw new Error(responseValidation.error);
      }

      setGeneratedContent(responseValidation.data);
      setShowQuiz(true);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logError('Dashboard.handleGenerate', err, {
        personality: selectedPersonality?.id,
        mcqCount,
        theoryCount,
      });
      setGenerateError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  // Show quiz if generated
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
          setActiveUpload(null);
          setSelectedPersonality(null);
        }}
      />
    );
  }

  // Wizard content
  const headings = [
    'Drop a lecture in.',
    'Choose your lecturer.',
    'Configure the quiz.',
    'Generate your quiz.',
  ];

  const subheadings = [
    'Upload a PDF — text is extracted in your browser and never stored on any server.',
    'Each lecturer has a distinct teaching style. Choose the one you want today.',
    'Set the number of MCQ and theory questions for your quiz.',
    'We\'ll generate your custom quiz in seconds.',
  ];

  return (
    <div style={{
      padding: isMobile ? '24px 16px' : '48px 56px',
      minHeight: '100%',
      position: 'relative',
    }}>
      {/* Atmospheric glow and texture */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 400,
        background: 'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(168, 85, 247,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <svg
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.035,
        }}
      >
        <filter id="dashGrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#dashGrain)" />
      </svg>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
          style={{ marginBottom: 28 }}
        >
          <div style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 11,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#a855f7',
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
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 900,
                fontSize: isMobile ? 32 : 56,
                color: '#faf7f0',
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
                fontFamily: '"Lora", serif',
                fontSize: 16,
                color: 'rgba(250,247,240,0.65)',
                lineHeight: 1.75,
                maxWidth: 520,
              }}
            >
              {subheadings[step]}
            </motion.p>
          </AnimatePresence>
        </motion.header>

        <StepIndicator steps={headings} current={step} />

        {/* Step content */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <UploadStep onUploadComplete={handleUploadComplete} isMobile={isMobile} />
          )}

          {step === 1 && (
            <PersonalityStep
              selectedPersonality={selectedPersonality}
              onSelect={handlePersonalitySelect}
              isMobile={isMobile}
            />
          )}

          {step === 2 && (
            <ConfigStep
              mcqCount={mcqCount}
              theoryCount={theoryCount}
              onMcqChange={setMcqCount}
              onTheoryChange={setTheoryCount}
              isMobile={isMobile}
            />
          )}

          {step === 3 && (
            <GenerationStep
              isGenerating={isGenerating}
              error={generateError}
              onGenerate={handleGenerate}
              onRetry={() => setGenerateError('')}
              selectedPersonality={selectedPersonality}
              mcqCount={mcqCount}
              theoryCount={theoryCount}
              isMobile={isMobile}
            />
          )}
        </AnimatePresence>

        {/* Navigation */}
        <StepNavigation
          step={step}
          canAdvance={
            (step === 0 && !!activeUpload) ||
            (step === 1 && !!selectedPersonality) ||
            (step === 2 && true)
          }
          onBack={() => setStep(Math.max(0, step - 1))}
          onNext={() => setStep(step === 2 ? 3 : step + 1)}
          isGenerating={isGenerating}
        />
      </div>
    </div>
  );
}
