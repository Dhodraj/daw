import { forwardRef, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  /** Button visual style */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Show loading spinner */
  isLoading?: boolean;
  /** Icon to show on the left */
  leftIcon?: ReactNode;
  /** Icon to show on the right */
  rightIcon?: ReactNode;
  /** Button content */
  children?: ReactNode;
  /** Full width button */
  fullWidth?: boolean;
  /** Disable animations (for reduced motion) */
  disableAnimations?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: cn(
    'bg-gradient-to-r from-primary-500 to-primary-600',
    'text-white',
    'shadow-primary-md',
    'hover:from-primary-600 hover:to-primary-700',
    'focus-visible:ring-primary-500'
  ),
  secondary: cn(
    'bg-white dark:bg-slate-800',
    'text-slate-700 dark:text-slate-200',
    'border border-slate-200 dark:border-slate-700',
    'hover:bg-slate-50 dark:hover:bg-slate-700',
    'hover:border-slate-300 dark:hover:border-slate-600',
    'focus-visible:ring-slate-400'
  ),
  danger: cn(
    'bg-white dark:bg-slate-800',
    'text-error-500',
    'border border-error-500',
    'hover:bg-error-50 dark:hover:bg-error-900/20',
    'focus-visible:ring-error-500'
  ),
  ghost: cn(
    'bg-transparent',
    'text-slate-600 dark:text-slate-300',
    'hover:bg-slate-100 dark:hover:bg-slate-700',
    'focus-visible:ring-slate-400'
  ),
  success: cn(
    'bg-gradient-to-r from-success-500 to-success-600',
    'text-white',
    'shadow-success-sm',
    'hover:from-success-600 hover:to-success-700',
    'focus-visible:ring-success-500'
  ),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-4 py-2.5 text-sm gap-2 rounded-xl',
  lg: 'px-6 py-3 text-base gap-2 rounded-xl',
};

const iconSizes: Record<ButtonSize, number> = {
  sm: 14,
  md: 16,
  lg: 18,
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      fullWidth = false,
      disableAnimations = false,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    const motionProps = disableAnimations
      ? {}
      : {
          whileHover: isDisabled ? {} : { scale: 1.02, y: -1 },
          whileTap: isDisabled ? {} : { scale: 0.98 },
          transition: { duration: 0.15 },
        };

    return (
      <motion.button
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center',
          'font-medium',
          'transition-all duration-fast',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          // Variant and size
          variantStyles[variant],
          sizeStyles[size],
          // Full width
          fullWidth && 'w-full',
          className
        )}
        disabled={isDisabled}
        {...motionProps}
        {...props}
      >
        {isLoading ? (
          <Loader2
            size={iconSizes[size]}
            className="animate-spin"
          />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
