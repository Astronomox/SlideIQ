import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { IconGoogle } from '../components/Icons/Icons';
import { useIsMobile } from '../hooks/useIsMobile';

const CTA = 'linear-gradient(135deg, #4ade80 0%, #22c55e 60%, #16a34a 100%)';

export default function Login() {
  const { user, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isMobile = useIsMobile();

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setError('Sign-in failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: '#0d1117',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      overflow: isMobile ? 'auto' : 'hidden',
      position: 'relative',
    }}>
      {/* Animated pulsing blob */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        width: '70vmax', height: '70vmax',
        marginTop: '-35vmax', marginLeft: '-35vmax',
        pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 55% at 50% 50%, rgba(74,222,128,0.06) 0%, transparent 65%)',
        animation: 'pulse-glow 8s ease-in-out infinite',
        willChange: 'transform, opacity',
      }} />
      {/* Static secondary atmosphere */}
      <div style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        background: 'radial-gradient(ellipse 50% 50% at 80% 60%, rgba(74,222,128,0.025) 0%, transparent 70%)',
      }} />

      {/* LEFT — brand statement */}
      <motion.div
        initial={{ opacity: 0, x: isMobile ? 0 : -40, y: isMobile ? 20 : 0 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
        style={{
          width: isMobile ? '100%' : '55%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: isMobile ? '48px 28px 36px' : '0 64px 0 80px',
          gap: isMobile ? 20 : 32,
          position: 'relative',
          zIndex: 1,
          borderRight: isMobile ? 'none' : '1px solid rgba(74,222,128,0.10)',
          borderBottom: isMobile ? '1px solid rgba(74,222,128,0.10)' : 'none',
        }}
      >
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 60% at 30% 50%, rgba(74,222,128,0.04) 0%, transparent 70%)',
        }} />

        {/* Eyebrow */}
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
            color: '#4ade80', position: 'relative',
          }}
        >
          Est. MMXXVI · A Reader's Companion
        </motion.span>

        {/* Ornament rule */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.6, ease: 'easeOut' }}
          style={{
            width: 280, height: 1,
            background: 'linear-gradient(90deg, #4ade80, rgba(74,222,128,0.15))',
            transformOrigin: 'left', position: 'relative',
          }}
        />

        {/* Hero headline */}
        <div style={{ position: 'relative' }}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 900,
              fontSize: isMobile ? 32 : 76,
              lineHeight: 0.95,
              letterSpacing: '-0.02em',
              color: '#faf7f0',
            }}
          >
            Your slides,
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #86efac 0%, #4ade80 40%, #22c55e 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              fontStyle: 'italic',
            }}>
              re-read
            </span>
            <br />
            aloud.
          </motion.h1>
        </div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          style={{
            fontFamily: '"Lora", serif',
            fontSize: 16, lineHeight: 1.75,
            color: 'rgba(250,247,240,0.65)',
            maxWidth: 440,
          }}
        >
          Upload a lecture. Choose a lecturer — patient, vicious, Harvard-grade, lazy.
          They'll explain your slides and quiz you in their own voice.
        </motion.p>

        {/* Feature tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'rgba(250,247,240,0.35)', flexWrap: 'wrap',
          }}
        >
          <span>Eight lecturers</span>
          <span style={{ color: '#4ade80' }}>·</span>
          <span>MCQ &amp; Theory</span>
          <span style={{ color: '#4ade80' }}>·</span>
          <span>Scored</span>
        </motion.div>
      </motion.div>

      {/* RIGHT — sign-in card */}
      <div style={{
        width: isMobile ? '100%' : '45%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: isMobile ? '36px 20px 52px' : '0 48px',
        position: 'relative', zIndex: 1,
      }}>
        <motion.div
          initial={{ opacity: 0, x: isMobile ? 0 : 40, y: isMobile ? 20 : 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
          style={{
            width: '100%', maxWidth: 420,
            padding: isMobile ? '32px 24px' : '44px 40px',
            background: '#161b22',
            border: '1px solid rgba(74,222,128,0.14)',
            borderRadius: 12,
            boxShadow: '0 4px 32px rgba(0,0,0,0.40), 0 0 0 1px rgba(74,222,128,0.06)',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Corner glow */}
          <div style={{
            position: 'absolute', top: 0, right: 0, width: 140, height: 140,
            background: 'radial-gradient(circle at 80% 20%, rgba(74,222,128,0.08), transparent 65%)',
            pointerEvents: 'none',
          }} />

          <div style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase',
            color: '#4ade80', position: 'relative',
          }}>
            Sign in
          </div>

          <div style={{
            width: '100%', height: 1,
            background: 'rgba(74,222,128,0.14)',
            margin: '14px 0 24px',
          }} />

          <h2 style={{
            fontFamily: '"Montserrat", sans-serif',
            fontWeight: 700, fontSize: 32, color: '#faf7f0',
            lineHeight: 1.1, marginBottom: 10, position: 'relative',
          }}>
            Take your seat.
          </h2>

          <p style={{
            fontFamily: '"Lora", serif',
            fontSize: 14, color: 'rgba(250,247,240,0.55)',
            lineHeight: 1.65, marginBottom: 28, position: 'relative',
          }}>
            Sign in with the Google account you use for university work. Your uploads
            and quiz history are saved privately under that account.
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '10px 14px', marginBottom: 16,
                background: 'rgba(239,68,68,0.10)',
                border: '1px solid rgba(239,68,68,0.30)',
                borderRadius: 6,
                color: '#f87171', fontSize: 13,
                fontFamily: '"Lora", serif',
                position: 'relative',
              }}
            >
              {error}
            </motion.div>
          )}

          <motion.button
            whileHover={{ opacity: 0.88 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleSignIn}
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              background: CTA,
              color: '#0d1117', border: 'none', borderRadius: 8,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 700, fontSize: 15,
              opacity: loading ? 0.65 : 1, transition: 'opacity 0.2s',
              position: 'relative',
            }}
          >
            <IconGoogle size={20} />
            {loading ? 'Signing in...' : 'Continue with Google'}
          </motion.button>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            margin: '22px 0 18px',
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'rgba(250,247,240,0.28)', position: 'relative',
          }}>
            <span style={{ flex: 1, height: 1, background: 'rgba(74,222,128,0.12)' }} />
            Private &amp; secure
            <span style={{ flex: 1, height: 1, background: 'rgba(74,222,128,0.12)' }} />
          </div>

          <p style={{
            fontFamily: '"Lora", serif',
            fontSize: 12, color: 'rgba(250,247,240,0.30)',
            lineHeight: 1.6, textAlign: 'center', position: 'relative',
          }}>
            No marketing email. Ever. Your slides stay in your account.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
