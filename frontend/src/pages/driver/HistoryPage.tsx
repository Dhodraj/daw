import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Clock,
  Car,
  Calendar,
  Search,
  Star,
  Loader2,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/stores/authStore';
import api from '@/services/api';

interface TripHistory {
  id: string;
  rideId: string;
  status: string;
  pickup: string | null;
  dropoff: string | null;
  tier: string;
  fare: number | null;
  distance: number | null;
  duration: number | null;
  surgeMultiplier: number;
  rider: {
    id: string;
    name: string;
    rating: number;
  };
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
}

export default function HistoryPage() {
  const [filter, setFilter] = useState<'all' | 'COMPLETED' | 'CANCELLED'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [trips, setTrips] = useState<TripHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchTrips = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      setError(null);
      try {
        const data = await api.getDriverTrips(user.id, 50);
        setTrips(data);
      } catch (err) {
        console.error('Failed to fetch trips:', err);
        setError('Failed to load trip history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, [user?.id]);

  const filteredTrips = trips.filter((trip) => {
    if (filter !== 'all' && trip.status !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        (trip.pickup?.toLowerCase().includes(query) ?? false) ||
        (trip.dropoff?.toLowerCase().includes(query) ?? false) ||
        trip.rider.name.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const totalEarnings = filteredTrips
    .filter((t) => t.status === 'COMPLETED')
    .reduce((sum, t) => sum + (t.fare || 0), 0);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDistance = (meters: number | null) => {
    if (!meters) return '0 km';
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0 min';
    return `${Math.round(seconds / 60)} min`;
  };

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-2" />
          <p className="text-slate-500 dark:text-slate-400">Loading trip history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="text-center">
          <Car className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">{error}</p>
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Trip History
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {filteredTrips.length} trips • ₹{totalEarnings.toFixed(2)} earned
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {(['all', 'COMPLETED', 'CANCELLED'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  filter === f
                    ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                )}
              >
                {f === 'all' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Trips List */}
        <div className="space-y-3">
          {filteredTrips.length === 0 ? (
            <div className="text-center py-12">
              <Car className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">
                {trips.length === 0 ? 'No trips yet. Complete your first ride!' : 'No trips found'}
              </p>
            </div>
          ) : (
            filteredTrips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-700 p-4 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        trip.status === 'COMPLETED'
                          ? 'bg-emerald-100 dark:bg-emerald-900/30'
                          : 'bg-error-100 dark:bg-error-900/30'
                      )}>
                        <Car className={cn(
                          'w-5 h-5',
                          trip.status === 'COMPLETED' ? 'text-emerald-500' : 'text-error-500'
                        )} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800 dark:text-slate-100">
                            {trip.rider.name}
                          </span>
                          {trip.status !== 'COMPLETED' && (
                            <span className="px-2 py-0.5 bg-error-100 dark:bg-error-900/30 text-error-600 dark:text-error-400 text-xs font-medium rounded-full">
                              {trip.status}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(trip.createdAt)}</span>
                          <span>•</span>
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(trip.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    {trip.status === 'COMPLETED' && trip.fare && (
                      <div className="text-right">
                        <p className="font-semibold text-emerald-500">
                          ₹{trip.fare.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Route */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex flex-col items-center mt-1">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      <div className="w-0.5 h-6 bg-slate-200 dark:bg-slate-700" />
                      <div className="w-2 h-2 bg-primary-500 rounded-full" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {trip.pickup || 'Unknown pickup'}
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {trip.dropoff || 'Unknown dropoff'}
                      </p>
                    </div>
                  </div>

                  {/* Trip Stats */}
                  {trip.status === 'COMPLETED' && (
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {formatDistance(trip.distance)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDuration(trip.duration)}
                        </span>
                      </div>
                      {trip.rider.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {trip.rider.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
