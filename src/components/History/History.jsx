import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizHistory } from '../../hooks/useQuizHistory';
import { PersonaGlyph, IconClock, IconX, IconDoc } from '../Icons/Icons';
import { PERSONALITIES } from '../PersonalitySelector/PersonalitySelector';
import { useIsMobile } from '../../hooks/useIsMobile';

function formatDate(ts) {
  if (!ts) return 'Unknown date';
  const d = ts.toDate ? ts.toDate() : ts instanceof Date ? ts : new Date(ts);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function gradeColor(pct) {
  if (pct === null || pct === undefined) return 'rgba(33,26,46,0.56)';
  if (pct >= 70) return '#7c3aed';
  if (pct >= 50) return '#ca8a04';
  return '#dc2626';
}

// ─── Download as PDF using jsPDF + html2canvas ───────────────────────────────
async function downloadAsPDF(entry, persona) {
  const { jsPDF } = await import('jspdf');
  const { default: html2canvas } = await import('html2canvas');

  const pct = entry.scorePct ?? (entry.totalMCQ > 0
    ? Math.round((entry.mcqScore / entry.totalMCQ) * 100) : null);

  const esc = t => String(t || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:794px;padding:48px;background:#f7f5fb;color:#211a2e;font-family:Arial,sans-serif;font-size:13px;line-height:1.6;box-sizing:border-box;';

  let html = `
    <div style="margin-bottom:24px">
      <div style="color:#7c3aed;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:6px">A SlideIQ Quiz</div>
      <h1 style="margin:0 0 2px;font-size:22px;color:#211a2e">A SlideIQ Quiz</h1><div style="font-size:14px;color:#7c3aed;margin-bottom:4px">${esc(entry.filename)}</div>
      <div style="height:1px;background:rgba(124, 58, 237,0.3);margin:12px 0"></div>
      <div style="font-size:12px;color:#6b6480;margin-bottom:4px">Lecturer: <span style="color:#211a2e">${esc(persona.title)}</span></div>
      <div style="font-size:12px;color:#6b6480;margin-bottom:4px">Date: <span style="color:#211a2e">${esc(formatDate(entry.completedAt))}</span></div>
      ${pct !== null ? `<div style="font-size:14px;font-weight:bold;color:#7c3aed;margin-top:6px">Score: ${pct}% &nbsp;(${entry.mcqScore}/${entry.totalMCQ} MCQ correct)</div>` : ''}
    </div>
  `;

  if (entry.mcqQuestions?.length > 0) {
    html += `<div style="color:#7c3aed;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:14px">Multiple Choice Questions</div>`;
    entry.mcqQuestions.forEach((q, i) => {
      const ans = entry.mcqAnswers?.[i];
      const correct = ans?.correct || q.answer;
      html += `<div style="margin-bottom:20px;padding:14px 16px;background:#ffffff;border-radius:6px;border:1px solid rgba(124, 58, 237,0.15)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-size:10px;color:rgba(33,26,46,0.52)">Q${i + 1}</span>
          ${ans ? `<span style="font-size:10px;padding:2px 8px;border-radius:3px;background:${ans.isCorrect ? 'rgba(124, 58, 237,0.12)' : 'rgba(220,38,38,0.12)'};color:${ans.isCorrect ? '#7c3aed' : '#dc2626'}">${ans.isCorrect ? '✓ Correct' : '✗ Wrong'}</span>` : ''}
        </div>
        <div style="font-size:13px;color:#211a2e;margin-bottom:12px;font-weight:600">${esc(q.question || q.text)}</div>`;
      if (q.options) {
        Object.entries(q.options).forEach(([letter, text]) => {
          const isThis = letter === correct;
          const isWrong = ans && letter === ans.selected && !isThis;
          const bg = isThis ? 'rgba(124, 58, 237,0.10)' : isWrong ? 'rgba(220,38,38,0.10)' : 'transparent';
          const border = isThis ? 'rgba(124, 58, 237,0.40)' : isWrong ? 'rgba(220,38,38,0.40)' : 'rgba(255,255,255,0.08)';
          const tc = isThis ? '#211a2e' : isWrong ? '#fca5a5' : 'rgba(33,26,46,0.60)';
          const lc = isThis ? '#7c3aed' : isWrong ? '#dc2626' : 'rgba(33,26,46,0.45)';
          html += `<div style="display:flex;align-items:flex-start;gap:10px;padding:7px 10px;border-radius:5px;background:${bg};border:1px solid ${border};margin-bottom:5px">
            <span style="color:${lc};font-size:11px;font-weight:600;min-width:16px">${esc(letter)}</span>
            <span style="color:${tc};font-size:12px">${esc(text)}${isThis ? ' &nbsp;✓' : isWrong ? ' &nbsp;✗' : ''}</span>
          </div>`;
        });
      }
      html += `</div>`;
    });
  }

  if (entry.theoryQuestions?.length > 0) {
    html += `<div style="color:#7c3aed;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;margin:20px 0 14px">Theory Questions</div>`;
    entry.theoryQuestions.forEach((q, i) => {
      const ans = entry.theoryAnswers?.[i];
      html += `<div style="margin-bottom:20px;background:#ffffff;border-radius:6px;border:1px solid rgba(124, 58, 237,0.12);overflow:hidden">
        <div style="padding:12px 16px;border-bottom:1px solid rgba(124, 58, 237,0.10)">
          <div style="font-size:10px;color:rgba(33,26,46,0.48);margin-bottom:6px">Q${i + 1}</div>
          <div style="font-size:13px;color:#211a2e">${esc(q.question)}</div>
        </div>
        ${ans ? `<div style="padding:12px 16px;border-bottom:1px solid rgba(124, 58, 237,0.08)">
          <div style="font-size:9px;color:rgba(33,26,46,0.45);text-transform:uppercase;letter-spacing:0.16em;margin-bottom:5px">Your answer</div>
          <div style="font-size:12px;color:rgba(33,26,46,0.72)">${esc(ans.answer || '(no answer recorded)')}</div>
        </div>` : ''}
        <div style="padding:12px 16px;background:rgba(124, 58, 237,0.04)">
          <div style="font-size:9px;color:#7c3aed;text-transform:uppercase;letter-spacing:0.16em;margin-bottom:5px">Model answer</div>
          <div style="font-size:12px;color:rgba(33,26,46,0.80)">${esc(q.modelAnswer || '—')}</div>
        </div>
      </div>`;
    });
  }

  container.innerHTML = html;
  document.body.appendChild(container);

  const canvas = await html2canvas(container, { backgroundColor: '#f7f5fb', scale: 2, useCORS: true, logging: false });
  document.body.removeChild(container);

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ unit: 'px', format: 'a4', orientation: 'portrait' });
  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = pdf.internal.pageSize.getHeight();
  const ratio = pdfW / (canvas.width / 2);
  const totalH = (canvas.height / 2) * ratio;
  let yOffset = 0;
  while (yOffset < totalH) {
    if (yOffset > 0) pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, -yOffset, pdfW, totalH);
    yOffset += pdfH;
  }

  pdf.save(`slideiq-${(entry.filename || 'quiz').replace(/\.pdf$/i, '')}.pdf`);
}

