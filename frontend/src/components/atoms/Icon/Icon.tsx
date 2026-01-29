import { type LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type IconVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'muted';

export interface IconProps {
  /** Lucide icon component */
  icon: LucideIcon;
  /** Icon size */
  size?: IconSize;
  /** Color variant */
  variant?: IconVariant;
  /** Additional className */
  className?: string;
  /** Accessibility label */
  label?: string;
}

const sizeMap: Record<IconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

const variantStyles: Record<IconVariant, string> = {
  default: 'text-slate-700 dark:text-slate-200',
  primary: 'text-primary-500',
  success: 'text-success-500',
  warning: 'text-warning-500',
  error: 'text-error-500',
  muted: 'text-slate-400 dark:text-slate-500',
};

export function Icon({
  icon: IconComponent,
  size = 'md',
  variant = 'default',
  className,
  label,
}: IconProps) {
  return (
    <IconComponent
      size={sizeMap[size]}
      className={cn(variantStyles[variant], className)}
      aria-hidden={!label}
      aria-label={label}
    />
  );
}

// Icon with background circle
export interface IconCircleProps extends IconProps {
  /** Background color variant */
  bgVariant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
}

const bgVariantStyles: Record<string, string> = {
  primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
  success: 'bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400',
  warning: 'bg-warning-100 dark:bg-warning-900/30 text-warning-600 dark:text-warning-400',
  error: 'bg-error-100 dark:bg-error-900/30 text-error-600 dark:text-error-400',
  neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
};

const circleSizes: Record<IconSize, string> = {
  xs: 'p-1',
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-2.5',
  xl: 'p-3',
};

export function IconCircle({
  icon: IconComponent,
  size = 'md',
  bgVariant = 'primary',
  className,
  label,
}: IconCircleProps) {
  return (
    <div
      className={cn(
        'rounded-full',
        bgVariantStyles[bgVariant],
        circleSizes[size],
        className
      )}
    >
      <IconComponent
        size={sizeMap[size]}
        aria-hidden={!label}
        aria-label={label}
      />
    </div>
  );
}

// Icon with gradient background
export function IconGradient({
  icon: IconComponent,
  size = 'md',
  gradientFrom = 'from-primary-500',
  gradientTo = 'to-primary-600',
  className,
}: Omit<IconProps, 'variant'> & {
  gradientFrom?: string;
  gradientTo?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br text-white',
        gradientFrom,
        gradientTo,
        circleSizes[size],
        className
      )}
    >
      <IconComponent size={sizeMap[size]} />
    </div>
  );
}
