/**
 * Utility for constructing className strings conditionally
 * Combines clsx for conditional classes with tailwind-merge for deduplication
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using clsx and removes Tailwind CSS conflicts using tailwind-merge
 * @param inputs - Class names or conditional class objects
 * @returns Merged and deduplicated class string
 *
 * @example
 * cn('px-2 py-1', 'px-4') // => 'py-1 px-4'
 * cn('text-red-500', condition && 'text-blue-500') // conditional classes
 * cn({ 'bg-red-500': isError, 'bg-green-500': !isError }) // object syntax
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
