import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUploads } from '../../hooks/useUploads';
import { IconUpload, IconDoc, IconX } from '../Icons/Icons';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export default function UploadZone({ onUploadComplete }) {
  const { registerUpload } = useUploads();
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [pagesRead, setPagesRead] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | extracting | done | error
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
        const pct = Math.round((i / pdf.numPages) * 100);
        setProgress(pct);
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

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onFileChange = (e) => { const file = e.target.files?.[0]; if (file) processFile(file); };

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
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      style={{
        width: '100%',
        maxWidth: 680,
        padding: '60px 48px',
        border: isDragging
          ? '1.5px solid #c9a84c'
          : '1.5px dashed rgba(201,168,76,0.28)',
        background: isDragging
          ? 'rgba(201,168,76,0.07)'
          : 'rgba(201,168,76,0.02)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 24,
        position: 'relative',
        transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
        boxShadow: isDragging ? '0 0 60px rgba(201,168,76,0.12)' : 'none',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={onFileChange}
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
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 24,
              width: '100%',
            }}
          >
            {/* Upload icon circle with rotating outer ring */}
            <div style={{ position: 'relative', width: 88, height: 88 }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                style={{
                  position: 'absolute',
                  inset: -8,
                  borderRadius: '50%',
                  border: '1px dashed rgba(201,168,76,0.18)',
                  pointerEvents: 'none',
                }}
              />
              <motion.div
                animate={isDragging ? { scale: 1.08 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{
                  width: 88,
                  height: 88,
                  border: '1px solid rgba(201,168,76,0.3)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c9a84c',
                  background: 'rgba(201,168,76,0.04)',
                }}
              >
                <IconUpload size={34} stroke={1.4} />
              </motion.div>
            </div>

            {/* Heading */}
            <h2 style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontWeight: 700,
              fontSize: 36,
              color: '#f0ece2',
              lineHeight: 1.1,
              marginTop: 4,
            }}>
              {isDragging ? 'Release to read.' : 'Drag a lecture in.'}
            </h2>

            {/* Subtext */}
            <p style={{
              fontFamily: '"Source Serif 4", Georgia, serif',
              fontSize: 15,
              color: 'rgba(240,236,226,0.65)',
              maxWidth: 400,
              lineHeight: 1.6,
            }}>
              PDF only. Text is extracted in your browser — your file never leaves your device.
            </p>

            {/* Choose PDF button */}
            <button
              onClick={() => inputRef.current?.click()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '13px 26px',
                background: 'linear-gradient(135deg, #f3dc92 0%, #c9a84c 38%, #8e7426 72%, #d9be6a 100%)',
                color: '#1a1305',
                border: 'none',
                cursor: 'pointer',
                fontFamily: '"Playfair Display", Georgia, serif',
                fontWeight: 600,
                fontSize: 15,
                letterSpacing: '0.01em',
              }}
            >
              <IconUpload size={16} stroke={2} /> Choose a PDF
            </button>

            {/* Footer tags */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(240,236,226,0.38)',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
              <span>Max 50 MB</span>
              <span style={{ color: '#c9a84c' }}>·</span>
              <span>Extracted in browser</span>
              <span style={{ color: '#c9a84c' }}>·</span>
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
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 24,
              width: '100%',
            }}
          >
            <div style={{ color: '#c9a84c' }}>
              <IconDoc size={52} stroke={1} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: 22,
                color: '#f0ece2',
                marginBottom: 6,
              }}>
                Reading your slides...
              </div>
              <div style={{
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                fontSize: 12,
                color: 'rgba(240,236,226,0.45)',
                letterSpacing: '0.12em',
              }}>
                {currentFile?.name}
              </div>
            </div>

            <div style={{ width: '100%', maxWidth: 420 }}>
              {/* Page count above bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 8,
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                fontSize: 10,
                color: 'rgba(240,236,226,0.45)',
                letterSpacing: '0.12em',
              }}>
                <span>PAGE {pagesRead} OF {pageCount || '–'}</span>
                <span>EXTRACTING TEXT</span>
              </div>

              {/* Progress bar */}
              <div style={{
                width: '100%',
                height: 3,
                background: 'rgba(201,168,76,0.15)',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <motion.div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    background: 'linear-gradient(90deg, #8e7426, #c9a84c, #f3dc92)',
                  }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                />
              </div>

              {/* Percentage below */}
              <div style={{
                textAlign: 'right',
                marginTop: 6,
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                fontSize: 11,
                color: 'rgba(240,236,226,0.5)',
                letterSpacing: '0.1em',
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
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 20,
            }}
          >
            {/* Animated checkmark circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20 }}
              style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                border: '1.5px solid #c9a84c',
                background: 'rgba(201,168,76,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#c9a84c',
              }}
            >
              <svg width={28} height={28} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>

            <div style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 24,
              color: '#f0ece2',
            }}>
              Slides read.
            </div>

            <div style={{
              fontFamily: '"Source Serif 4", Georgia, serif',
              fontSize: 14,
              color: 'rgba(240,236,226,0.65)',
            }}>
              Text extracted — choose your lecturer.
            </div>

            <button
              onClick={reset}
              style={{
                all: 'unset',
                cursor: 'pointer',
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(240,236,226,0.45)',
                borderBottom: '1px solid rgba(201,168,76,0.25)',
                paddingBottom: 2,
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#f0ece2'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,236,226,0.45)'}
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
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 20,
            }}
          >
            {/* Error icon circle */}
            <div style={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              border: '1.5px solid rgba(156,43,43,0.6)',
              background: 'rgba(156,43,43,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(156,43,43,0.9)',
            }}>
              <IconX size={28} stroke={2} />
            </div>

            <div style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 20,
              color: '#f0ece2',
            }}>
              Could not read PDF.
            </div>

            <div style={{
              fontFamily: '"Source Serif 4", Georgia, serif',
              fontSize: 14,
              color: 'rgba(240,236,226,0.65)',
              maxWidth: 360,
              lineHeight: 1.6,
            }}>
              {errorMsg}
            </div>

            <button
              onClick={reset}
              style={{
                all: 'unset',
                cursor: 'pointer',
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#c9a84c',
                borderBottom: '1px solid rgba(201,168,76,0.4)',
                paddingBottom: 2,
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
