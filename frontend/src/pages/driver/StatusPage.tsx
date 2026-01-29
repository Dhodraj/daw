import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Power,
  MapPin,
  Clock,
  DollarSign,
  TrendingUp,
  Bell,
  ChevronRight,
  Zap,
  Navigation,
  Info,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useDriverStore } from '@/stores/driverStore';
import { useAuthStore } from '@/stores/authStore';
import api from '@/services/api';

export default function StatusPage() {
  const [showSurgeInfo, setShowSurgeInfo] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const onlineStartTime = useRef<number | null>(null);

  const user = useAuthStore((state) => state.user);
  const { status, setStatus, dailyStats, updateDailyStats } = useDriverStore();

  const isOnline = status === 'online' || status === 'busy';

  // Track online time
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isOnline && !onlineStartTime.current) {
      onlineStartTime.current = Date.now();
    }

    if (isOnline) {
      interval = setInterval(() => {
        if (onlineStartTime.current) {
          const hoursOnline = (Date.now() - onlineStartTime.current) / (1000 * 60 * 60);
          updateDailyStats({ onlineHours: dailyStats.onlineHours + hoursOnline });
        }
      }, 60000); // Update every minute
    } else {
      onlineStartTime.current = null;
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOnline, dailyStats.onlineHours, updateDailyStats]);

  const handleToggleStatus = async () => {
    if (!user?.id || isToggling) return;

    setIsToggling(true);
    try {
      const newStatus = isOnline ? 'OFFLINE' : 'AVAILABLE';
      await api.updateDriverStatus(user.id, newStatus);
      setStatus(isOnline ? 'offline' : 'online');
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const formatOnlineTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Status Toggle Card */}
        <div className={cn(
          'rounded-3xl p-6 mb-6 transition-all duration-500',
          isOnline
            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
        )}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={cn(
                'text-2xl font-bold',
                isOnline ? 'text-white' : 'text-slate-800 dark:text-slate-100'
              )}>
                {isOnline ? "You're Online" : "You're Offline"}
              </h2>
              <p className={cn(
                'text-sm mt-1',
                isOnline ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'
              )}>
                {isOnline
                  ? 'Listening for ride requests'
                  : 'Go online to start receiving requests'}
              </p>
            </div>

            {/* Power Button */}
            <button
              onClick={handleToggleStatus}
              disabled={isToggling}
              className={cn(
                'w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300',
                isOnline
                  ? 'bg-white/20 hover:bg-white/30'
                  : 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30',
                isToggling && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Power className={cn(
                'w-10 h-10 transition-transform',
                isOnline ? 'text-white' : 'text-white',
                isOnline && !isToggling && 'animate-pulse'
              )} />
            </button>
          </div>

          {/* Online Status Indicator */}
          {isOnline && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2"
            >
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-sm text-white/80">Listening for ride requests...</span>
            </motion.div>
          )}
        </div>

        {/* Surge Zone Alert - Only show when there's actual surge data */}
        <AnimatePresence>
          {isOnline && false && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div
                className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-4 text-white cursor-pointer"
                onClick={() => setShowSurgeInfo(!showSurgeInfo)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Surge Zone Active</p>
                      <p className="text-sm text-white/80">1.5x multiplier nearby</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">1.5x</span>
                    <Info className="w-5 h-5 text-white/70" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Today's Stats */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 mb-6">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">
            Today's Summary
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                <span className="text-sm text-slate-500 dark:text-slate-400">Earnings</span>
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                ₹{dailyStats.earnings.toFixed(2)}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="w-5 h-5 text-primary-500" />
                <span className="text-sm text-slate-500 dark:text-slate-400">Trips</span>
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {dailyStats.trips}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-violet-500" />
                <span className="text-sm text-slate-500 dark:text-slate-400">Online Time</span>
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {formatOnlineTime(dailyStats.onlineHours)}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-success-500" />
                <span className="text-sm text-slate-500 dark:text-slate-400">Acceptance</span>
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {dailyStats.acceptanceRate}%
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary-500" />
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-800 dark:text-slate-100">Set Destination</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Get rides heading your way</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>

          <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning-100 dark:bg-warning-900/30 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-warning-500" />
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-800 dark:text-slate-100">Request Preferences</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage ride types</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Heat Map Hint */}
        {!isOnline && (
          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Tip:</span>{' '}
                  High demand areas are shown in orange on the map when you're online.
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
