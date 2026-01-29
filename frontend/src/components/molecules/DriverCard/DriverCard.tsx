import { motion } from 'framer-motion';
import { Phone, Star, CheckCircle2, Sparkles, Car } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface Driver {
  id?: string;
  name: string;
  phone: string;
  vehicleNumber: string;
  vehicleType?: string;
  rating: number;
}

export interface DriverCardProps {
  /** Driver information */
  driver: Driver;
  /** Show call button */
  showCallButton?: boolean;
  /** Compact variant */
  compact?: boolean;
  /** Additional className */
  className?: string;
}

export function DriverCard({
  driver,
  showCallButton = true,
  compact = false,
  className,
}: DriverCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl',
        compact ? 'p-3' : 'p-4',
        className
      )}
    >
      <div className="flex items-center gap-4">
        {/* Driver Avatar */}
        <div className="relative">
          <div
            className={cn(
              'bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg',
              compact ? 'w-12 h-12 text-lg' : 'w-14 h-14 text-xl'
            )}
          >
            {driver.name.charAt(0).toUpperCase()}
          </div>
          <div
            className={cn(
              'absolute -bottom-1 -right-1 bg-success-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800',
              compact ? 'w-4 h-4' : 'w-5 h-5'
            )}
          >
            <CheckCircle2 className={cn(compact ? 'w-2.5 h-2.5' : 'w-3 h-3', 'text-white')} />
          </div>
        </div>

        {/* Driver Details */}
        <div className="flex-1 min-w-0">
          <p className={cn('font-semibold text-slate-800 dark:text-slate-100', compact ? 'text-sm' : 'text-base')}>
            {driver.name}
          </p>
          <div className="flex items-center gap-2">
            <Car className="w-3.5 h-3.5 text-slate-400" />
            <p className={cn('text-slate-500 dark:text-slate-400 truncate', compact ? 'text-xs' : 'text-sm')}>
              {driver.vehicleNumber}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1 text-warning-500">
              <Star className={cn(compact ? 'w-3.5 h-3.5' : 'w-4 h-4', 'fill-current')} />
              <span className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>
                {driver.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <Sparkles className="w-3 h-3" />
              <span className="text-xs">Top Driver</span>
            </div>
          </div>
        </div>

        {/* Call Button */}
        {showCallButton && (
          <motion.a
            href={`tel:${driver.phone}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'bg-success-500 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-success-600 transition-colors',
              compact ? 'w-10 h-10' : 'w-12 h-12'
            )}
          >
            <Phone className={cn(compact ? 'w-4 h-4' : 'w-5 h-5')} />
          </motion.a>
        )}
      </div>
    </motion.div>
  );
}

// Skeleton version for loading state
export function DriverCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        'bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse',
        compact ? 'p-3' : 'p-4'
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'bg-slate-200 dark:bg-slate-700 rounded-xl',
            compact ? 'w-12 h-12' : 'w-14 h-14'
          )}
        />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20" />
        </div>
        <div
          className={cn(
            'bg-slate-200 dark:bg-slate-700 rounded-xl',
            compact ? 'w-10 h-10' : 'w-12 h-12'
          )}
        />
      </div>
    </div>
  );
}
