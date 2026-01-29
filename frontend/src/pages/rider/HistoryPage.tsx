import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock,
  Car,
  ChevronRight,
  Calendar,
  Search,
  Download,
  Star,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface RideHistory {
  id: string;
  date: string;
  time: string;
  pickup: string;
  dropoff: string;
  fare: number;
  status: 'completed' | 'cancelled';
  driver: string;
  rating?: number;
  vehicleType: string;
}

const mockRides: RideHistory[] = [
  {
    id: '1',
    date: 'Today',
    time: '3:45 PM',
    pickup: '123 Main Street',
    dropoff: '456 Oak Avenue',
    fare: 24.50,
    status: 'completed',
    driver: 'John Smith',
    rating: 5,
    vehicleType: 'Comfort',
  },
  {
    id: '2',
    date: 'Yesterday',
    time: '9:15 AM',
    pickup: '789 Pine Road',
    dropoff: 'Airport Terminal 2',
    fare: 45.00,
    status: 'completed',
    driver: 'Sarah Johnson',
    rating: 4,
    vehicleType: 'Premium',
  },
  {
    id: '3',
    date: 'Jan 25',
    time: '6:30 PM',
    pickup: 'Downtown Mall',
    dropoff: '321 Elm Street',
    fare: 18.75,
    status: 'cancelled',
    driver: 'Mike Davis',
    vehicleType: 'Economy',
  },
  {
    id: '4',
    date: 'Jan 24',
    time: '11:00 AM',
    pickup: 'Central Station',
    dropoff: 'Tech Park Building A',
    fare: 32.00,
    status: 'completed',
    driver: 'Emily Brown',
    rating: 5,
    vehicleType: 'Comfort',
  },
  {
    id: '5',
    date: 'Jan 22',
    time: '8:00 PM',
    pickup: 'Restaurant Row',
    dropoff: 'Home',
    fare: 15.50,
    status: 'completed',
    driver: 'Chris Wilson',
    rating: 5,
    vehicleType: 'Economy',
  },
];

export default function HistoryPage() {
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRides = mockRides.filter((ride) => {
    if (filter !== 'all' && ride.status !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        ride.pickup.toLowerCase().includes(query) ||
        ride.dropoff.toLowerCase().includes(query) ||
        ride.driver.toLowerCase().includes(query)
      );
    }
    return true;
  });

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
              Ride History
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {mockRides.length} rides this month
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary-500 transition-colors">
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Export</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by location or driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {(['all', 'completed', 'cancelled'] as const).map((f) => (
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
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Rides List */}
        <div className="space-y-3">
          {filteredRides.length === 0 ? (
            <div className="text-center py-12">
              <Car className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">No rides found</p>
            </div>
          ) : (
            filteredRides.map((ride, index) => (
              <motion.div
                key={ride.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/rider/ride/${ride.id}/completed`}
                  className="block bg-white dark:bg-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-700 p-4 hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        ride.status === 'completed'
                          ? 'bg-success-100 dark:bg-success-900/30'
                          : 'bg-error-100 dark:bg-error-900/30'
                      )}>
                        <Car className={cn(
                          'w-5 h-5',
                          ride.status === 'completed' ? 'text-success-500' : 'text-error-500'
                        )} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800 dark:text-slate-100">
                            {ride.vehicleType}
                          </span>
                          {ride.status === 'cancelled' && (
                            <span className="px-2 py-0.5 bg-error-100 dark:bg-error-900/30 text-error-600 dark:text-error-400 text-xs font-medium rounded-full">
                              Cancelled
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <Calendar className="w-4 h-4" />
                          <span>{ride.date}</span>
                          <span>•</span>
                          <Clock className="w-4 h-4" />
                          <span>{ride.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-800 dark:text-slate-100">
                        ${ride.fare.toFixed(2)}
                      </p>
                      {ride.rating && (
                        <div className="flex items-center gap-1 justify-end mt-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {ride.rating}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Route */}
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center mt-1">
                      <div className="w-2 h-2 bg-success-500 rounded-full" />
                      <div className="w-0.5 h-6 bg-slate-200 dark:bg-slate-700" />
                      <div className="w-2 h-2 bg-error-500 rounded-full" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {ride.pickup}
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {ride.dropoff}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 mt-3" />
                  </div>

                  {/* Driver */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Driver: <span className="text-slate-700 dark:text-slate-300">{ride.driver}</span>
                    </p>
                    <span className="text-sm text-primary-500">View details</span>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>

        {/* Load More */}
        {filteredRides.length > 0 && (
          <div className="text-center mt-6">
            <button className="px-6 py-2 text-primary-500 hover:text-primary-600 font-medium">
              Load more rides
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
