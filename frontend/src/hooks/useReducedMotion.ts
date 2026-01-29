import { useState, useEffect } from 'react';

/**
 * Hook that detects user's reduced motion preference
 * Returns true if the user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return false;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    return mediaQuery.matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook that provides motion variants based on reduced motion preference
 * Returns animation config that respects user preferences
 */
export function useMotionConfig() {
  const prefersReducedMotion = useReducedMotion();

  return {
    prefersReducedMotion,
    // Framer Motion transition that respects reduced motion
    transition: prefersReducedMotion
      ? { duration: 0 }
      : { duration: 0.2, ease: 'easeOut' },
    // Fade only transition (subtle even with motion)
    fadeTransition: prefersReducedMotion
      ? { duration: 0 }
      : { duration: 0.15 },
    // Spring transition for interactive elements
    springTransition: prefersReducedMotion
      ? { duration: 0 }
      : { type: 'spring', stiffness: 500, damping: 30 },
  };
}
