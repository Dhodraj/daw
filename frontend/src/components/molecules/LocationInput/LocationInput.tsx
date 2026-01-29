import { MapPin, Navigation, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

export type LocationType = 'pickup' | 'destination';

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface LocationInputProps {
  /** Location type */
  type: LocationType;
  /** Current location value */
  location: Location | null;
  /** Click handler to select location on map */
  onSelect: () => void;
  /** Additional className */
  className?: string;
  /** Disable the input */
  disabled?: boolean;
}

const typeConfig = {
  pickup: {
    label: 'Pickup Location',
    placeholder: 'Tap to select on map',
    icon: MapPin,
    colors: {
      bg: 'bg-success-500',
      bgLight: 'bg-success-50 dark:bg-success-900/20',
      border: 'border-success-500',
      text: 'text-success-700 dark:text-success-400',
      icon: 'text-success-500',
    },
  },
  destination: {
    label: 'Drop-off Location',
    placeholder: 'Tap to select on map',
    icon: Navigation,
    colors: {
      bg: 'bg-error-500',
      bgLight: 'bg-error-50 dark:bg-error-900/20',
      border: 'border-error-500',
      text: 'text-error-700 dark:text-error-400',
      icon: 'text-error-500',
    },
  },
};

export function LocationInput({
  type,
  location,
  onSelect,
  className,
  disabled = false,
}: LocationInputProps) {
  const config = typeConfig[type];
  const Icon = config.icon;
  const isSet = !!location;

  const displayAddress = location
    ? location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
    : config.placeholder;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.01 }}
      whileTap={disabled ? {} : { scale: 0.99 }}
      className={cn(
        'w-full text-left px-4 py-3 border-2 rounded-xl transition-all duration-200 group',
        isSet
          ? `${config.colors.border} ${config.colors.bgLight}`
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
            isSet
              ? config.colors.bg
              : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
          )}
        >
          <Icon
            className={cn(
              'w-5 h-5',
              isSet ? 'text-white' : 'text-slate-400 dark:text-slate-500'
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'text-xs font-semibold uppercase tracking-wide',
              isSet ? config.colors.text : 'text-slate-400 dark:text-slate-500'
            )}
          >
            {config.label}
          </p>
          <p
            className={cn(
              'text-sm truncate',
              isSet
                ? 'text-slate-700 dark:text-slate-200 font-medium'
                : 'text-slate-500 dark:text-slate-400'
            )}
          >
            {displayAddress}
          </p>
        </div>
        {isSet && (
          <CheckCircle2 className={cn('w-5 h-5', config.colors.icon)} />
        )}
      </div>
    </motion.button>
  );
}

// Route connector between pickup and destination
export function RouteConnector({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 px-4', className)}>
      <div className="flex flex-col items-center gap-0.5">
        <div className="w-0.5 h-2 bg-slate-300 dark:bg-slate-600" />
        <div className="w-0.5 h-2 bg-slate-300 dark:bg-slate-600" />
        <div className="w-0.5 h-2 bg-slate-300 dark:bg-slate-600" />
      </div>
      <div className="flex-1 border-t border-dashed border-slate-300 dark:border-slate-600" />
    </div>
  );
}
