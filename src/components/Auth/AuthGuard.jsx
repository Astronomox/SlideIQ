import React from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Wordmark } from '../Icons/Icons';

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        width: '100vw', height: '100vh', background: '#f7f5fb',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 24,
      }}>
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Wordmark size={28} />
        </motion.div>
        <motion.div
          style={{
            width: 200, height: 1,
            background: 'linear-gradient(90deg, transparent, #7c3aed, transparent)',
          }}
          animate={{ scaleX: [0, 1, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}
