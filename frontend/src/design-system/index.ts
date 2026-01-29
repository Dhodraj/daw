/**
 * SwiftRide Design System
 *
 * This is the main entry point for the design system.
 * Import tokens and utilities from here.
 */

// Tokens
export * from './tokens';

// Re-export commonly used items at top level for convenience
export { colors, gradients } from './tokens/colors';
export { spacing, borderRadius, zIndex } from './tokens/spacing';
export { shadows, coloredShadows } from './tokens/shadows';
export { fontFamily, fontSize, fontWeight, textStyles } from './tokens/typography';
export { easing, duration, motionPresets } from './tokens/animations';
export { breakpoints, mediaQueries } from './tokens/breakpoints';
