/**
 * SwiftRide Design System - Breakpoint Tokens
 * Mobile-first responsive design
 */

export const breakpoints = {
  xs: '475px',   // Small phones
  sm: '640px',   // Large phones
  md: '768px',   // Tablets
  lg: '1024px',  // Laptops
  xl: '1280px',  // Desktops
  '2xl': '1536px', // Large desktops
} as const;

// Screen size queries for use in CSS-in-JS
export const mediaQueries = {
  xs: `(min-width: ${breakpoints.xs})`,
  sm: `(min-width: ${breakpoints.sm})`,
  md: `(min-width: ${breakpoints.md})`,
  lg: `(min-width: ${breakpoints.lg})`,
  xl: `(min-width: ${breakpoints.xl})`,
  '2xl': `(min-width: ${breakpoints['2xl']})`,
  // Max-width queries for targeting smaller screens
  maxXs: `(max-width: ${breakpoints.xs})`,
  maxSm: `(max-width: ${breakpoints.sm})`,
  maxMd: `(max-width: ${breakpoints.md})`,
  maxLg: `(max-width: ${breakpoints.lg})`,
  maxXl: `(max-width: ${breakpoints.xl})`,
  // Special queries
  mobile: `(max-width: ${breakpoints.md})`,
  tablet: `(min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg})`,
  desktop: `(min-width: ${breakpoints.lg})`,
  touch: '(hover: none) and (pointer: coarse)',
  mouse: '(hover: hover) and (pointer: fine)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
  darkMode: '(prefers-color-scheme: dark)',
  lightMode: '(prefers-color-scheme: light)',
} as const;

// Container padding at different breakpoints
export const containerPadding = {
  default: '1rem',   // 16px
  sm: '1.5rem',      // 24px
  lg: '2rem',        // 32px
} as const;

export type Breakpoints = typeof breakpoints;
export type MediaQueries = typeof mediaQueries;
