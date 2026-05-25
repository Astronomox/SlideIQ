import React from 'react';
import { motion } from 'framer-motion';
import UploadZone from '../Upload/UploadZone';

/**
 * Step 0: Upload PDF lecture slide
 */
function UploadStep({ onUploadComplete, isMobile }) {
  return (
    <motion.div
      key="step0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
      style={{ display: 'flex', justifyContent: 'center' }}
    >
      <UploadZone onUploadComplete={onUploadComplete} />
    </motion.div>
  );
}

export default UploadStep;
