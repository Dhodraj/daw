import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input size */
  size?: InputSize;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Left icon/element */
  leftElement?: ReactNode;
  /** Right icon/element */
  rightElement?: ReactNode;
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Full width */
  fullWidth?: boolean;
}

const sizeStyles: Record<InputSize, string> = {
  sm: 'py-1.5 px-3 text-xs',
  md: 'py-2.5 px-4 text-sm',
  lg: 'py-3 px-4 text-base',
};

const iconPaddingLeft: Record<InputSize, string> = {
  sm: 'pl-8',
  md: 'pl-10',
  lg: 'pl-12',
};

const iconPaddingRight: Record<InputSize, string> = {
  sm: 'pr-8',
  md: 'pr-10',
  lg: 'pr-12',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      error = false,
      errorMessage,
      leftElement,
      rightElement,
      label,
      helperText,
      fullWidth = true,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftElement && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              {leftElement}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              // Base styles
              'w-full rounded-xl',
              'bg-white dark:bg-slate-800',
              'text-slate-900 dark:text-slate-100',
              'placeholder:text-slate-400 dark:placeholder:text-slate-500',
              'transition-all duration-fast',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              // Border
              error
                ? 'border-2 border-error-500 focus:ring-error-500/20'
                : 'border border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-primary-500/20',
              // Size
              sizeStyles[size],
              // Icon padding
              leftElement && iconPaddingLeft[size],
              rightElement && iconPaddingRight[size],
              // Disabled
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-slate-700',
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              {rightElement}
            </div>
          )}
        </div>
        {(errorMessage || helperText) && (
          <p
            className={cn(
              'text-xs',
              error ? 'text-error-500' : 'text-slate-500 dark:text-slate-400'
            )}
          >
            {error ? errorMessage : helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
