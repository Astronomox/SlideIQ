import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useUploads } from '../../hooks/useUploads';
import {
  Wordmark, IconUpload, IconDoc, IconHistory, IconLogout,
} from '../Icons/Icons';

function NavSectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
      fontSize: 9,
      letterSpacing: '0.24em',
      textTransform: 'uppercase',
      color: 'rgba(201,168,76,0.6)',
      padding: '0 12px',
      marginBottom: 8,
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
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        textDecoration: 'none',
        borderLeft: `2px solid ${isActive ? '#c9a84c' : 'transparent'}`,
        background: isActive ? 'rgba(201,168,76,0.08)' : 'transparent',
        transition: 'all 0.15s',
        cursor: 'pointer',
      })}
    >
      {({ isActive }) => (
        <>
          <span style={{
            color: isActive ? '#c9a84c' : 'rgba(240,236,226,0.38)',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}>
            {icon}
          </span>
          <span style={{
            flex: 1,
            fontFamily: '"Source Serif 4", Georgia, serif',
            fontSize: 14,
            color: isActive ? '#f0ece2' : 'rgba(240,236,226,0.55)',
          }}>
            {label}
          </span>
          {count !== undefined && (
            <span style={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 10,
              letterSpacing: '0.12em',
              color: 'rgba(240,236,226,0.38)',
            }}>
              {String(count).padStart(2, '0')}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { uploads } = useUploads();
  const navigate = useNavigate();

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

  const sidebar = (
    <aside style={{
      width: 280,
      minWidth: 280,
      height: '100vh',
      background: '#0e1428',
      borderRight: '1px solid rgba(201,168,76,0.12)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Wordmark top */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid rgba(201,168,76,0.10)',
        flexShrink: 0,
      }}>
        <Wordmark size={22} />
      </div>

      {/* LIBRARY nav section */}
      <div style={{
        padding: '16px 12px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        flexShrink: 0,
      }}>
        <NavSectionLabel>Library</NavSectionLabel>
        <SidebarNavItem
          to="/dashboard"
          icon={<IconUpload size={16} />}
          label="New upload"
        />
        <SidebarNavItem
          to="/dashboard"
          icon={<IconDoc size={16} />}
          label="My slides"
          count={uploads.length}
        />
        <SidebarNavItem
          to="/history"
          icon={<IconHistory size={16} />}
          label="Quiz history"
        />
      </div>

      {/* RECENT uploads section */}
      {uploads.length > 0 && (
        <div style={{
          padding: '16px 12px 8px',
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <NavSectionLabel>Recent</NavSectionLabel>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}>
            {uploads.slice(0, 6).map((u, i) => (
              <button
                key={u.id}
                onClick={() => navigate('/dashboard', { state: { uploadId: u.id } })}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  borderLeft: `2px solid ${i === 0 ? '#c9a84c' : 'transparent'}`,
                  background: i === 0 ? 'rgba(201,168,76,0.05)' : 'transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(201,168,76,0.05)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = i === 0 ? 'rgba(201,168,76,0.05)' : 'transparent';
                }}
              >
                <span style={{
                  fontFamily: '"Source Serif 4", Georgia, serif',
                  fontSize: 13,
                  color: '#f0ece2',
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 220,
                }}>
                  {u.filename}
                </span>
                <span style={{
                  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                  fontSize: 10,
                  color: 'rgba(240,236,226,0.4)',
                  letterSpacing: '0.08em',
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
        marginTop: 'auto',
        padding: '14px 16px',
        borderTop: '1px solid rgba(201,168,76,0.10)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
      }}>
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
        ) : (
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #c9a84c, #8e7426)',
            color: '#1a1305',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '"Playfair Display", Georgia, serif',
            fontWeight: 900,
            fontSize: 13,
            flexShrink: 0,
          }}>
            {initials}
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: '"Source Serif 4", Georgia, serif',
            fontSize: 13,
            color: '#f0ece2',
            lineHeight: 1.25,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {user?.displayName || 'User'}
          </div>
          <div style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 11,
            color: 'rgba(240,236,226,0.4)',
            lineHeight: 1.25,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {user?.email}
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Sign out"
          style={{
            all: 'unset',
            cursor: 'pointer',
            color: 'rgba(240,236,226,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 4,
            borderRadius: 4,
            transition: 'color 0.15s',
            flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#f0ece2'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,236,226,0.4)'}
        >
          <IconLogout size={16} />
        </button>
      </div>
    </aside>
  );

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#0a0f1e',
      display: 'flex',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Atmosphere */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        background: `
          radial-gradient(ellipse 60% 55% at 50% 30%, rgba(201,168,76,0.05) 0%, transparent 70%),
          radial-gradient(120% 90% at 50% 110%, rgba(0,0,0,0.3) 0%, transparent 60%)
        `,
      }} />

      {/* Sidebar */}
      <div style={{
        display: 'flex',
        height: '100%',
        position: 'relative',
        zIndex: 1,
        flexShrink: 0,
      }}>
        {sidebar}
      </div>

      {/* Main content */}
      <main style={{
        flex: 1,
        minWidth: 0,
        height: '100vh',
        overflowY: 'auto',
        background: '#0a0f1e',
        position: 'relative',
        zIndex: 1,
      }}>
        {children}
      </main>
    </div>
  );
}