// ─── Download as DOCX using docx ─────────────────────────────────────────────
async function downloadAsDOCX(entry, persona) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } =
    await import('docx');

  const pct = entry.scorePct ?? (entry.totalMCQ > 0
    ? Math.round((entry.mcqScore / entry.totalMCQ) * 100) : null);

  const children = [];

  const h = (text, level = HeadingLevel.HEADING_1) =>
    new Paragraph({ heading: level, children: [new TextRun({ text: String(text || ''), bold: true })] });

  const p = (runs) => new Paragraph({ children: Array.isArray(runs) ? runs : [new TextRun(runs)] });

  const run = (text, opts = {}) => new TextRun({ text: String(text || ''), ...opts });

  children.push(h(`A SlideIQ Quiz: ${entry.filename || 'Quiz'}`, HeadingLevel.HEADING_1));
  children.push(h(entry.filename || 'Quiz', HeadingLevel.HEADING_2));
  children.push(p([run('Lecturer: ', { bold: true }), run(persona.title)]));
  children.push(p([run('Date: ', { bold: true }), run(formatDate(entry.completedAt))]));
  if (pct !== null) {
    children.push(p([run('Score: ', { bold: true }), run(`${pct}%  (${entry.mcqScore}/${entry.totalMCQ} MCQ correct)`)]));
  }
  children.push(p(''));

  if (entry.mcqQuestions?.length > 0) {
    children.push(h('Multiple Choice Questions', HeadingLevel.HEADING_2));
    entry.mcqQuestions.forEach((q, i) => {
      const ans = entry.mcqAnswers?.[i];
      const correct = ans?.correct || q.answer;
      children.push(p([run(`Q${i + 1}.  `, { bold: true }), run(q.question || q.text || '')]));
      if (q.options) {
        Object.entries(q.options).forEach(([letter, text]) => {
          const isThis = letter === correct;
          const isWrong = letter === ans?.selected && !isThis;
          children.push(new Paragraph({
            indent: { left: 360 },
            children: [run(`${letter}.  ${text}${isThis ? '  ✓ CORRECT' : isWrong ? '  ✗ YOUR ANSWER' : ''}`, {
              color: isThis ? '22c55e' : isWrong ? 'ef4444' : '666666',
            })],
          }));
        });
      }
      const verdict = ans?.isCorrect ? '✓ Correct' : ans ? `✗ Wrong. Correct answer: ${correct}` : '';
      if (verdict) {
        children.push(new Paragraph({
          indent: { left: 360 },
          children: [run(verdict, { bold: true, color: ans?.isCorrect ? '22c55e' : 'ef4444' })],
        }));
      }
      children.push(p(''));
    });
  }

  if (entry.theoryQuestions?.length > 0) {
    children.push(h('Theory Questions', HeadingLevel.HEADING_2));
    entry.theoryQuestions.forEach((q, i) => {
      const ans = entry.theoryAnswers?.[i];
      children.push(p([run(`Q${i + 1}.  `, { bold: true }), run(q.question || '')]));
      children.push(new Paragraph({ indent: { left: 360 }, children: [run('Your answer:', { bold: true, color: '888888' })] }));
      children.push(new Paragraph({ indent: { left: 360 }, children: [run(ans?.answer || '(no answer recorded)')] }));
      children.push(new Paragraph({ indent: { left: 360 }, children: [run('Model answer:', { bold: true, color: '22c55e' })] }));
      children.push(new Paragraph({ indent: { left: 360 }, children: [run(q.modelAnswer || '—')] }));
      children.push(p(''));
    });
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
      },
      children,
    }],
  });

  const buffer = await Packer.toBlob(doc);
  const url = URL.createObjectURL(buffer);
  const a = document.createElement('a');
  a.href = url;
  a.download = `slideiq-${(entry.filename || 'quiz').replace(/\.pdf$/i, '')}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Download Format Modal ────────────────────────────────────────────────────
function DownloadModal({ entry, persona, onClose }) {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');

  const handle = async (type) => {
    setLoading(type);
    setError('');
    try {
      if (type === 'pdf') await downloadAsPDF(entry, persona);
      else await downloadAsDOCX(entry, persona);
      onClose();
    } catch (e) {
      console.error(e);
      setError('Download failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(247,245,251,0.85)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#ffffff',
          border: '1px solid rgba(124, 58, 237,0.20)',
          borderRadius: 12,
          padding: '32px 28px',
          maxWidth: 400, width: '100%',
          boxShadow: '0 24px 60px rgba(33,26,46,0.32)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <div style={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
              color: '#7c3aed', marginBottom: 6,
            }}>
              Export Quiz
            </div>
            <h3 style={{
              fontFamily: '"Instrument Sans", sans-serif',
              fontWeight: 700, fontSize: 18, color: '#211a2e',
              letterSpacing: '-0.02em', lineHeight: 1.2,
            }}>
              Choose format
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ all: 'unset', cursor: 'pointer', color: 'rgba(33,26,46,0.48)', padding: 4 }}
          >
            <IconX size={18} />
          </button>
        </div>

        <p style={{
          fontFamily: '"Newsreader", serif',
          fontSize: 13, color: 'rgba(33,26,46,0.64)', lineHeight: 1.6,
          marginBottom: 24,
        }}>
          Download your quiz results as a formatted document.
        </p>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* PDF */}
          <motion.button
            whileHover={{ borderColor: 'rgba(124, 58, 237,0.50)', background: 'rgba(124, 58, 237,0.06)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handle('pdf')}
            disabled={!!loading}
            style={{
              all: 'unset', cursor: loading ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '16px 18px',
              background: 'rgba(124, 58, 237,0.03)',
              border: '1px solid rgba(124, 58, 237,0.20)',
              borderRadius: 8,
              transition: 'background 0.15s, border-color 0.15s',
              opacity: loading && loading !== 'pdf' ? 0.4 : 1,
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 8, flexShrink: 0,
              background: 'rgba(220,38,38,0.12)',
              border: '1px solid rgba(220,38,38,0.30)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth={1.8} strokeLinecap="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <path d="M14 2v6h6M9 13h6M9 17h3"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: '"Instrument Sans", sans-serif', fontWeight: 700, fontSize: 14, color: '#211a2e' }}>
                {loading === 'pdf' ? 'Generating PDF...' : 'PDF Document'}
              </div>
              <div style={{ fontFamily: '"Newsreader", serif', fontSize: 12, color: 'rgba(33,26,46,0.56)', marginTop: 2 }}>
                Formatted, printable, dark styled
              </div>
            </div>
          </motion.button>

          {/* DOCX */}
          <motion.button
            whileHover={{ borderColor: 'rgba(124, 58, 237,0.50)', background: 'rgba(124, 58, 237,0.06)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handle('docx')}
            disabled={!!loading}
            style={{
              all: 'unset', cursor: loading ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '16px 18px',
              background: 'rgba(124, 58, 237,0.03)',
              border: '1px solid rgba(124, 58, 237,0.20)',
              borderRadius: 8,
              transition: 'background 0.15s, border-color 0.15s',
              opacity: loading && loading !== 'docx' ? 0.4 : 1,
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 8, flexShrink: 0,
              background: 'rgba(59,130,246,0.12)',
              border: '1px solid rgba(59,130,246,0.30)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth={1.8} strokeLinecap="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <path d="M14 2v6h6M8 13h8M8 17h5"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: '"Instrument Sans", sans-serif', fontWeight: 700, fontSize: 14, color: '#211a2e' }}>
                {loading === 'docx' ? 'Generating DOCX...' : 'Word Document'}
              </div>
              <div style={{ fontFamily: '"Newsreader", serif', fontSize: 12, color: 'rgba(33,26,46,0.56)', marginTop: 2 }}>
                Editable, opens in Microsoft Word
              </div>
            </div>
          </motion.button>
        </div>

        {error && (
          <div style={{
            marginTop: 16, padding: '10px 14px',
            background: 'rgba(220,38,38,0.10)',
            border: '1px solid rgba(220,38,38,0.30)',
            borderRadius: 6,
            fontFamily: '"Newsreader", serif',
            fontSize: 13, color: '#ef4444',
          }}>
            {error}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function MCQReviewCard({ q, ans, index }) {
  const correct = ans?.correct || q.answer;
  const selected = ans?.selected;
  const isCorrect = ans?.isCorrect;
  const hasResult = ans !== undefined && ans !== null;

  const optionEntries = q.options
    ? Object.entries(q.options)
    : q.choices
      ? Object.entries(q.choices)
      : null;

  return (
    <div style={{
      padding: '16px',
      background: '#f1edf9',
      border: `1px solid ${!hasResult ? 'rgba(124, 58, 237,0.12)' : isCorrect ? 'rgba(124, 58, 237,0.25)' : 'rgba(220,38,38,0.25)'}`,
      borderRadius: 8,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, letterSpacing: '0.14em', color: 'rgba(33,26,46,0.48)' }}>
          Q{index + 1}
        </span>
        {hasResult && (
          <span style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: isCorrect ? '#7c3aed' : '#dc2626',
            background: isCorrect ? 'rgba(124, 58, 237,0.10)' : 'rgba(220,38,38,0.10)',
            padding: '3px 8px', borderRadius: 3,
          }}>
            {isCorrect ? '✓ Correct' : '✗ Wrong'}
          </span>
        )}
      </div>

      <p style={{ fontFamily: '"Newsreader", serif', fontSize: 14, color: '#211a2e', lineHeight: 1.6, margin: '0 0 12px 0' }}>
        {q.question || q.text || '(question text unavailable)'}
      </p>

      {optionEntries ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {optionEntries.map(([letter, text]) => {
            const isThisCorrect = letter === correct;
            const isThisWrong = hasResult && letter === selected && !isThisCorrect;
            let bg = 'transparent';
            let borderColor = 'rgba(33,26,46,0.08)';
            let textColor = 'rgba(33,26,46,0.60)';
            let letterColor = 'rgba(33,26,46,0.45)';
            if (isThisCorrect) { bg = 'rgba(124, 58, 237,0.08)'; borderColor = 'rgba(124, 58, 237,0.40)'; textColor = '#211a2e'; letterColor = '#7c3aed'; }
            if (isThisWrong) { bg = 'rgba(220,38,38,0.08)'; borderColor = 'rgba(220,38,38,0.40)'; textColor = '#fca5a5'; letterColor = '#dc2626'; }
            return (
              <div key={letter} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '8px 12px', borderRadius: 6, background: bg,
                border: `1px solid ${borderColor}`, transition: 'none',
              }}>
                <span style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 11, fontWeight: 600, color: letterColor, flexShrink: 0, minWidth: 18, lineHeight: 1.55 }}>
                  {letter}
                </span>
                <span style={{ fontFamily: '"Newsreader", serif', fontSize: 13, color: textColor, lineHeight: 1.5, flex: 1 }}>
                  {text}
                </span>
                {isThisCorrect && <span style={{ color: '#7c3aed', fontSize: 14, flexShrink: 0 }}>✓</span>}
                {isThisWrong && <span style={{ color: '#dc2626', fontSize: 14, flexShrink: 0 }}>✗</span>}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: '8px 10px', background: 'rgba(124, 58, 237,0.08)', border: '1px solid rgba(124, 58, 237,0.35)', borderRadius: 5, fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 11, color: '#7c3aed' }}>
          Correct answer: {correct || q.answer || '—'}
          {hasResult && selected && selected !== correct && (
            <span style={{ color: '#dc2626', marginLeft: 16 }}>Your answer: {selected}</span>
          )}
        </div>
      )}
    </div>
  );
}

function HistoryCard({ entry, onClick }) {
  const persona = PERSONALITIES.find(p => p.id === entry.personalityId) || PERSONALITIES[7];
  const pct = entry.scorePct ?? (entry.totalMCQ > 0 ? Math.round((entry.mcqScore / entry.totalMCQ) * 100) : null);
  const color = gradeColor(pct);

  return (
    <motion.button
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(124, 58, 237,0.10)' }}
      onClick={onClick}
      style={{
        all: 'unset', cursor: 'pointer',
        width: '100%', display: 'flex', alignItems: 'center',
        gap: 16, padding: '16px 20px',
        background: '#ffffff', border: '1px solid rgba(124, 58, 237,0.10)',
        borderRadius: 8, marginBottom: 8, transition: 'border-color 0.15s',
        boxSizing: 'border-box', boxShadow: '0 1px 4px rgba(41,28,66,0.10)',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(124, 58, 237,0.35)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(124, 58, 237,0.10)'}
    >
      <span style={{ color: persona.accent, flexShrink: 0 }}>
        <PersonaGlyph id={persona.id} size={32} />
      </span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontFamily: '"Instrument Sans", sans-serif', fontWeight: 600, fontSize: 14, color: '#211a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {entry.filename}
        </span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, letterSpacing: '0.12em', color: 'rgba(33,26,46,0.52)' }}>
            {persona.title}
          </span>
          <span style={{ width: 1, height: 10, background: 'rgba(124, 58, 237,0.18)' }} />
          <span style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, letterSpacing: '0.1em', color: 'rgba(33,26,46,0.48)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconClock size={11} /> {formatDate(entry.completedAt)}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
        {pct !== null ? (
          <>
            <span style={{ fontFamily: '"Instrument Sans", sans-serif', fontWeight: 700, fontSize: 22, color, lineHeight: 1 }}>{pct}%</span>
            <span style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(33,26,46,0.45)' }}>
              {entry.mcqScore}/{entry.totalMCQ} MCQ
            </span>
          </>
        ) : (
          <span style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, letterSpacing: '0.12em', color: 'rgba(33,26,46,0.48)' }}>Theory only</span>
        )}
      </div>
    </motion.button>
  );
}

function HistoryDetail({ entry, onClose }) {
  const isMobile = useIsMobile();
  const persona = PERSONALITIES.find(p => p.id === entry.personalityId) || PERSONALITIES[7];
  const pct = entry.scorePct ?? (entry.totalMCQ > 0 ? Math.round((entry.mcqScore / entry.totalMCQ) * 100) : null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        style={{
          position: 'fixed', top: isMobile ? 56 : 0, right: 0, bottom: 0,
          width: isMobile ? '100%' : '100%',
          maxWidth: isMobile ? '100%' : 620,
          background: '#ffffff',
          borderLeft: isMobile ? 'none' : '1px solid rgba(124, 58, 237,0.12)',
          borderTop: isMobile ? '1px solid rgba(124, 58, 237,0.12)' : 'none',
          zIndex: 50,
          display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden',
          boxShadow: '-8px 0 40px rgba(33,26,46,0.26)',
        }}
      >
        {/* Sticky header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(124, 58, 237,0.10)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
          position: 'sticky', top: 0,
          background: '#ffffff', zIndex: 1, flexShrink: 0,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: 4 }}>
              Quiz Review
            </div>
            <h2 style={{ fontFamily: '"Instrument Sans", sans-serif', fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em', color: '#211a2e', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {entry.filename}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDownloadModal(true)}
              style={{
                all: 'unset', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 14px',
                background: 'rgba(124, 58, 237,0.08)',
                border: '1px solid rgba(124, 58, 237,0.28)',
                borderRadius: 6,
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: '#7c3aed',
              }}
            >
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 16V4M7 20h10M4 20h16M7 12l5 5 5-5" />
              </svg>
              Download
            </motion.button>
            <button
              onClick={onClose}
              style={{ all: 'unset', cursor: 'pointer', color: 'rgba(33,26,46,0.48)', padding: 6, transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#211a2e'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(33,26,46,0.48)'}
            >
              <IconX size={20} />
            </button>
          </div>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Meta */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <PersonaGlyph id={persona.id} size={22} />
              <span style={{ fontFamily: '"Newsreader", serif', fontStyle: 'italic', fontSize: 13, color: persona.accent }}>
                {persona.title}
              </span>
            </div>
            <span style={{ width: 1, height: 16, background: 'rgba(124, 58, 237,0.18)', flexShrink: 0 }} />
            <span style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 11, color: 'rgba(33,26,46,0.52)', letterSpacing: '0.10em', display: 'flex', alignItems: 'center', gap: 5 }}>
              <IconClock size={11} /> {formatDate(entry.completedAt)}
            </span>
            {pct !== null && (
              <>
                <span style={{ width: 1, height: 16, background: 'rgba(124, 58, 237,0.18)', flexShrink: 0 }} />
                <span style={{ fontFamily: '"Instrument Sans", sans-serif', fontWeight: 700, fontSize: 18, color: gradeColor(pct) }}>
                  {pct}%
                </span>
                <span style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, color: 'rgba(33,26,46,0.48)' }}>
                  {entry.mcqScore}/{entry.totalMCQ} MCQ
                </span>
              </>
            )}
          </div>

          <div style={{ height: 1, background: 'rgba(124, 58, 237,0.10)' }} />

          {/* MCQ review */}
          {entry.mcqQuestions?.length > 0 && (
            <div>
              <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: 12 }}>
                Multiple Choice · {entry.mcqQuestions.length} Questions
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {entry.mcqQuestions.map((q, i) => (
                  <MCQReviewCard key={i} q={q} ans={entry.mcqAnswers?.[i]} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Theory review */}
          {entry.theoryQuestions?.length > 0 && (
            <div>
              <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: 12 }}>
                Theory · {entry.theoryQuestions.length} Questions
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {entry.theoryQuestions.map((q, i) => {
                  const ans = entry.theoryAnswers?.[i];
                  return (
                    <div key={i} style={{ background: '#f1edf9', border: '1px solid rgba(124, 58, 237,0.12)', borderRadius: 8, overflow: 'hidden' }}>
                      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(124, 58, 237,0.10)' }}>
                        <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, letterSpacing: '0.14em', color: 'rgba(33,26,46,0.48)', marginBottom: 8 }}>Q{i + 1}</div>
                        <p style={{ fontFamily: '"Newsreader", serif', fontSize: 14, color: '#211a2e', lineHeight: 1.55, margin: 0 }}>{q.question}</p>
                      </div>
                      {ans && (
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(124, 58, 237,0.08)' }}>
                          <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(33,26,46,0.45)', marginBottom: 6 }}>Your answer</div>
                          <p style={{ fontFamily: '"Newsreader", serif', fontSize: 13, color: 'rgba(33,26,46,0.72)', lineHeight: 1.6, margin: 0 }}>{ans.answer || '(no answer recorded)'}</p>
                        </div>
                      )}
                      <div style={{ padding: '12px 16px', background: 'rgba(124, 58, 237,0.04)' }}>
                        <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: 6 }}>Model answer</div>
                        <p style={{ fontFamily: '"Newsreader", serif', fontSize: 13, color: 'rgba(33,26,46,0.80)', lineHeight: 1.6, margin: 0 }}>{q.modelAnswer || '—'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ height: 16 }} />
        </div>
      </motion.div>

      <AnimatePresence>
        {showDownloadModal && (
          <DownloadModal
            entry={entry}
            persona={persona}
            onClose={() => setShowDownloadModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default function History() {
  const { history, loadingHistory } = useQuizHistory();
  const [selected, setSelected] = useState(null);

  if (loadingHistory) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 12, letterSpacing: '0.18em', color: 'rgba(33,26,46,0.48)' }}>
        Loading history...
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '80px 32px', textAlign: 'center' }}
      >
        <div style={{ color: 'rgba(33,26,46,0.22)' }}><IconDoc size={48} stroke={1} /></div>
        <h2 style={{ fontFamily: '"Instrument Serif", serif', fontWeight: 400, fontSize: 32, color: '#211a2e', lineHeight: 1.1 }}>No quizzes yet.</h2>
        <p style={{ fontFamily: '"Newsreader", serif', fontSize: 15, color: 'rgba(33,26,46,0.60)', maxWidth: 360, lineHeight: 1.55 }}>
          Complete your first quiz and your results will appear here for review.
        </p>
      </motion.div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {history.map((entry, i) => (
          <motion.div key={entry.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
            <HistoryCard entry={entry} onClick={() => setSelected(entry)} />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(247,245,251,0.80)', backdropFilter: 'blur(4px)' }}
            />
            <HistoryDetail entry={selected} onClose={() => setSelected(null)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
