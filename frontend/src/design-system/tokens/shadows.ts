/**
 * SwiftRide Design System - Shadow Tokens
 * Elevation system for depth hierarchy
 */

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;

// Colored shadows for buttons and cards
export const coloredShadows = {
  primary: {
    sm: '0 2px 8px 0 rgba(59, 130, 246, 0.25)',
    md: '0 4px 14px 0 rgba(59, 130, 246, 0.35)',
    lg: '0 8px 20px 0 rgba(59, 130, 246, 0.4)',
  },
  success: {
    sm: '0 2px 8px 0 rgba(34, 197, 94, 0.25)',
    md: '0 4px 14px 0 rgba(34, 197, 94, 0.35)',
    lg: '0 8px 20px 0 rgba(34, 197, 94, 0.4)',
  },
  error: {
    sm: '0 2px 8px 0 rgba(239, 68, 68, 0.25)',
    md: '0 4px 14px 0 rgba(239, 68, 68, 0.35)',
    lg: '0 8px 20px 0 rgba(239, 68, 68, 0.4)',
  },
  warning: {
    sm: '0 2px 8px 0 rgba(245, 158, 11, 0.25)',
    md: '0 4px 14px 0 rgba(245, 158, 11, 0.35)',
    lg: '0 8px 20px 0 rgba(245, 158, 11, 0.4)',
  },
} as const;

// Dark mode shadows (slightly more visible)
export const darkShadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.5)',
} as const;

// Glass/blur effects
export const glassEffects = {
  light: {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  dark: {
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
} as const;

export type Shadows = typeof shadows;
export type ColoredShadows = typeof coloredShadows;
