import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { PaymentMethod } from '@/types';
import { defaultPaymentOptions, type PaymentOption } from './constants';

export type { PaymentOption };

export interface PaymentMethodSelectorProps {
  /** Currently selected payment method */
  value: PaymentMethod;
  /** Change handler */
  onChange: (method: PaymentMethod) => void;
  /** Available payment options */
  options?: PaymentOption[];
  /** Label text */
  label?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Layout direction */
  layout?: 'horizontal' | 'vertical';
  /** Additional className */
  className?: string;
}

export function PaymentMethodSelector({
  value,
  onChange,
  options = defaultPaymentOptions,
  label = 'Payment Method',
  disabled = false,
  layout = 'horizontal',
  className,
}: PaymentMethodSelectorProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
          {label}
        </label>
      )}

      <div
        className={cn(
          'gap-2',
          layout === 'horizontal' ? 'grid grid-cols-3' : 'flex flex-col'
        )}
      >
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;

          return (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => !disabled && onChange(option.value)}
              disabled={disabled}
              whileHover={disabled ? {} : { scale: 1.02 }}
              whileTap={disabled ? {} : { scale: 0.98 }}
              className={cn(
                'flex flex-col items-center gap-2 px-4 py-3 border-2 rounded-xl transition-all duration-200',
                isSelected
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5',
                  isSelected
                    ? 'text-primary-500'
                    : 'text-slate-400 dark:text-slate-500'
                )}
              />
              <span className="text-sm font-medium">{option.label}</span>
              {option.description && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {option.description}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// Compact payment pill selector
export function PaymentMethodPill({
  value,
  onChange,
  options = defaultPaymentOptions,
  disabled = false,
  className,
}: Omit<PaymentMethodSelectorProps, 'label' | 'layout'>) {
  return (
    <div
      className={cn(
        'inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-full gap-1',
        className
      )}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => !disabled && onChange(option.value)}
            disabled={disabled}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
              isSelected
                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
