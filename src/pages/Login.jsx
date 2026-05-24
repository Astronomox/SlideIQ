import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { IconGoogle } from '../components/Icons/Icons';

export default function Login() {
  const { user, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      height: '100vh',
      background: '#0a0f1e',
      display: 'flex',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Global atmosphere glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 80% 60% at 30% 50%, rgba(201,168,76,0.05) 0%, transparent 70%),
          radial-gradient(ellipse 60% 50% at 80% 60%, rgba(201,168,76,0.03) 0%, transparent 70%),
          radial-gradient(120% 90% at 50% 110%, rgba(0,0,0,0.5) 0%, transparent 60%)
        `,
      }} />

      {/* LEFT — brand statement (55%) */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '55%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 64px 0 80px',
          gap: 32,
          position: 'relative',
          zIndex: 1,
          borderRight: '1px solid rgba(201,168,76,0.12)',
        }}
      >
        {/* Left radial glow behind content */}
        <div style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 60% at 30% 50%, rgba(201,168,76,0.06) 0%, transparent 70%)',
        }} />

        {/* Gold eyebrow */}
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 11,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#c9a84c',
            position: 'relative',
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
            width: 280,
            height: 1,
            background: 'linear-gradient(90deg, #c9a84c, rgba(201,168,76,0.3))',
            transformOrigin: 'left',
            position: 'relative',
          }}
        />

        {/* Hero headline */}
        <div style={{ position: 'relative' }}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontWeight: 900,
              fontSize: 80,
              lineHeight: 0.92,
              letterSpacing: '-0.025em',
              color: '#f0ece2',
            }}
          >
            Your slides,
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #f3dc92 0%, #c9a84c 38%, #8e7426 72%, #d9be6a 100%)',
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
            fontFamily: '"Source Serif 4", Georgia, serif',
            fontSize: 18,
            lineHeight: 1.65,
            color: 'rgba(240,236,226,0.72)',
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
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(240,236,226,0.4)',
            flexWrap: 'wrap',
          }}
        >
          <span>Eight lecturers</span>
          <span style={{ color: '#c9a84c' }}>·</span>
          <span>MCQ &amp; Theory</span>
          <span style={{ color: '#c9a84c' }}>·</span>
          <span>Scored</span>
        </motion.div>
      </motion.div>

      {/* RIGHT — sign-in card (45%) */}
      <div style={{
        width: '45%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 48px',
        position: 'relative',
        zIndex: 1,
      }}>
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: '100%',
            maxWidth: 420,
            padding: '44px 40px',
            background: '#141b34',
            border: '1px solid rgba(201,168,76,0.25)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Corner radial glow */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 120,
            height: 120,
            background: 'radial-gradient(circle at 80% 20%, rgba(201,168,76,0.35), transparent 65%)',
            pointerEvents: 'none',
          }} />

          {/* Sign in eyebrow */}
          <div style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 10,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: '#c9a84c',
            marginBottom: 0,
            position: 'relative',
          }}>
            Sign in
          </div>

          {/* Thin gold rule */}
          <div style={{
            width: '100%',
            height: 1,
            background: 'rgba(201,168,76,0.3)',
            margin: '14px 0 24px',
          }} />

          {/* Heading */}
          <h2 style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontWeight: 700,
            fontSize: 32,
            color: '#f0ece2',
            lineHeight: 1.1,
            marginBottom: 10,
            position: 'relative',
          }}>
            Take your seat.
          </h2>

          {/* Description */}
          <p style={{
            fontFamily: '"Source Serif 4", Georgia, serif',
            fontSize: 14,
            color: 'rgba(240,236,226,0.65)',
            lineHeight: 1.65,
            marginBottom: 28,
            position: 'relative',
          }}>
            Sign in with the Google account you use for university work. Your uploads
            and quiz history are saved privately under that account.
          </p>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '10px 14px',
                marginBottom: 16,
                background: 'rgba(156,43,43,0.15)',
                border: '1px solid rgba(156,43,43,0.4)',
                color: '#c97272',
                fontSize: 13,
                fontFamily: '"Source Serif 4", Georgia, serif',
                position: 'relative',
              }}
            >
              {error}
            </motion.div>
          )}

          {/* Google sign-in button */}
          <motion.button
            whileHover={{ opacity: 0.92 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleSignIn}
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              background: '#f0ece2',
              color: '#0a0f1e',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: '"Source Serif 4", Georgia, serif',
              fontWeight: 600,
              fontSize: 15,
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.2s',
              position: 'relative',
            }}
          >
            <IconGoogle size={20} />
            {loading ? 'Signing in...' : 'Continue with Google'}
          </motion.button>

          {/* Private & secure divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            margin: '22px 0 18px',
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 10,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(240,236,226,0.4)',
            position: 'relative',
          }}>
            <span style={{ flex: 1, height: 1, background: 'rgba(201,168,76,0.18)' }} />
            Private &amp; secure
            <span style={{ flex: 1, height: 1, background: 'rgba(201,168,76,0.18)' }} />
          </div>

          {/* Fine print */}
          <p style={{
            fontFamily: '"Source Serif 4", Georgia, serif',
            fontSize: 12,
            color: 'rgba(240,236,226,0.4)',
            lineHeight: 1.6,
            textAlign: 'center',
            position: 'relative',
          }}>
            No marketing email. Ever. Your slides stay in your account.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
