import { type ReactNode } from 'react';
import { cn } from '@/utils/cn';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  /** Badge variant */
  variant?: BadgeVariant;
  /** Badge size */
  size?: BadgeSize;
  /** Left icon */
  icon?: ReactNode;
  /** Badge content */
  children: ReactNode;
  /** Additional className */
  className?: string;
  /** Pulsing dot indicator */
  pulse?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: cn(
    'bg-success-100 text-success-700',
    'dark:bg-success-900/30 dark:text-success-400'
  ),
  warning: cn(
    'bg-warning-100 text-warning-700',
    'dark:bg-warning-900/30 dark:text-warning-400'
  ),
  error: cn(
    'bg-error-100 text-error-700',
    'dark:bg-error-900/30 dark:text-error-400'
  ),
  info: cn(
    'bg-primary-100 text-primary-700',
    'dark:bg-primary-900/30 dark:text-primary-400'
  ),
  neutral: cn(
    'bg-slate-100 text-slate-600',
    'dark:bg-slate-800 dark:text-slate-300'
  ),
  primary: cn(
    'bg-primary-500 text-white',
    'dark:bg-primary-600'
  ),
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
  lg: 'px-3 py-1.5 text-sm gap-2',
};

const pulseColors: Record<BadgeVariant, string> = {
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
  info: 'bg-primary-500',
  neutral: 'bg-slate-500',
  primary: 'bg-white',
};

export function Badge({
  variant = 'neutral',
  size = 'md',
  icon,
  children,
  className,
  pulse = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              pulseColors[variant]
            )}
          />
          <span
            className={cn(
              'relative inline-flex rounded-full h-2 w-2',
              pulseColors[variant]
            )}
          />
        </span>
      )}
      {icon}
      {children}
    </span>
  );
}
