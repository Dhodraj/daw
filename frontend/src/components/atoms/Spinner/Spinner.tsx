import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'primary' | 'white' | 'muted';

export interface SpinnerProps {
  /** Spinner size */
  size?: SpinnerSize;
  /** Color variant */
  variant?: SpinnerVariant;
  /** Additional className */
  className?: string;
  /** Accessibility label */
  label?: string;
}

const sizeStyles: Record<SpinnerSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

const variantStyles: Record<SpinnerVariant, string> = {
  primary: 'text-primary-500',
  white: 'text-white',
  muted: 'text-slate-400 dark:text-slate-500',
};

export function Spinner({
  size = 'md',
  variant = 'primary',
  className,
  label = 'Loading...',
}: SpinnerProps) {
  return (
    <span role="status" aria-label={label}>
      <Loader2
        size={sizeStyles[size]}
        className={cn('animate-spin', variantStyles[variant], className)}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

// Full page loading spinner
export function PageSpinner({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-50">
      <Spinner size="xl" />
      {message && (
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">{message}</p>
      )}
    </div>
  );
}

// Inline loading indicator
export function InlineSpinner({ text }: { text?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
      <Spinner size="sm" variant="muted" />
      {text || 'Loading...'}
    </span>
  );
}
