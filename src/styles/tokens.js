/**
 * Design tokens for SlideIQ
 * Centralized color, spacing, typography, and other design values
 * Replaces scattered inline styles for better maintainability
 */

export const colors = {
  // Primary
  primary: '#a855f7', // Purple
  primaryLight: 'rgba(168, 85, 247, 0.10)',
  primaryDark: '#7c3aed',

  // Background
  bg: {
    primary: '#0f1419',
    secondary: '#1a1f2e',
    tertiary: '#161b22',
    hover: 'rgba(168, 85, 247, 0.05)',
  },

  // Text
  text: {
    primary: '#faf7f0',
    secondary: 'rgba(250,247,240,0.65)',
    tertiary: 'rgba(250,247,240,0.50)',
    muted: 'rgba(250,247,240,0.25)',
    hint: '#b0b8c1',
  },

  // Border
  border: {
    primary: '1px solid rgba(168, 85, 247, 0.12)',
    secondary: '1px solid rgba(168, 85, 247, 0.20)',
    light: '1px solid rgba(168, 85, 247, 0.05)',
  },

  // Status
  status: {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  },

  // Special
  accent: '#0084ff',
  disabled: '#2a2f3e',
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '28px',
  '4xl': '32px',
  '6xl': '48px',
  '8xl': '56px',
};

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '10px',
  xl: '12px',
  full: '50%',
};

export const typography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    serif: '"Lora", serif',
    mono: '"JetBrains Mono", ui-monospace, monospace',
    montserrat: '"Montserrat", sans-serif',
  },

  fontSize: {
    xs: '11px',
    sm: '12px',
    base: '13px',
    md: '14px',
    lg: '16px',
    xl: '18px',
    '2xl': '20px',
    '3xl': '24px',
    '4xl': '32px',
    '5xl': '40px',
    '6xl': '56px',
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  lineHeight: {
    tight: 1.0,
    snug: 1.4,
    normal: 1.5,
    relaxed: 1.6,
    loose: 1.75,
  },
};

export const shadows = {
  sm: '0 1px 8px rgba(0,0,0,0.30)',
  md: '0 4px 6px rgba(0, 0, 0, 0.3)',
  lg: '0 8px 32px rgba(168, 85, 247, 0.10)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.4)',
};

export const transitions = {
  fast: '0.15s ease-in-out',
  base: '0.3s ease-in-out',
  slow: '0.5s ease-in-out',
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  smooth: [0.33, 1, 0.68, 1],
};

export const breakpoints = {
  mobile: '640px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
};

/**
 * Common style objects for reuse
 */
export const commonStyles = {
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  flexBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
  },

  card: {
    background: colors.bg.tertiary,
    border: colors.border.primary,
    borderRadius: borderRadius.lg,
    padding: spacing['2xl'],
    boxShadow: shadows.sm,
  },

  button: {
    padding: `${spacing.md} ${spacing.xl}`,
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    cursor: 'pointer',
    border: 'none',
    transition: transitions.fast,
  },

  buttonPrimary: {
    backgroundColor: colors.accent,
    color: colors.text.primary,
  },

  buttonSecondary: {
    backgroundColor: colors.disabled,
    color: colors.text.hint,
  },

  input: {
    padding: `${spacing.md} ${spacing.lg}`,
    borderRadius: borderRadius.md,
    border: colors.border.primary,
    backgroundColor: colors.bg.secondary,
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.sans,
  },

  heading1: {
    fontFamily: typography.fontFamily.montserrat,
    fontSize: typography.fontSize['6xl'],
    fontWeight: typography.fontWeight.black,
    color: colors.text.primary,
    letterSpacing: '-0.02em',
    lineHeight: typography.lineHeight.tight,
  },

  heading2: {
    fontFamily: typography.fontFamily.montserrat,
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    letterSpacing: '-0.01em',
  },

  heading3: {
    fontFamily: typography.fontFamily.montserrat,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },

  bodyText: {
    fontFamily: typography.fontFamily.serif,
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed,
  },

  smallText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.muted,
  },

  monoLabel: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: colors.primary,
  },
};

/**
 * Gradient definitions
 */
export const gradients = {
  primary: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 60%, #7c3aed 100%)`,
  subtle: `radial-gradient(ellipse 80% 100% at 50% 0%, rgba(168, 85, 247,0.05) 0%, transparent 70%)`,
};

/**
 * Animation configurations
 */
export const animations = {
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 28,
  },

  smooth: {
    duration: 0.5,
    ease: [0.33, 1, 0.68, 1],
  },

  fade: {
    duration: 0.3,
  },
};
