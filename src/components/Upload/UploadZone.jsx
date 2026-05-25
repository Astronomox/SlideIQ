import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUploads } from '../../hooks/useUploads';
import { IconUpload, IconDoc, IconX } from '../Icons/Icons';
import { savePDFLocally } from '../../hooks/usePDFStore';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const CTA = 'linear-gradient(135deg, #a855f7 0%, #9333ea 60%, #7c3aed 100%)';

// Supported file types
const ACCEPTED_TYPES = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
  'application/vnd.ms-powerpoint': 'PPT',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.ms-excel': 'XLS',
  'text/plain': 'TXT',
  'text/markdown': 'MD',
  'text/x-markdown': 'MD',
};

const ACCEPTED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.pptx', '.ppt', '.xlsx', '.xls', '.txt', '.md'];

function getFileType(file) {
  if (ACCEPTED_TYPES[file.type]) return ACCEPTED_TYPES[file.type];
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  const extMap = {
    '.pdf': 'PDF', '.docx': 'DOCX', '.doc': 'DOC',
    '.pptx': 'PPTX', '.ppt': 'PPT',
    '.xlsx': 'XLSX', '.xls': 'XLS',
    '.txt': 'TXT', '.md': 'MD',
  };
  return extMap[ext] || null;
}

// ── Extractors ────────────────────────────────────────────────────────────────

async function extractPDF(file, onProgress, onStatusMsg) {
  const arrayBuffer = await file.arrayBuffer();
  const bufferCopy = arrayBuffer.slice(0);
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';
  let needsOCR = false;
  const pageTexts = [];

  // First pass — try native text extraction on every page
  onStatusMsg('Extracting text...');
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ').trim();
    pageTexts.push({ page, index: i, text: pageText });
    if (!pageText) needsOCR = true;
    onProgress(Math.round((i / pdf.numPages) * 40), i, pdf.numPages);
  }

  // If all pages have text, we're done
  if (!needsOCR) {
    fullText = pageTexts.map(p => p.text).join('\n\n');
    return { text: fullText, buffer: bufferCopy, pages: pdf.numPages };
  }

  // Load Tesseract for OCR on image-only pages
  onStatusMsg('Image PDF detected — running OCR...');
  const { createWorker } = await import('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.esm.min.js');
  const worker = await createWorker('eng', 1, {
    logger: () => {},
  });

  for (let i = 0; i < pageTexts.length; i++) {
    const { page, index, text: existingText } = pageTexts[i];

    if (existingText) {
      // Page already has text
      fullText += existingText + '\n\n';
    } else {
      // Render page to canvas and OCR it
      onStatusMsg(`OCR: page ${index} of ${pdf.numPages}...`);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;

      const { data: { text: ocrText } } = await worker.recognize(canvas);
      fullText += (ocrText || '').trim() + '\n\n';
      canvas.remove?.();
    }

    onProgress(40 + Math.round(((i + 1) / pageTexts.length) * 60), index, pdf.numPages);
  }

  await worker.terminate();

  if (!fullText.trim()) {
    throw new Error('No text could be extracted. The PDF may be corrupted or encrypted.');
  }

  return { text: fullText, buffer: bufferCopy, pages: pdf.numPages };
}

async function extractDOCX(file, onProgress) {
  onProgress(30, 0, 1);
  const { default: mammoth } = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  onProgress(70, 0, 1);
  const result = await mammoth.extractRawText({ arrayBuffer });
  onProgress(100, 1, 1);
  return { text: result.value, buffer: arrayBuffer, pages: 1 };
}

async function extractPPTX(file, onProgress) {
  onProgress(20, 0, 1);
  const JSZip = (await import('jszip')).default;
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  onProgress(50, 0, 1);

  const slideFiles = Object.keys(zip.files)
    .filter(name => name.match(/^ppt\/slides\/slide\d+\.xml$/))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)/)?.[1] || 0);
      const nb = parseInt(b.match(/slide(\d+)/)?.[1] || 0);
      return na - nb;
    });

  let text = '';
  for (let i = 0; i < slideFiles.length; i++) {
    const xml = await zip.files[slideFiles[i]].async('string');
    // Extract text nodes from XML
    const matches = xml.match(/<a:t[^>]*>([^<]+)<\/a:t>/g) || [];
    const slideText = matches.map(m => m.replace(/<[^>]+>/g, '')).join(' ');
    if (slideText.trim()) {
      text += `--- Slide ${i + 1} ---\n${slideText}\n\n`;
    }
    onProgress(50 + Math.round((i / slideFiles.length) * 50), i + 1, slideFiles.length);
  }

  if (!text.trim()) throw new Error('No text found in presentation. Slides may be image-only.');
  return { text, buffer: arrayBuffer, pages: slideFiles.length };
}

