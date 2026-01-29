import { motion } from 'framer-motion';
import { Receipt } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface FareEstimate {
  min: number;
  max: number;
  currency: string;
}

export interface FareBreakdown {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surgeAmount?: number;
  taxes: number;
  total: number;
}

export interface FareDisplayProps {
  /** Estimated fare (for pending rides) */
  estimate?: FareEstimate;
  /** Detailed fare breakdown (for completed rides) */
  breakdown?: FareBreakdown;
  /** Ride tier label */
  tier?: string;
  /** Currency symbol override */
  currencySymbol?: string;
  /** Compact variant */
  compact?: boolean;
  /** Additional className */
  className?: string;
}

export function FareDisplay({
  estimate,
  breakdown,
  tier,
  currencySymbol = '₹',
  compact = false,
  className,
}: FareDisplayProps) {
  // Show breakdown if available, otherwise show estimate
  if (breakdown) {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className={cn(
          'bg-gradient-to-br from-success-50 to-teal-50 dark:from-success-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-success-200 dark:border-success-800',
          className
        )}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-success-500 rounded-lg flex items-center justify-center">
            <Receipt className="w-4 h-4 text-white" />
          </div>
          <h4 className="font-semibold text-slate-800 dark:text-slate-100">Trip Receipt</h4>
        </div>

        <div className="space-y-2">
          <FareRow label="Base Fare" value={breakdown.baseFare} symbol={currencySymbol} />
          <FareRow label="Distance Charge" value={breakdown.distanceFare} symbol={currencySymbol} />
          <FareRow label="Time Charge" value={breakdown.timeFare} symbol={currencySymbol} />
          {breakdown.surgeAmount && breakdown.surgeAmount > 0 && (
            <FareRow
              label="Surge Pricing"
              value={breakdown.surgeAmount}
              symbol={currencySymbol}
              highlight
            />
          )}
          <FareRow label="Taxes & Fees" value={breakdown.taxes} symbol={currencySymbol} />
          <div className="border-t border-success-200 dark:border-success-800 pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800 dark:text-slate-100">Total Amount</span>
              <span className="font-bold text-xl text-success-600 dark:text-success-400">
                {currencySymbol}{breakdown.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (estimate) {
    return (
      <div
        className={cn(
          'flex items-center justify-between bg-slate-50 dark:bg-slate-700 rounded-xl',
          compact ? 'py-2 px-3' : 'py-3 px-4',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center',
              compact ? 'w-8 h-8' : 'w-10 h-10'
            )}
          >
            <Receipt
              className={cn(
                'text-primary-600 dark:text-primary-400',
                compact ? 'w-4 h-4' : 'w-5 h-5'
              )}
            />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">
              Estimated Fare
            </p>
            <p
              className={cn(
                'font-bold text-slate-800 dark:text-slate-100',
                compact ? 'text-base' : 'text-lg'
              )}
            >
              {currencySymbol}{estimate.min} - {currencySymbol}{estimate.max}
            </p>
          </div>
        </div>
        {tier && (
          <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">
              Ride Type
            </p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
              {tier}
            </span>
          </div>
        )}
      </div>
    );
  }

  return null;
}

// Internal FareRow component
function FareRow({
  label,
  value,
  symbol = '₹',
  highlight = false,
}: {
  label: string;
  value: number;
  symbol?: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span
        className={cn(
          highlight
            ? 'text-warning-600 dark:text-warning-400'
            : 'text-slate-600 dark:text-slate-400'
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          highlight
            ? 'text-warning-600 dark:text-warning-400 font-medium'
            : 'text-slate-700 dark:text-slate-300'
        )}
      >
        {symbol}{value.toFixed(2)}
      </span>
    </div>
  );
}
