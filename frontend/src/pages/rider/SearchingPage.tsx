import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Car, X, Clock, Zap } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function SearchingPage() {
  const navigate = useNavigate();
  const [searchDuration, setSearchDuration] = useState(0);
  const [matchingStage, setMatchingStage] = useState<'searching' | 'matching' | 'confirming'>('searching');

  useEffect(() => {
    const timer = setInterval(() => {
      setSearchDuration((d) => d + 1);
    }, 1000);

    // Simulate matching progress
    const stageTimer = setTimeout(() => {
      setMatchingStage('matching');
    }, 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(stageTimer);
    };
  }, []);

  const handleCancel = () => {
    navigate('/rider/home');
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center"
      >
        {/* Animated Search Indicator */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          {/* Outer pulse rings */}
          <motion.div
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full bg-primary-500/20"
          />
          <motion.div
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
            className="absolute inset-0 rounded-full bg-primary-500/20"
          />
          <motion.div
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 1 }}
            className="absolute inset-0 rounded-full bg-primary-500/20"
          />

          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-xl shadow-primary-500/30">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Search className="w-8 h-8 text-white" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Status Text */}
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          {matchingStage === 'searching' && 'Finding nearby drivers...'}
          {matchingStage === 'matching' && 'Matching you with a driver...'}
          {matchingStage === 'confirming' && 'Driver confirming...'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          {matchingStage === 'searching' && 'Scanning for available drivers in your area'}
          {matchingStage === 'matching' && 'A driver is reviewing your request'}
          {matchingStage === 'confirming' && 'Almost there! Just a moment...'}
        </p>

        {/* Search Stats */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200/50 dark:border-slate-700 mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Clock className="w-5 h-5 text-primary-500" />
              </div>
              <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {Math.floor(searchDuration / 60)}:{String(searchDuration % 60).padStart(2, '0')}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Search Time</div>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-success-100 dark:bg-success-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Car className="w-5 h-5 text-success-500" />
              </div>
              <div className="text-lg font-bold text-slate-800 dark:text-slate-100">12</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Drivers Nearby</div>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-warning-100 dark:bg-warning-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Zap className="w-5 h-5 text-warning-500" />
              </div>
              <div className="text-lg font-bold text-slate-800 dark:text-slate-100">1.0x</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Surge</div>
            </div>
          </div>
        </div>

        {/* Trip Summary */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3 text-left">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-success-500 rounded-full" />
              <div className="w-0.5 h-8 bg-slate-300 dark:bg-slate-600" />
              <div className="w-3 h-3 bg-error-500 rounded-full" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Pickup</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                  Current Location
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Drop-off</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                  Destination
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['searching', 'matching', 'confirming'].map((stage, index) => (
            <div
              key={stage}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                matchingStage === stage
                  ? 'w-8 bg-primary-500'
                  : index < ['searching', 'matching', 'confirming'].indexOf(matchingStage)
                  ? 'bg-primary-500'
                  : 'bg-slate-300 dark:bg-slate-600'
              )}
            />
          ))}
        </div>

        {/* Cancel Button */}
        <button
          onClick={handleCancel}
          className="flex items-center justify-center gap-2 mx-auto px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-error-500 dark:hover:text-error-400 transition-colors"
        >
          <X className="w-5 h-5" />
          <span className="font-medium">Cancel Search</span>
        </button>
      </motion.div>
    </div>
  );
}
