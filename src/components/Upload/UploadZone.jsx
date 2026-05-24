import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUploads } from '../../hooks/useUploads';
import { IconUpload, IconDoc, IconX } from '../Icons/Icons';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const CTA = 'linear-gradient(135deg, #4ade80 0%, #22c55e 60%, #16a34a 100%)';

export default function UploadZone({ onUploadComplete }) {
  const { registerUpload } = useUploads();
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [pagesRead, setPagesRead] = useState(0);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [currentFile, setCurrentFile] = useState(null);

  const processFile = useCallback(async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setErrorMsg('Please upload a PDF file.');
      setStatus('error');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg('File exceeds 50 MB limit.');
      setStatus('error');
      return;
    }

    setCurrentFile(file);
    setErrorMsg('');
    setProgress(0);
    setPagesRead(0);

    try {
      setStatus('extracting');
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPageCount(pdf.numPages);

      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n\n';
        setProgress(Math.round((i / pdf.numPages) * 100));
        setPagesRead(i);
      }

      if (!text.trim()) {
        throw new Error('No text found in this PDF. It may be image-only or scanned.');
      }

      const doc = await registerUpload(file.name);
      setProgress(100);
      setStatus('done');

      if (onUploadComplete) {
        onUploadComplete({ ...doc, extractedText: text, numPages: pdf.numPages });
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to read the PDF. Please try again.');
      setStatus('error');
    }
  }, [registerUpload, onUploadComplete]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const reset = () => {
    setStatus('idle');
    setProgress(0);
    setPageCount(0);
    setPagesRead(0);
    setCurrentFile(null);
    setErrorMsg('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      onDrop={onDrop}
      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      style={{
        width: '100%',
        maxWidth: 680,
        padding: 'clamp(28px, 7vw, 60px) clamp(20px, 6vw, 48px)',
        border: isDragging
          ? '1.5px solid #4ade80'
          : '1.5px dashed rgba(74,222,128,0.22)',
        background: isDragging
          ? 'rgba(74,222,128,0.05)'
          : 'rgba(74,222,128,0.02)',
        borderRadius: 12,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', gap: 24, position: 'relative',
        transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
        boxShadow: isDragging ? '0 0 48px rgba(74,222,128,0.08)' : 'none',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={e => { const file = e.target.files?.[0]; if (file) processFile(file); }}
        style={{ display: 'none' }}
      />

      <AnimatePresence mode="wait">

        {/* IDLE */}
        {status === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%' }}
          >
            <div style={{ position: 'relative', width: 88, height: 88 }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                style={{
                  position: 'absolute', inset: -8, borderRadius: '50%',
                  border: '1px dashed rgba(74,222,128,0.18)', pointerEvents: 'none',
                }}
              />
              <motion.div
                animate={isDragging ? { scale: 1.08 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{
                  width: 88, height: 88,
                  border: '1px solid rgba(74,222,128,0.25)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#4ade80', background: 'rgba(74,222,128,0.05)',
                }}
              >
                <IconUpload size={34} stroke={1.4} />
              </motion.div>
            </div>

            <h2 style={{
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 700, fontSize: 'clamp(22px, 7vw, 32px)',
              letterSpacing: '-0.02em',
              color: '#faf7f0', lineHeight: 1.1, marginTop: 4,
            }}>
              {isDragging ? 'Release to read.' : 'Drag a lecture in.'}
            </h2>

            <p style={{
              fontFamily: '"Lora", serif',
              fontSize: 15, color: 'rgba(250,247,240,0.50)', maxWidth: 400, lineHeight: 1.6,
            }}>
              PDF only. Text is extracted in your browser — your file never leaves your device.
            </p>

            <button
              onClick={() => inputRef.current?.click()}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 26px', borderRadius: 8,
                background: CTA, color: '#0d1117',
                border: 'none', cursor: 'pointer',
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 700, fontSize: 15, letterSpacing: '0.01em',
              }}
            >
              <IconUpload size={16} stroke={2} /> Choose a PDF
            </button>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'rgba(250,247,240,0.28)', flexWrap: 'wrap', justifyContent: 'center',
            }}>
              <span>Max 50 MB</span>
              <span style={{ color: '#4ade80' }}>·</span>
              <span>Extracted in browser</span>
              <span style={{ color: '#4ade80' }}>·</span>
              <span>PDF never uploaded</span>
            </div>
          </motion.div>
        )}

        {/* EXTRACTING */}
        {status === 'extracting' && (
          <motion.div
            key="extracting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%' }}
          >
            <div style={{ color: '#4ade80' }}>
              <IconDoc size={52} stroke={1} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: 20, color: '#faf7f0', marginBottom: 6, fontWeight: 700,
              }}>
                Reading your slides...
              </div>
              <div style={{
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                fontSize: 12, color: 'rgba(250,247,240,0.38)', letterSpacing: '0.12em',
              }}>
                {currentFile?.name}
              </div>
            </div>

            <div style={{ width: '100%', maxWidth: 420 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', marginBottom: 8,
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                fontSize: 10, color: 'rgba(250,247,240,0.35)', letterSpacing: '0.12em',
              }}>
                <span>PAGE {pagesRead} OF {pageCount || '–'}</span>
                <span>EXTRACTING TEXT</span>
              </div>

              <div style={{
                width: '100%', height: 3,
                background: 'rgba(74,222,128,0.12)',
                borderRadius: 2, position: 'relative', overflow: 'hidden',
              }}>
                <motion.div
                  style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    background: 'linear-gradient(90deg, #22c55e, #4ade80, #86efac)',
                    borderRadius: 2,
                  }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                />
              </div>

              <div style={{
                textAlign: 'right', marginTop: 6,
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                fontSize: 11, color: 'rgba(250,247,240,0.38)', letterSpacing: '0.1em',
              }}>
                {progress}%
              </div>
            </div>
          </motion.div>
        )}

        {/* DONE */}
        {status === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20 }}
              style={{
                width: 68, height: 68, borderRadius: '50%',
                border: '1.5px solid #4ade80',
                background: 'rgba(74,222,128,0.10)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#4ade80',
              }}
            >
              <svg width={28} height={28} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>

            <div style={{ fontFamily: '"Montserrat", sans-serif', fontSize: 22, color: '#faf7f0', fontWeight: 700 }}>
              Slides read.
            </div>

            <div style={{
              fontFamily: '"Lora", serif',
              fontSize: 14, color: 'rgba(250,247,240,0.50)',
            }}>
              Text extracted — choose your lecturer.
            </div>

            <button
              onClick={reset}
              style={{
                all: 'unset', cursor: 'pointer',
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase',
                color: 'rgba(250,247,240,0.35)',
                padding: '6px 0',
                borderBottom: '1px solid rgba(74,222,128,0.22)',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#faf7f0'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(250,247,240,0.35)'}
            >
              Use a different PDF
            </button>
          </motion.div>
        )}

        {/* ERROR */}
        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}
          >
            <div style={{
              width: 68, height: 68, borderRadius: '50%',
              border: '1.5px solid rgba(239,68,68,0.55)',
              background: 'rgba(239,68,68,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#f87171',
            }}>
              <IconX size={28} stroke={2} />
            </div>

            <div style={{ fontFamily: '"Montserrat", sans-serif', fontSize: 18, color: '#faf7f0', fontWeight: 700 }}>
              Could not read PDF.
            </div>

            <div style={{
              fontFamily: '"Lora", serif',
              fontSize: 14, color: 'rgba(250,247,240,0.50)', maxWidth: 360, lineHeight: 1.6,
            }}>
              {errorMsg}
            </div>

            <button
              onClick={reset}
              style={{
                all: 'unset', cursor: 'pointer',
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase',
                color: '#4ade80',
                padding: '6px 0',
                borderBottom: '1px solid rgba(74,222,128,0.35)',
              }}
            >
              Try again
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}
