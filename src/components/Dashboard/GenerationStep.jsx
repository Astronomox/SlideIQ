import React from 'react';
import { motion } from 'framer-motion';
import { IconSparkle, IconArrow } from '../Icons/Icons';

/**
 * Step 3: Generate quiz and show progress
 */
function GenerationStep({
  isGenerating,
  error,
  onGenerate,
  onRetry,
  selectedPersonality,
  mcqCount,
  theoryCount,
  isMobile,
}) {
  const totalQuestions = mcqCount + theoryCount;

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        maxWidth: 520,
      }}
    >
      {/* Quiz Summary */}
      <div style={{
        background: '#ffffff',
        border: '1px solid rgba(124, 58, 237,0.12)',
        borderRadius: 10,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 11,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#7c3aed',
          }}>
            Quiz Summary
          </span>
          <span style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 13,
            color: 'rgba(33,26,46,0.60)',
          }}>
            {totalQuestions} total questions
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}>
          <div style={{
            padding: 12,
            backgroundColor: 'rgba(124, 58, 237, 0.05)',
            borderRadius: 8,
            border: '1px solid rgba(124, 58, 237, 0.12)',
          }}>
            <div style={{
              fontSize: 11,
              color: 'rgba(33,26,46,0.60)',
              marginBottom: 4,
              textTransform: 'uppercase',
              fontWeight: 500,
            }}>
              MCQ
            </div>
            <div style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#7c3aed',
            }}>
              {mcqCount}
            </div>
          </div>

          <div style={{
            padding: 12,
            backgroundColor: 'rgba(124, 58, 237, 0.05)',
            borderRadius: 8,
            border: '1px solid rgba(124, 58, 237, 0.12)',
          }}>
            <div style={{
              fontSize: 11,
              color: 'rgba(33,26,46,0.60)',
              marginBottom: 4,
              textTransform: 'uppercase',
              fontWeight: 500,
            }}>
              Theory
            </div>
            <div style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#7c3aed',
            }}>
              {theoryCount}
            </div>
          </div>
        </div>

        <div style={{
          paddingTop: 12,
          borderTop: '1px solid rgba(124, 58, 237, 0.12)',
          fontSize: 13,
          color: 'rgba(33,26,46,0.72)',
        }}>
          <span style={{ fontWeight: 500 }}>Personality:</span> {selectedPersonality?.title || 'Selected'}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(220,38,38, 0.10)',
            border: '1px solid rgba(220,38,38, 0.30)',
            borderRadius: 10,
            padding: 16,
            color: '#fecaca',
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          {error}
        </motion.div>
      )}

      {/* Generate Button or Loading State */}
      {!isGenerating && !error && (
        <button
          onClick={onGenerate}
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 60%, #5b21b6 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 10,
            padding: '16px 24px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 0.3s',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.30)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.40)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.30)';
          }}
        >
          <IconSparkle style={{ width: 18, height: 18 }} />
          Generate Quiz
          <IconArrow style={{ width: 16, height: 16 }} />
        </button>
      )}

      {isGenerating && (
        <motion.div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            padding: 24,
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '2px solid rgba(124, 58, 237, 0.20)',
              borderTopColor: '#7c3aed',
            }}
          />
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#211a2e',
              marginBottom: 4,
            }}>
              Generating your quiz...
            </div>
            <div style={{
              fontSize: 12,
              color: 'rgba(33,26,46,0.60)',
            }}>
              This may take up to 30 seconds
            </div>
          </div>
        </motion.div>
      )}

      {error && (
        <button
          onClick={onRetry}
          style={{
            background: 'transparent',
            color: '#7c3aed',
            border: '1.5px solid rgba(124, 58, 237, 0.50)',
            borderRadius: 8,
            padding: '12px 20px',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(124, 58, 237, 0.08)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          Try Again
        </button>
      )}
    </motion.div>
  );
}

export default GenerationStep;
