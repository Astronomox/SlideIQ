import React from 'react';
import { motion } from 'framer-motion';
import HistoryComponent from '../components/History/History';
import { useIsMobile } from '../hooks/useIsMobile';

export default function HistoryPage() {
  const isMobile = useIsMobile();

  return (
    <div style={{ padding: isMobile ? '24px 16px' : '48px 56px', minHeight: '100%', position: 'relative' }}>
      {/* Top glow */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 400,
        background: 'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(74,222,128,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
          style={{ marginBottom: 36 }}
        >
          <div style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 11,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#4ade80',
            marginBottom: 10,
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
        </motion.header>

        <HistoryComponent />
      </div>
    </div>
  );
}