async function extractXLSX(file, onProgress) {
  onProgress(30, 0, 1);
  const XLSX = await import('xlsx');
  const arrayBuffer = await file.arrayBuffer();
  onProgress(60, 0, 1);
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  let text = '';
  workbook.SheetNames.forEach((sheetName, i) => {
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet);
    text += `--- Sheet: ${sheetName} ---\n${csv}\n\n`;
  });
  onProgress(100, 1, 1);
  if (!text.trim()) throw new Error('No data found in spreadsheet.');
  return { text, buffer: arrayBuffer, pages: workbook.SheetNames.length };
}

async function extractTXT(file, onProgress) {
  onProgress(50, 0, 1);
  const text = await file.text();
  onProgress(100, 1, 1);
  return { text, buffer: await file.arrayBuffer(), pages: 1 };
}

// ── File type icons ───────────────────────────────────────────────────────────
function FileTypeIcon({ type, size = 32 }) {
  const colors = {
    PDF: '#ef4444', DOCX: '#3b82f6', DOC: '#3b82f6',
    PPTX: '#f97316', PPT: '#f97316',
    XLSX: '#22c55e', XLS: '#22c55e',
    TXT: '#a855f7', MD: '#a855f7',
  };
  const color = colors[type] || '#a855f7';
  return (
    <div style={{
      width: size, height: size, borderRadius: 6, flexShrink: 0,
      background: `${color}18`, border: `1px solid ${color}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
      fontSize: size * 0.28, fontWeight: 700, color, letterSpacing: '-0.02em',
    }}>
      {type}
    </div>
  );
}

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
  const [fileType, setFileType] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');

  const processFile = useCallback(async (file) => {
    const type = getFileType(file);
    if (!type) {
      setErrorMsg(`Unsupported file type. Please upload: ${ACCEPTED_EXTENSIONS.join(', ')}`);
      setStatus('error');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg('File exceeds 50 MB limit.');
      setStatus('error');
      return;
    }

    setCurrentFile(file);
    setFileType(type);
    setErrorMsg('');
    setProgress(0);
    setPagesRead(0);
    setStatusMsg('');
    setStatus('extracting');

    const onProgress = (pct, read, total) => {
      setProgress(pct);
      setPagesRead(read);
      setPageCount(total);
    };

    const onStatusMsg = (msg) => setStatusMsg(msg);

    try {
      let result;

      if (type === 'PDF') {
        result = await extractPDF(file, onProgress, onStatusMsg);
      } else if (type === 'DOCX' || type === 'DOC') {
        result = await extractDOCX(file, onProgress);
      } else if (type === 'PPTX' || type === 'PPT') {
        result = await extractPPTX(file, onProgress);
      } else if (type === 'XLSX' || type === 'XLS') {
        result = await extractXLSX(file, onProgress);
      } else if (type === 'TXT' || type === 'MD') {
        result = await extractTXT(file, onProgress);
      }

      if (!result.text.trim()) {
        throw new Error('No text could be extracted from this file.');
      }

      const doc = await registerUpload(file.name);

      if (result.buffer) {
        await savePDFLocally(doc.id, file.name, result.buffer);
      }

      setProgress(100);
      setStatus('done');

      if (onUploadComplete) {
        onUploadComplete({ ...doc, extractedText: result.text, numPages: result.pages });
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to read this file. Please try again.');
      setStatus('error');
    }
  }, [registerUpload, onUploadComplete]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const labelText = {
    PDF: 'Extracting pages',
    PPTX: 'Reading slides', PPT: 'Reading slides',
    DOCX: 'Reading document', DOC: 'Reading document',
    XLSX: 'Reading sheets', XLS: 'Reading sheets',
    TXT: 'Reading file', MD: 'Reading file',
  }[fileType] || 'Extracting';

  return (
    <div style={{ width: '100%', maxWidth: 680 }}>
      <AnimatePresence mode="wait">

        {/* IDLE */}
        {status === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? '#a855f7' : 'rgba(168,85,247,0.25)'}`,
              borderRadius: 12,
              padding: '52px 32px',
              textAlign: 'center',
              cursor: 'pointer',
              background: isDragging ? 'rgba(168,85,247,0.05)' : 'transparent',
              transition: 'border-color 0.2s, background 0.2s',
            }}
          >
            <motion.div
              animate={isDragging ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                width: 56, height: 56, margin: '0 auto 20px',
                borderRadius: 12,
                background: 'rgba(168,85,247,0.10)',
                border: '1px solid rgba(168,85,247,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#a855f7',
              }}
            >
              <IconUpload size={24} />
            </motion.div>

            <h3 style={{
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 700, fontSize: 18, color: '#faf7f0',
              letterSpacing: '-0.01em', marginBottom: 8,
            }}>
              Drop your lecture here
            </h3>

            <p style={{
              fontFamily: '"Lora", serif',
              fontSize: 14, color: 'rgba(250,247,240,0.50)', lineHeight: 1.6, marginBottom: 24,
            }}>
              or click to browse your files
            </p>

            {/* Supported formats */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 20,
            }}>
              {[
                { type: 'PDF', color: '#ef4444' },
                { type: 'PPTX', color: '#f97316' },
                { type: 'DOCX', color: '#3b82f6' },
                { type: 'XLSX', color: '#22c55e' },
                { type: 'TXT', color: '#a855f7' },
                { type: 'MD', color: '#a855f7' },
              ].map(({ type, color }) => (
                <motion.span
                  key={type}
                  whileHover={{ scale: 1.08, y: -1 }}
                  style={{
                    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                    color, background: `${color}14`,
                    border: `1px solid ${color}30`,
                    borderRadius: 4, padding: '4px 10px',
                  }}
                >
                  {type}
                </motion.span>
              ))}
            </div>

            <p style={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 10, letterSpacing: '0.16em',
              color: 'rgba(250,247,240,0.25)', textTransform: 'uppercase',
            }}>
              Max 50 MB, text extracted in your browser
            </p>
            <p style={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 9, letterSpacing: '0.12em',
              color: 'rgba(250,247,240,0.18)', marginTop: 6,
            }}>
              Scanned or image PDFs are supported via OCR — may take longer
            </p>

            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_EXTENSIONS.join(',')}
              style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }}
            />
          </motion.div>
        )}

        {/* EXTRACTING */}
        {status === 'extracting' && (
          <motion.div
            key="extracting"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            style={{
              border: '1px solid rgba(168,85,247,0.20)',
              borderRadius: 12, padding: '40px 32px',
              background: '#161b22', textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, justifyContent: 'center' }}>
              <FileTypeIcon type={fileType} size={40} />
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontWeight: 600, fontSize: 14, color: '#faf7f0',
                  maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {currentFile?.name}
                </div>
                <div style={{
                  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                  fontSize: 10, color: '#a855f7', letterSpacing: '0.12em', marginTop: 2,
                }}>
                  {statusMsg || `${labelText}...`}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{
              height: 3, background: 'rgba(168,85,247,0.12)',
              borderRadius: 2, overflow: 'hidden', marginBottom: 12,
            }}>
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 60, damping: 16 }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #9333ea, #a855f7, #d8b4fe)',
                  boxShadow: '0 0 8px rgba(168,85,247,0.60)',
                }}
              />
            </div>

            <div style={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 11, color: 'rgba(250,247,240,0.40)', letterSpacing: '0.12em',
            }}>
              {pageCount > 1
                ? `${pagesRead} / ${pageCount} ${fileType === 'PPTX' || fileType === 'PPT' ? 'slides' : fileType === 'XLSX' || fileType === 'XLS' ? 'sheets' : 'pages'}`
                : `${progress}%`}
            </div>
          </motion.div>
        )}

        {/* ERROR */}
        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            style={{
              border: '1px solid rgba(239,68,68,0.30)',
              borderRadius: 12, padding: '48px 32px',
              background: '#161b22', textAlign: 'center',
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
              style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(239,68,68,0.10)',
                border: '1px solid rgba(239,68,68,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', color: '#ef4444',
              }}
            >
              <IconX size={24} />
            </motion.div>

            <h3 style={{
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 700, fontSize: 18, color: '#faf7f0', marginBottom: 8,
            }}>
              Could not read file.
            </h3>
            <p style={{
              fontFamily: '"Lora", serif',
              fontSize: 13, color: 'rgba(250,247,240,0.55)', lineHeight: 1.6, marginBottom: 24,
            }}>
              {errorMsg}
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setStatus('idle'); setCurrentFile(null); setFileType(null); }}
              style={{
                all: 'unset', cursor: 'pointer',
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: '#a855f7', borderBottom: '1px solid rgba(168,85,247,0.40)',
                paddingBottom: 2,
              }}
            >
              Try again
            </motion.button>
          </motion.div>
        )}

        {/* DONE */}
        {status === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            style={{
              border: '1px solid rgba(168,85,247,0.30)',
              borderRadius: 12, padding: '40px 32px',
              background: 'rgba(168,85,247,0.04)', textAlign: 'center',
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(168,85,247,0.12)',
                border: '2px solid #a855f7',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', color: '#a855f7',
              }}
            >
              <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 6 }}>
              <FileTypeIcon type={fileType} size={28} />
              <h3 style={{
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 700, fontSize: 16, color: '#faf7f0',
              }}>
                {currentFile?.name}
              </h3>
            </div>

            <p style={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 10, color: '#a855f7', letterSpacing: '0.16em',
            }}>
              Ready
            </p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
