import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Car,
  ChevronRight,
  Download,
  CreditCard,
  Loader2,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/stores/authStore';
import { useDriverStore } from '@/stores/driverStore';
import api from '@/services/api';

type Period = 'today' | 'week' | 'month';

interface EarningsData {
  totalEarnings: number;
  tripCount: number;
  trips: Array<{
    fare: number;
    date: string | null;
  }>;
}

export default function EarningsPage() {
  const [period, setPeriod] = useState<Period>('today');
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);
  const { dailyStats } = useDriverStore();

  useEffect(() => {
    const fetchEarnings = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      setError(null);

      try {
        const now = new Date();
        let startDate: string | undefined;
        let endDate: string | undefined;

        if (period === 'today') {
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
          endDate = now.toISOString();
        } else if (period === 'week') {
          const weekStart = new Date(now);
          weekStart.setDate(weekStart.getDate() - 7);
          startDate = weekStart.toISOString();
          endDate = now.toISOString();
        } else if (period === 'month') {
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          startDate = monthStart.toISOString();
          endDate = now.toISOString();
        }

        const data = await api.getDriverEarnings(user.id, startDate, endDate);
        setEarnings(data);
      } catch (err) {
        console.error('Failed to fetch earnings:', err);
        setError('Failed to load earnings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEarnings();
  }, [user?.id, period]);

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Use API data or fall back to daily stats from store
  const currentEarnings = earnings?.totalEarnings ?? dailyStats.earnings;
  const currentTrips = earnings?.tripCount ?? dailyStats.trips;
  const perHour = dailyStats.onlineHours > 0 ? currentEarnings / dailyStats.onlineHours : 0;

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-2" />
          <p className="text-slate-500 dark:text-slate-400">Loading earnings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Earnings
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Track your income and performance
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-emerald-500 transition-colors">
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Export</span>
          </button>
        </div>

        {/* Period Tabs */}
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
          {(['today', 'week', 'month'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all',
                period === p
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              )}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {error ? (
          <div className="text-center py-12">
            <Car className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">{error}</p>
          </div>
        ) : (
          <>
            {/* Main Earnings Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 mb-6 text-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-white/70">Total Earnings</p>
                  <p className="text-4xl font-bold">₹{currentEarnings.toFixed(2)}</p>
                </div>
                {currentTrips > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium bg-white/20">
                    <TrendingUp className="w-4 h-4" />
                    Active
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-white/70">Trips</p>
                  <p className="text-xl font-semibold">{currentTrips}</p>
                </div>
                <div>
                  <p className="text-sm text-white/70">Online Hours</p>
                  <p className="text-xl font-semibold">{dailyStats.onlineHours.toFixed(1)}h</p>
                </div>
                <div>
                  <p className="text-sm text-white/70">Per Hour</p>
                  <p className="text-xl font-semibold">₹{perHour.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                  Recent Activity
                </h3>
              </div>

              {earnings?.trips && earnings.trips.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {earnings.trips.slice(0, 10).map((trip, index) => (
                    <div key={index} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary-100 dark:bg-primary-900/30">
                          <Car className="w-5 h-5 text-primary-500" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-100">
                            Completed Trip
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {trip.date ? formatTime(trip.date) : 'Recent'}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100">
                        +₹{trip.fare.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Car className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No trips completed in this period
                  </p>
                </div>
              )}
            </div>

            {/* Cash Out Button */}
            <button className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-slate-800 dark:text-slate-100">Cash Out</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Transfer earnings to your bank
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
