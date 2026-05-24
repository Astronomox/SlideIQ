import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useUploads } from '../../hooks/useUploads';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Wordmark, IconUpload, IconDoc, IconHistory, IconLogout } from '../Icons/Icons';

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
  const { uploads } = useUploads();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          <NavSectionLabel>Recent</NavSectionLabel>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
            {uploads.slice(0, 6).map((u, i) => (
              <button
                key={u.id}
                onClick={() => { navigate('/dashboard', { state: { uploadId: u.id } }); setSidebarOpen(false); }}
                style={{
                  all: 'unset', cursor: 'pointer',
                  padding: '8px 12px',
                  display: 'flex', flexDirection: 'column', gap: 3,
                  borderLeft: `2px solid ${i === 0 ? '#4ade80' : 'transparent'}`,
                  background: i === 0 ? 'rgba(74,222,128,0.06)' : 'transparent',
                  transition: 'background 0.15s', borderRadius: '0 4px 4px 0',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(74,222,128,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = i === 0 ? 'rgba(74,222,128,0.06)' : 'transparent'}
              >
                <span style={{
                  fontFamily: '"Lora", serif',
                  fontSize: 13, color: '#faf7f0', lineHeight: 1.3,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220,
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
    </div>
  );
}
