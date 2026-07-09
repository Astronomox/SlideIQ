import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { IconGoogle } from '../components/Icons/Icons';
import { useIsMobile } from '../hooks/useIsMobile';

const CTA = 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 60%, #5b21b6 100%)';

// Floating particle for background
function Particle({ x, y, size, delay, duration }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 0.6, 0], scale: [0, 1, 0], y: [0, -80] }}
      transition={{ delay, duration, repeat: Infinity, repeatDelay: Math.random() * 4 }}
      style={{
        position: 'absolute', left: `${x}%`, top: `${y}%`,
        width: size, height: size, borderRadius: '50%',
        background: '#7c3aed', pointerEvents: 'none',
      }}
    />
  );
}

// Stagger container variants
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 260, damping: 24 } },
};

const cardVariants = {
  hidden: { opacity: 0, x: 40, filter: 'blur(12px)' },
  show: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 200, damping: 26, delay: 0.15 } },
};

export default function Login() {
  const { user, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isMobile = useIsMobile();

  // Magnetic effect for the sign-in card on desktop
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [4, -4]), { stiffness: 200, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-4, 4]), { stiffness: 200, damping: 30 });

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

  const particles = Array.from({ length: 12 }, (_, i) => ({
    x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 6, duration: Math.random() * 4 + 4,
  }));

  return (
    <div style={{
      width: '100vw', minHeight: '100vh',
      background: '#f7f5fb',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      overflow: isMobile ? 'auto' : 'hidden',
      position: 'relative',
    }}>
      {/* Floating particles */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {particles.map((p, i) => <Particle key={i} {...p} />)}
      </div>

      {/* Animated pulsing blob */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'fixed', top: '50%', left: '50%',
          width: '70vmax', height: '70vmax',
          marginTop: '-35vmax', marginLeft: '-35vmax',
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 55% at 50% 50%, rgba(124,58,237,0.07) 0%, transparent 65%)',
          willChange: 'transform, opacity',
        }}
      />

      {/* LEFT — brand statement */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{
          width: isMobile ? '100%' : '55%',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: isMobile ? '48px 28px 36px' : '0 64px 0 80px',
          gap: isMobile ? 20 : 28,
          position: 'relative', zIndex: 1,
          borderRight: isMobile ? 'none' : '1px solid rgba(124,58,237,0.10)',
          borderBottom: isMobile ? '1px solid rgba(124,58,237,0.10)' : 'none',
        }}
      >
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 60% at 30% 50%, rgba(124,58,237,0.04) 0%, transparent 70%)',
        }} />

        <motion.span variants={itemVariants} style={{
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: '#7c3aed', position: 'relative',
        }}>
          Est. MMXXVI  A Reader's Companion
        </motion.span>

        <motion.div
          variants={{ hidden: { scaleX: 0, opacity: 0 }, show: { scaleX: 1, opacity: 1, transition: { duration: 0.8, ease: [0.22,1,0.36,1] } } }}
          style={{
            width: 280, height: 1,
            background: 'linear-gradient(90deg, #7c3aed, rgba(124,58,237,0.10))',
            transformOrigin: 'left', position: 'relative',
          }}
        />

        <motion.h1
          variants={itemVariants}
          style={{
            fontFamily: '"Instrument Serif", serif',
            fontWeight: 400, fontSize: isMobile ? 40 : 84,
            lineHeight: 0.98, letterSpacing: '-0.015em', color: '#211a2e', position: 'relative',
          }}
        >
          Your slides,<br />
          <motion.span
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed, #5b21b6, #8b5cf6)',
              backgroundSize: '300% 300%',
              backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent',
              fontStyle: 'italic', display: 'inline-block',
            }}
          >
            re-read
          </motion.span>
          <br />aloud.
        </motion.h1>

        <motion.p variants={itemVariants} style={{
          fontFamily: '"Newsreader", serif',
          fontSize: 16, lineHeight: 1.75, color: 'rgba(33,26,46,0.72)', maxWidth: 440,
        }}>
          Upload a lecture. Choose a lecturer: patient, vicious, Harvard-grade, lazy.
          They'll explain your slides and quiz you in their own voice.
        </motion.p>

        <motion.div variants={itemVariants} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'rgba(33,26,46,0.48)', flexWrap: 'wrap',
        }}>
          {['Eight lecturers', 'MCQ & Theory', 'Scored'].map((tag, i) => (
            <React.Fragment key={tag}>
              {i > 0 && <span style={{ color: '#7c3aed' }}>·</span>}
              <motion.span
                whileHover={{ color: '#7c3aed', y: -1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                style={{ cursor: 'default' }}
              >
                {tag}
              </motion.span>
            </React.Fragment>
          ))}
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
          variants={cardVariants}
          initial="hidden"
          animate="show"
          onMouseMove={isMobile ? undefined : (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            mouseX.set(e.clientX - rect.left - rect.width / 2);
            mouseY.set(e.clientY - rect.top - rect.height / 2);
          }}
          onMouseLeave={isMobile ? undefined : () => { mouseX.set(0); mouseY.set(0); }}
          style={{
            width: '100%', maxWidth: 420,
            padding: isMobile ? '32px 24px' : '44px 40px',
            background: '#ffffff',
            border: '1px solid rgba(124,58,237,0.14)',
            borderRadius: 12,
            boxShadow: '0 4px 32px rgba(41,28,66,0.14), 0 0 0 1px rgba(124,58,237,0.06)',
            position: 'relative', overflow: 'hidden',
            rotateX: isMobile ? 0 : rotateX,
            rotateY: isMobile ? 0 : rotateY,
            transformStyle: 'preserve-3d',
            perspective: 1000,
          }}
        >
          {/* Corner glow */}
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', top: 0, right: 0, width: 160, height: 160,
              background: 'radial-gradient(circle at 80% 20%, rgba(124,58,237,0.12), transparent 65%)',
              pointerEvents: 'none',
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase',
              color: '#7c3aed', position: 'relative',
            }}
          >
            Sign in
          </motion.div>

          <motion.div
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.5, ease: 'easeOut' }}
            style={{
              width: '100%', height: 1,
              background: 'rgba(124,58,237,0.14)',
              margin: '14px 0 24px', transformOrigin: 'left',
            }}
          />

          <motion.h2
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, type: 'spring', stiffness: 260, damping: 24 }}
            style={{
              fontFamily: '"Instrument Serif", serif',
              fontWeight: 400, fontSize: 36, color: '#211a2e',
              lineHeight: 1.1, marginBottom: 10, position: 'relative',
            }}
          >
            Take your seat.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            style={{
              fontFamily: '"Newsreader", serif',
              fontSize: 14, color: 'rgba(33,26,46,0.64)',
              lineHeight: 1.65, marginBottom: 28, position: 'relative',
            }}
          >
            Sign in with the Google account you use for university work. Your uploads
            and quiz history are saved privately under that account.
          </motion.p>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                padding: '10px 14px',
                background: 'rgba(220,38,38,0.10)',
                border: '1px solid rgba(220,38,38,0.30)',
                borderRadius: 6, color: '#ef4444', fontSize: 13,
                fontFamily: '"Newsreader", serif', position: 'relative',
              }}
            >
              {error}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 0 32px rgba(124,58,237,0.35)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignIn}
            disabled={loading}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{
              width: '100%', padding: '15px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              background: CTA, color: '#ffffff', border: 'none', borderRadius: 8,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: '"Instrument Sans", sans-serif',
              fontWeight: 700, fontSize: 15,
              opacity: loading ? 0.65 : 1, transition: 'opacity 0.2s',
              position: 'relative',
            }}
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{
                    width: 20, height: 20, border: '2px solid rgba(255,255,255,0.35)',
                    borderTopColor: '#ffffff', borderRadius: '50%',
                  }}
                />
                Signing in...
              </>
            ) : (
              <>
                <IconGoogle size={20} />
                Continue with Google
              </>
            )}
          </motion.button>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            margin: '22px 0 18px',
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'rgba(33,26,46,0.42)', position: 'relative',
          }}>
            <span style={{ flex: 1, height: 1, background: 'rgba(124,58,237,0.12)' }} />
            Private &amp; secure
            <span style={{ flex: 1, height: 1, background: 'rgba(124,58,237,0.12)' }} />
          </div>

          <p style={{
            fontFamily: '"Newsreader", serif',
            fontSize: 12, color: 'rgba(33,26,46,0.45)',
            lineHeight: 1.6, textAlign: 'center', position: 'relative',
          }}>
            No marketing email. Ever. Your slides stay in your account.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
