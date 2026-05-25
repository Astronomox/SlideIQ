import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PersonalitySelector from '../PersonalitySelector/PersonalitySelector';

/**
 * Step 1: Select teacher personality
 */
function PersonalityStep({ selectedPersonality, onSelect, isMobile }) {
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
    >
      <PersonalitySelector
        selectedPersonality={selectedPersonality}
        onSelect={onSelect}
      />
    </motion.div>
  );
}

export default PersonalityStep;
