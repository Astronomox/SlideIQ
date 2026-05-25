import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HistoryComponent from '../components/History/History';
import { useIsMobile } from '../hooks/useIsMobile';
import { useQuizHistory } from '../hooks/useQuizHistory';

function ClearHistoryModal({ onConfirm, onCancel, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(13,17,23,0.88)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#161b22',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 12,
          padding: '32px 28px',
          maxWidth: 400, width: '100%',
          boxShadow: '0 24px 60px rgba(0,0,0,0.60)',
        }}
      >
        {/* Warning icon */}
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'rgba(239,68,68,0.10)',
          border: '1px solid rgba(239,68,68,0.30)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
          color: '#ef4444',
        }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>

        <div style={{
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: '#ef4444', marginBottom: 8,
        }}>
          Permanent action
        </div>

        <h3 style={{
          fontFamily: '"Montserrat", sans-serif',
          fontWeight: 700, fontSize: 20, color: '#faf7f0',
          letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 12,
        }}>
          Clear all quiz history?
        </h3>

        <p style={{
          fontFamily: '"Lora", serif',
          fontSize: 14, color: 'rgba(250,247,240,0.60)', lineHeight: 1.65,
          marginBottom: 28,
        }}>
          This will permanently delete every quiz result from your account. This cannot be undone. Your uploaded slides are not affected.
        </p>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              all: 'unset', cursor: loading ? 'wait' : 'pointer',
              flex: 1, padding: '12px 18px', textAlign: 'center',
              background: loading ? 'rgba(239,68,68,0.10)' : 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.40)',
              borderRadius: 8, color: '#ef4444',
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 700, fontSize: 14,
              transition: 'background 0.15s',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Clearing...' : 'Yes, clear all'}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              all: 'unset', cursor: 'pointer',
              flex: 1, padding: '12px 18px', textAlign: 'center',
              background: 'rgba(250,247,240,0.05)',
              border: '1px solid rgba(250,247,240,0.12)',
              borderRadius: 8, color: 'rgba(250,247,240,0.65)',
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 600, fontSize: 14,
            }}
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function HistoryPage() {
  const isMobile = useIsMobile();
  const { clearHistory } = useQuizHistory();
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleClearConfirm = async () => {
    setClearing(true);
    try {
      await clearHistory();
      setShowClearModal(false);
    } catch {
      // silently fail — history component will still show
    } finally {
      setClearing(false);
    }
  };

  return (
    <div style={{ padding: isMobile ? '24px 16px' : '48px 56px', minHeight: '100%', position: 'relative' }}>
      {/* Top glow */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 400,
        background: 'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(168, 85, 247,0.05) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
          style={{ marginBottom: 36 }}
        >
          <div style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 16,
          }}>
            <div>
              <div style={{
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
                color: '#a855f7', marginBottom: 10,
              }}>
                Your record
              </div>
              <h1 style={{
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 900,
                fontSize: isMobile ? 32 : 56,
                color: '#faf7f0',
                letterSpacing: '-0.02em',
                lineHeight: 1.0,
                marginBottom: 10,
              }}>
                Quiz History
              </h1>
              <p style={{
                fontFamily: '"Lora", serif',
                fontSize: 16,
                color: 'rgba(250,247,240,0.65)',
                maxWidth: 520,
                lineHeight: 1.75,
              }}>
                Every quiz you've completed, preserved here. Click any entry to review
                questions, your answers, and model answers side by side.
              </p>
            </div>

            {/* Clear history button */}
            <motion.button
              whileHover={{ borderColor: 'rgba(239,68,68,0.50)', color: '#ef4444' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowClearModal(true)}
              style={{
                all: 'unset', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 16px', alignSelf: 'flex-start',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 8,
                color: 'rgba(239,68,68,0.65)',
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
                transition: 'border-color 0.15s, color 0.15s',
                marginTop: isMobile ? 0 : 8,
              }}
            >
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
              Clear history
            </motion.button>
          </div>
        </motion.header>

        <HistoryComponent />
      </div>

      <AnimatePresence>
        {showClearModal && (
          <ClearHistoryModal
            onConfirm={handleClearConfirm}
            onCancel={() => setShowClearModal(false)}
            loading={clearing}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
