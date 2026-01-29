import { cn } from '@/utils/cn';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';
export type SkeletonAnimation = 'pulse' | 'shimmer' | 'none';

export interface SkeletonProps {
  /** Shape variant */
  variant?: SkeletonVariant;
  /** Animation type */
  animation?: SkeletonAnimation;
  /** Width (number for px, string for any unit) */
  width?: number | string;
  /** Height (number for px, string for any unit) */
  height?: number | string;
  /** Additional className */
  className?: string;
}

const variantStyles: Record<SkeletonVariant, string> = {
  text: 'rounded h-4',
  circular: 'rounded-full',
  rectangular: 'rounded-xl',
};

const animationStyles: Record<SkeletonAnimation, string> = {
  pulse: 'animate-pulse',
  shimmer: 'animate-shimmer bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%]',
  none: '',
};

export function Skeleton({
  variant = 'rectangular',
  animation = 'pulse',
  width,
  height,
  className,
}: SkeletonProps) {
  const widthStyle = typeof width === 'number' ? `${width}px` : width;
  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={cn(
        'bg-slate-200 dark:bg-slate-700',
        variantStyles[variant],
        animationStyles[animation],
        className
      )}
      style={{
        width: widthStyle,
        height: heightStyle,
      }}
      aria-hidden="true"
    />
  );
}

// Compound components for common skeletons

export function TextSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}

export function AvatarSkeleton({ size = 40 }: { size?: number }) {
  return <Skeleton variant="circular" width={size} height={size} />;
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('p-5 space-y-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700', className)}>
      <div className="flex items-center gap-3">
        <AvatarSkeleton size={48} />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={12} />
        </div>
      </div>
      <Skeleton height={60} />
      <div className="flex gap-2">
        <Skeleton width="30%" height={36} />
        <Skeleton width="70%" height={36} />
      </div>
    </div>
  );
}

export function RideCardSkeleton() {
  return (
    <div className="p-5 space-y-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton width={100} height={24} />
        <Skeleton width={80} height={24} variant="circular" />
      </div>
      {/* Route */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton width="70%" height={16} />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton width="60%" height={16} />
        </div>
      </div>
      {/* Driver info */}
      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
        <AvatarSkeleton size={48} />
        <div className="flex-1 space-y-2">
          <Skeleton width="50%" height={16} />
          <Skeleton width="70%" height={12} />
        </div>
      </div>
      {/* Actions */}
      <Skeleton height={44} />
    </div>
  );
}
