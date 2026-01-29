import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { RideTier } from '@/types';
import { defaultTierOptions, type TierOption } from './constants';

export type { TierOption };

export interface TierSelectorProps {
  /** Currently selected tier */
  value: RideTier;
  /** Change handler */
  onChange: (tier: RideTier) => void;
  /** Available tier options */
  options?: TierOption[];
  /** Label text */
  label?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Additional className */
  className?: string;
}

export function TierSelector({
  value,
  onChange,
  options = defaultTierOptions,
  label = 'Choose Your Ride',
  disabled = false,
  className,
}: TierSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  if (!selectedOption) return null;

  const Icon = selectedOption.icon;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
          {label}
        </label>
      )}

      {/* Selected Tier Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full px-4 py-3 border-2 rounded-xl text-left transition-all duration-200',
          isOpen
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 bg-gradient-to-br rounded-xl flex items-center justify-center',
                selectedOption.gradient
              )}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {selectedOption.label}
              </span>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {selectedOption.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-primary-600 dark:text-primary-400 font-bold">
              {selectedOption.basePrice}+
            </span>
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>
      </button>

      {/* Dropdown Options */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-2 border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
              {options.map((option) => {
                const OptionIcon = option.icon;
                const isSelected = value === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'w-full px-4 py-3 text-left transition-all duration-200',
                      'hover:bg-slate-50 dark:hover:bg-slate-700',
                      isSelected && 'bg-primary-50 dark:bg-primary-900/20'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-10 h-10 bg-gradient-to-br rounded-xl flex items-center justify-center',
                            option.gradient
                          )}
                        >
                          <OptionIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-100">
                            {option.label}
                          </span>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {option.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600 dark:text-slate-300 font-bold">
                          {option.basePrice}+
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-primary-500" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
