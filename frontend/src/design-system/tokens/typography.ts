/**
 * SwiftRide Design System - Typography Tokens
 */

export const fontFamily = {
  sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
} as const;

export const fontSize = {
  xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
  sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
  base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
  lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
  xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
  '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
  '5xl': ['3rem', { lineHeight: '1' }],         // 48px
} as const;

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

export const lineHeight = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} as const;

// Preset text styles
export const textStyles = {
  h1: {
    fontSize: '2.25rem',
    fontWeight: '700',
    lineHeight: '1.25',
    letterSpacing: '-0.025em',
  },
  h2: {
    fontSize: '1.875rem',
    fontWeight: '600',
    lineHeight: '1.25',
    letterSpacing: '-0.025em',
  },
  h3: {
    fontSize: '1.5rem',
    fontWeight: '600',
    lineHeight: '1.375',
  },
  h4: {
    fontSize: '1.25rem',
    fontWeight: '600',
    lineHeight: '1.375',
  },
  h5: {
    fontSize: '1.125rem',
    fontWeight: '600',
    lineHeight: '1.5',
  },
  h6: {
    fontSize: '1rem',
    fontWeight: '600',
    lineHeight: '1.5',
  },
  body: {
    fontSize: '1rem',
    fontWeight: '400',
    lineHeight: '1.5',
  },
  bodySmall: {
    fontSize: '0.875rem',
    fontWeight: '400',
    lineHeight: '1.5',
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: '400',
    lineHeight: '1.25',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    lineHeight: '1.25',
  },
  button: {
    fontSize: '0.875rem',
    fontWeight: '500',
    lineHeight: '1.25',
    letterSpacing: '0.025em',
  },
} as const;

export type FontFamily = typeof fontFamily;
export type FontSize = typeof fontSize;
export type FontWeight = typeof fontWeight;
export type TextStyles = typeof textStyles;
