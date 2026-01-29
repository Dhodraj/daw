import { type ReactNode, type HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'ghost';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card variant */
  variant?: CardVariant;
  /** Enable hover effect */
  hoverable?: boolean;
  /** Make card clickable */
  clickable?: boolean;
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Children */
  children: ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default: cn(
    'bg-white dark:bg-slate-800',
    'border border-slate-200 dark:border-slate-700',
    'shadow-md'
  ),
  elevated: cn(
    'bg-white dark:bg-slate-800',
    'border border-slate-100 dark:border-slate-700',
    'shadow-xl'
  ),
  outlined: cn(
    'bg-transparent',
    'border-2 border-slate-200 dark:border-slate-700'
  ),
  ghost: cn(
    'bg-slate-50/50 dark:bg-slate-800/50',
    'border border-transparent'
  ),
};

const paddingStyles: Record<string, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

export function Card({
  variant = 'default',
  hoverable = false,
  clickable = false,
  padding = 'md',
  children,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-normal',
        variantStyles[variant],
        paddingStyles[padding],
        hoverable && 'hover:shadow-lg hover:-translate-y-0.5',
        clickable && 'cursor-pointer active:scale-[0.99]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Card Header component
export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  gradient?: boolean;
  gradientColors?: string;
  className?: string;
}

export function CardHeader({
  title,
  subtitle,
  icon,
  action,
  gradient = false,
  gradientColors = 'from-primary-500 to-primary-600',
  className,
}: CardHeaderProps) {
  if (gradient) {
    return (
      <div
        className={cn(
          'px-5 py-4 -mx-5 -mt-5 mb-5 rounded-t-2xl',
          `bg-gradient-to-r ${gradientColors}`,
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2 bg-white/20 rounded-xl">
                {icon}
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              {subtitle && (
                <p className="text-sm text-white/80">{subtitle}</p>
              )}
            </div>
          </div>
          {action}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl text-primary-600 dark:text-primary-400">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

// Card Content component
export function CardContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn('space-y-4', className)}>{children}</div>;
}

// Card Footer component
export function CardFooter({
  children,
  className,
  bordered = false,
}: {
  children: ReactNode;
  className?: string;
  bordered?: boolean;
}) {
  return (
    <div
      className={cn(
        'mt-4 pt-4',
        bordered && 'border-t border-slate-200 dark:border-slate-700',
        className
      )}
    >
      {children}
    </div>
  );
}

// Animated Card with Framer Motion
export interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function AnimatedCard({
  children,
  className,
  delay = 0,
  padding = 'md',
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={cn(
        'rounded-2xl transition-shadow duration-normal',
        'bg-white dark:bg-slate-800',
        'border border-slate-200 dark:border-slate-700',
        'shadow-md',
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </motion.div>
  );
}
