import React from 'react';
import { motion } from 'framer-motion';
import HistoryComponent from '../components/History/History';

export default function HistoryPage() {
  return (
    <div style={{ padding: '48px 56px', minHeight: '100%', position: 'relative' }}>
      {/* Top glow */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 400,
        background: 'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(201,168,76,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 36 }}
        >
          <div style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 11,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#c9a84c',
            marginBottom: 10,
          }}>
            Your record
          </div>
          <h1 style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontWeight: 900,
            fontSize: 56,
            color: '#f0ece2',
            letterSpacing: '-0.02em',
            lineHeight: 1.0,
            marginBottom: 10,
          }}>
            Quiz History
          </h1>
          <p style={{
            fontFamily: '"Source Serif 4", Georgia, serif',
            fontSize: 17,
            color: 'rgba(240,236,226,0.65)',
            maxWidth: 520,
            lineHeight: 1.65,
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
