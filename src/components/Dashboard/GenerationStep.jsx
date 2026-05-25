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
        background: '#161b22',
        border: '1px solid rgba(168, 85, 247,0.12)',
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
            color: '#a855f7',
          }}>
            Quiz Summary
          </span>
          <span style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 13,
            color: 'rgba(250,247,240,0.50)',
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
            backgroundColor: 'rgba(168, 85, 247, 0.05)',
            borderRadius: 8,
            border: '1px solid rgba(168, 85, 247, 0.12)',
          }}>
            <div style={{
              fontSize: 11,
              color: 'rgba(250,247,240,0.50)',
              marginBottom: 4,
              textTransform: 'uppercase',
              fontWeight: 500,
            }}>
              MCQ
            </div>
            <div style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#a855f7',
            }}>
              {mcqCount}
            </div>
          </div>

          <div style={{
            padding: 12,
            backgroundColor: 'rgba(168, 85, 247, 0.05)',
            borderRadius: 8,
            border: '1px solid rgba(168, 85, 247, 0.12)',
          }}>
            <div style={{
              fontSize: 11,
              color: 'rgba(250,247,240,0.50)',
              marginBottom: 4,
              textTransform: 'uppercase',
              fontWeight: 500,
            }}>
              Theory
            </div>
            <div style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#a855f7',
            }}>
              {theoryCount}
            </div>
          </div>
        </div>

        <div style={{
          paddingTop: 12,
          borderTop: '1px solid rgba(168, 85, 247, 0.12)',
          fontSize: 13,
          color: 'rgba(250,247,240,0.65)',
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
            background: 'rgba(239, 68, 68, 0.10)',
            border: '1px solid rgba(239, 68, 68, 0.30)',
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
            background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 60%, #7c3aed 100%)',
            color: '#faf7f0',
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
            boxShadow: '0 4px 12px rgba(168, 85, 247, 0.30)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(168, 85, 247, 0.40)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(168, 85, 247, 0.30)';
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
              border: '2px solid rgba(168, 85, 247, 0.20)',
              borderTopColor: '#a855f7',
            }}
          />
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#faf7f0',
              marginBottom: 4,
            }}>
              Generating your quiz...
            </div>
            <div style={{
              fontSize: 12,
              color: 'rgba(250,247,240,0.50)',
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
            color: '#a855f7',
            border: '1.5px solid rgba(168, 85, 247, 0.50)',
            borderRadius: 8,
            padding: '12px 20px',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(168, 85, 247, 0.08)';
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
