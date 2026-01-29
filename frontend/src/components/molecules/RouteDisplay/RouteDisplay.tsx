import { CircleDot, Navigation } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface RoutePoint {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface RouteDisplayProps {
  /** Pickup location */
  pickup: RoutePoint;
  /** Destination location */
  destination: RoutePoint;
  /** Compact variant */
  compact?: boolean;
  /** Show connector between points */
  showConnector?: boolean;
  /** Additional className */
  className?: string;
}

export function RouteDisplay({
  pickup,
  destination,
  compact = false,
  showConnector = true,
  className,
}: RouteDisplayProps) {
  const formatAddress = (point: RoutePoint) =>
    point.address || `${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}`;

  return (
    <div className={cn('space-y-3', className)}>
      <RoutePointItem
        type="pickup"
        address={formatAddress(pickup)}
        compact={compact}
      />
      {showConnector && <RouteConnectorLine compact={compact} />}
      <RoutePointItem
        type="destination"
        address={formatAddress(destination)}
        compact={compact}
      />
    </div>
  );
}

// Individual route point
interface RoutePointItemProps {
  type: 'pickup' | 'destination';
  address: string;
  compact?: boolean;
  className?: string;
}

export function RoutePointItem({
  type,
  address,
  compact = false,
  className,
}: RoutePointItemProps) {
  const isPickup = type === 'pickup';
  const Icon = isPickup ? CircleDot : Navigation;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'rounded-xl flex items-center justify-center',
          isPickup ? 'bg-success-500' : 'bg-error-500',
          compact ? 'w-8 h-8' : 'w-10 h-10'
        )}
      >
        <Icon className={cn('text-white', compact ? 'w-4 h-4' : 'w-5 h-5')} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'font-semibold uppercase tracking-wide',
            isPickup
              ? 'text-success-600 dark:text-success-400'
              : 'text-error-600 dark:text-error-400',
            compact ? 'text-[10px]' : 'text-xs'
          )}
        >
          {isPickup ? 'Pickup Point' : 'Drop-off Point'}
        </p>
        <p
          className={cn(
            'text-slate-700 dark:text-slate-300 truncate',
            compact ? 'text-xs' : 'text-sm'
          )}
        >
          {address}
        </p>
      </div>
    </div>
  );
}

// Connector line between points
function RouteConnectorLine({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3', compact ? 'pl-3' : 'pl-4')}>
      <div className="flex flex-col items-center gap-1">
        <div className="w-0.5 h-2 bg-slate-300 dark:bg-slate-600" />
        <div className="w-0.5 h-2 bg-slate-300 dark:bg-slate-600" />
      </div>
      <div className="flex-1 border-t border-dashed border-slate-200 dark:border-slate-600" />
    </div>
  );
}

// Horizontal compact route display
export function RouteDisplayCompact({
  pickup,
  destination,
  className,
}: Omit<RouteDisplayProps, 'compact' | 'showConnector'>) {
  const formatAddress = (point: RoutePoint) =>
    point.address || `${point.latitude.toFixed(2)}, ${point.longitude.toFixed(2)}`;

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm',
        className
      )}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <CircleDot className="w-4 h-4 text-success-500 flex-shrink-0" />
        <span className="text-slate-600 dark:text-slate-400 truncate">
          {formatAddress(pickup)}
        </span>
      </div>
      <div className="flex-shrink-0 text-slate-300 dark:text-slate-600">→</div>
      <div className="flex items-center gap-1.5 min-w-0">
        <Navigation className="w-4 h-4 text-error-500 flex-shrink-0" />
        <span className="text-slate-600 dark:text-slate-400 truncate">
          {formatAddress(destination)}
        </span>
      </div>
    </div>
  );
}
