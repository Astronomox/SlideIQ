import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useUploads } from '../../hooks/useUploads';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Wordmark, IconUpload, IconDoc, IconHistory, IconLogout } from '../Icons/Icons';
import { getPDFLocally, downloadPDFFromBuffer } from '../../hooks/usePDFStore';

function NavSectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
      fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase',
      color: 'rgba(74,222,128,0.45)', padding: '0 12px', marginBottom: 8,
    }}>
      {children}
    </div>
  );
}

function SidebarNavItem({ to, icon, label, count }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px', textDecoration: 'none',
        borderLeft: `2px solid ${isActive ? '#4ade80' : 'transparent'}`,
        background: isActive ? 'rgba(74,222,128,0.08)' : 'transparent',
        transition: 'all 0.15s', cursor: 'pointer',
        borderRadius: '0 6px 6px 0',
      })}
    >
      {({ isActive }) => (
        <>
          <span style={{
            color: isActive ? '#4ade80' : 'rgba(250,247,240,0.30)',
            display: 'flex', alignItems: 'center', flexShrink: 0,
          }}>
            {icon}
          </span>
          <span style={{
            flex: 1,
            fontFamily: '"Lora", serif',
            fontSize: 14, color: isActive ? '#faf7f0' : 'rgba(250,247,240,0.50)',
          }}>
            {label}
          </span>
          {count !== undefined && (
            <span style={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 10, letterSpacing: '0.12em', color: 'rgba(250,247,240,0.28)',
            }}>
              {String(count).padStart(2, '0')}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

function HamburgerIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { uploads, clearUploads } = useUploads();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearingUploads, setClearingUploads] = useState(false);

  const showToast = (msg, type = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleClearUploads = async () => {
    setClearingUploads(true);
    try {
      await clearUploads();
      setShowClearModal(false);
    } catch (e) {
      showToast('Failed to clear recents. Please try again.');
    } finally {
      setClearingUploads(false);
    }
  };

  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.displayName
    ? user.displayName.split(' ').map(s => s[0]).slice(0, 2).join('')
    : '?';

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : ts instanceof Date ? ts : new Date(ts);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const UserAvatar = ({ size = 32 }) => (
    user?.photoURL ? (
      <img
        src={user.photoURL}
        alt={user.displayName || 'User'}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    ) : (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: 'linear-gradient(135deg, #4ade80, #22c55e)',
        color: '#0d1117',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Montserrat", sans-serif',
        fontWeight: 900, fontSize: size * 0.38, flexShrink: 0,
      }}>
        {initials}
      </div>
    )
  );

  const sidebarContent = (
    <aside style={{
      width: 280, minWidth: 280, height: '100%',
      background: '#0d1117',
      borderRight: '1px solid rgba(74,222,128,0.10)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Wordmark + optional close (mobile) */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid rgba(74,222,128,0.08)',
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        color: '#faf7f0',
      }}>
        <Wordmark size={22} />
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              all: 'unset', cursor: 'pointer',
              color: 'rgba(250,247,240,0.40)',
              display: 'flex', alignItems: 'center', padding: 4,
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#faf7f0'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(250,247,240,0.40)'}
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {/* LIBRARY nav section */}
      <div style={{
        padding: '16px 12px 8px',
        display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0,
      }}>
        <NavSectionLabel>Library</NavSectionLabel>
        <SidebarNavItem to="/dashboard" icon={<IconUpload size={16} />} label="New upload" />
        <SidebarNavItem to="/dashboard" icon={<IconDoc size={16} />} label="My slides" count={uploads.length} />
        <SidebarNavItem to="/history" icon={<IconHistory size={16} />} label="Quiz history" />
      </div>

      {/* RECENT uploads section */}
      {uploads.length > 0 && (
        <div style={{
          padding: '16px 12px 8px', flex: 1, minHeight: 0,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Header row with label + clear button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, padding: '0 0 0 0' }}>
            <NavSectionLabel>Recent</NavSectionLabel>
            <button
              onClick={() => setShowClearModal(true)}
              style={{
                all: 'unset', cursor: 'pointer',
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase',
                color: 'rgba(250,247,240,0.25)', paddingRight: 12,
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(250,247,240,0.25)'}
            >
              Clear
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
            {uploads.slice(0, 6).map((u, i) => (
              <div
                key={u.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  borderLeft: `2px solid ${i === 0 ? '#4ade80' : 'transparent'}`,
                  background: i === 0 ? 'rgba(74,222,128,0.06)' : 'transparent',
                  borderRadius: '0 4px 4px 0',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(74,222,128,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = i === 0 ? 'rgba(74,222,128,0.06)' : 'transparent'}
              >
                {/* Filename — click to go to dashboard */}
                <button
                  onClick={() => { navigate('/dashboard', { state: { uploadId: u.id } }); setSidebarOpen(false); }}
                  style={{
                    all: 'unset', cursor: 'pointer', flex: 1,
                    padding: '8px 4px 8px 12px',
                    display: 'flex', flexDirection: 'column', gap: 3,
                  }}
                >
                  <span style={{
                    fontFamily: '"Lora", serif',
                    fontSize: 13, color: '#faf7f0', lineHeight: 1.3,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180,
                  }}>
                    {u.filename}
                  </span>
                  <span style={{
                    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                    fontSize: 10, color: 'rgba(250,247,240,0.35)', letterSpacing: '0.08em',
                  }}>
                    {formatDate(u.createdAt)}
                  </span>
                </button>

                {/* Download PDF button */}
                <button
                  title="Download PDF"
                  onClick={async () => {
                    const stored = await getPDFLocally(u.id);
                    if (stored) {
                      downloadPDFFromBuffer(stored.data, stored.filename);
                    } else {
                      showToast('PDF not available — only PDFs uploaded on this device can be re-downloaded.');
                    }
                  }}
                  style={{
                    all: 'unset', cursor: 'pointer',
                    padding: '8px 10px',
                    color: 'rgba(250,247,240,0.25)',
                    display: 'flex', alignItems: 'center',
                    transition: 'color 0.15s', flexShrink: 0,
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#4ade80'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(250,247,240,0.25)'}
                >
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 16V4M7 20h10M4 20h16M7 12l5 5 5-5" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BOTTOM USER */}
      <div style={{
        marginTop: 'auto', padding: '14px 16px',
        borderTop: '1px solid rgba(74,222,128,0.08)',
        display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
      }}>
        <UserAvatar size={32} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: '"Lora", serif',
            fontSize: 13, color: '#faf7f0', lineHeight: 1.25,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {user?.displayName || 'User'}
          </div>
          <div style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 11, color: 'rgba(250,247,240,0.35)', lineHeight: 1.25,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {user?.email}
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Sign out"
          style={{
            all: 'unset', cursor: 'pointer',
            color: 'rgba(250,247,240,0.30)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 4, borderRadius: 4, transition: 'color 0.15s', flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#faf7f0'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(250,247,240,0.30)'}
        >
          <IconLogout size={16} />
        </button>
      </div>
    </aside>
  );

  const MOBILE_TOP = 56;

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: '#0d1117',
      display: 'flex', overflow: 'hidden', position: 'relative',
    }}>
      {/* In-app toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            style={{
              position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
              zIndex: 9999, display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 18px',
              background: toast.type === 'confirm' ? '#1c2128' : '#1c1015',
              border: `1px solid ${toast.type === 'confirm' ? 'rgba(74,222,128,0.30)' : 'rgba(239,68,68,0.40)'}`,
              borderRadius: 10,
              boxShadow: '0 8px 32px rgba(0,0,0,0.60)',
              maxWidth: 380, width: 'calc(100vw - 48px)',
            }}
          >
            <span style={{
              fontFamily: '"Lora", serif', fontSize: 13,
              color: toast.type === 'confirm' ? 'rgba(250,247,240,0.80)' : '#fca5a5',
              flex: 1, lineHeight: 1.5,
            }}>
              {toast.msg}
            </span>
            {toast.type === 'confirm' ? (
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => { clearUploads(); setToast(null); }}
                  style={{
                    all: 'unset', cursor: 'pointer', padding: '5px 12px',
                    background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.40)',
                    borderRadius: 5, color: '#ef4444',
                    fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10,
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                  }}
                >
                  Clear
                </button>
                <button
                  onClick={() => setToast(null)}
                  style={{
                    all: 'unset', cursor: 'pointer', padding: '5px 12px',
                    background: 'rgba(250,247,240,0.06)', border: '1px solid rgba(250,247,240,0.12)',
                    borderRadius: 5, color: 'rgba(250,247,240,0.50)',
                    fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10,
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setToast(null)}
                style={{ all: 'unset', cursor: 'pointer', color: 'rgba(250,247,240,0.35)', padding: 4 }}
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Atmosphere */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `
          radial-gradient(ellipse 60% 55% at 50% 30%, rgba(74,222,128,0.04) 0%, transparent 70%),
          radial-gradient(120% 90% at 50% 110%, rgba(74,222,128,0.02) 0%, transparent 60%)
        `,
      }} />

      {/* MOBILE: fixed top bar */}
      {isMobile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          height: MOBILE_TOP,
          background: '#0d1117',
          borderBottom: '1px solid rgba(74,222,128,0.10)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px',
          zIndex: 200, flexShrink: 0,
          color: '#faf7f0',
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              all: 'unset', cursor: 'pointer',
              color: 'rgba(250,247,240,0.50)',
              display: 'flex', alignItems: 'center', padding: '6px 4px',
            }}
          >
            <HamburgerIcon />
          </button>
          <Wordmark size={18} />
          <UserAvatar size={30} />
        </div>
      )}

      {/* MOBILE: sidebar overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(13,17,23,0.85)',
                zIndex: 250,
                backdropFilter: 'blur(4px)',
              }}
            />
            <motion.div
              key="sidebar"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'fixed', top: 0, left: 0, bottom: 0,
                width: 280, zIndex: 300, height: '100vh',
              }}
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP: static sidebar */}
      {!isMobile && (
        <div style={{ display: 'flex', height: '100%', position: 'relative', zIndex: 1, flexShrink: 0 }}>
          {sidebarContent}
        </div>
      )}

      {/* Main content */}
      <main style={{
        flex: 1, minWidth: 0,
        height: isMobile ? `calc(100vh - ${MOBILE_TOP}px)` : '100vh',
        marginTop: isMobile ? MOBILE_TOP : 0,
        overflowY: 'auto',
        background: '#0d1117',
        position: 'relative', zIndex: 1,
      }}>
        {children}
      </main>

      {/* Clear recents confirmation modal */}
      <AnimatePresence>
        {showClearModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !clearingUploads && setShowClearModal(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 500,
              background: 'rgba(13,17,23,0.88)',
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
                background: '#161b22',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 12,
                padding: '32px 28px',
                maxWidth: 380, width: '100%',
                boxShadow: '0 24px 60px rgba(0,0,0,0.60)',
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'rgba(239,68,68,0.10)',
                border: '1px solid rgba(239,68,68,0.30)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20, color: '#ef4444',
              }}>
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4h6v2"/>
                </svg>
              </div>

              <div style={{
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
                color: '#ef4444', marginBottom: 8,
              }}>
                Clear recents
              </div>

              <h3 style={{
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 700, fontSize: 20, color: '#faf7f0',
                letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 12,
              }}>
                Remove all recent uploads?
              </h3>

              <p style={{
                fontFamily: '"Lora", serif',
                fontSize: 14, color: 'rgba(250,247,240,0.60)', lineHeight: 1.65,
                marginBottom: 28,
              }}>
                This removes the recent uploads list. Your quiz history is never affected and will always be preserved.
              </p>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={handleClearUploads}
                  disabled={clearingUploads}
                  style={{
                    all: 'unset', cursor: clearingUploads ? 'wait' : 'pointer',
                    flex: 1, padding: '12px 18px', textAlign: 'center',
                    background: 'rgba(239,68,68,0.12)',
                    border: '1px solid rgba(239,68,68,0.40)',
                    borderRadius: 8, color: '#ef4444',
                    fontFamily: '"Montserrat", sans-serif',
                    fontWeight: 700, fontSize: 14,
                    opacity: clearingUploads ? 0.6 : 1,
                    transition: 'opacity 0.15s',
                  }}
                >
                  {clearingUploads ? 'Clearing...' : 'Yes, clear'}
                </button>
                <button
                  onClick={() => setShowClearModal(false)}
                  disabled={clearingUploads}
                  style={{
                    all: 'unset', cursor: 'pointer',
                    flex: 1, padding: '12px 18px', textAlign: 'center',
                    background: 'rgba(250,247,240,0.05)',
                    border: '1px solid rgba(250,247,240,0.12)',
                    borderRadius: 8, color: 'rgba(250,247,240,0.65)',
                    fontFamily: '"Montserrat", sans-serif',
                    fontWeight: 600, fontSize: 14,
                  }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
