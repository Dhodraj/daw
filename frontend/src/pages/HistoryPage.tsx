import { motion } from 'framer-motion';
import { Clock, Car, MapPin, Navigation, Receipt, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';

// Placeholder data - in a real app, this would come from an API
const mockRideHistory = [
  {
    id: '1',
    date: '2024-01-15',
    time: '09:30 AM',
    pickup: 'Home - 123 Main St',
    destination: 'Office - 456 Business Park',
    fare: 245,
    status: 'completed',
    tier: 'COMFORT',
    driver: 'Rajesh Kumar',
    rating: 4.8,
  },
  {
    id: '2',
    date: '2024-01-14',
    time: '06:15 PM',
    pickup: 'Office - 456 Business Park',
    destination: 'Home - 123 Main St',
    fare: 280,
    status: 'completed',
    tier: 'PREMIUM',
    driver: 'Amit Singh',
    rating: 5.0,
  },
  {
    id: '3',
    date: '2024-01-12',
    time: '02:00 PM',
    pickup: 'Mall - City Center',
    destination: 'Restaurant - Foodie Lane',
    fare: 120,
    status: 'cancelled',
    tier: 'ECONOMY',
    driver: null,
    rating: null,
  },
];

export default function HistoryPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-5 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Ride History
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            View your past rides and receipts
          </p>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <StatCard
            icon={<Car className="w-5 h-5" />}
            value="47"
            label="Total Rides"
          />
          <StatCard
            icon={<Receipt className="w-5 h-5" />}
            value="₹8,450"
            label="Total Spent"
          />
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            value="32h"
            label="Time Saved"
          />
          <StatCard
            icon={<MapPin className="w-5 h-5" />}
            value="580km"
            label="Distance"
          />
        </motion.div>

        {/* Ride List */}
        <div className="space-y-4">
          {mockRideHistory.map((ride, index) => (
            <motion.div
              key={ride.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
            >
              <RideHistoryCard ride={ride} />
            </motion.div>
          ))}
        </div>

        {/* Empty State (shown when no rides) */}
        {mockRideHistory.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
              No rides yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Your ride history will appear here once you complete your first trip
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <Card className="text-center">
      <CardContent className="p-4">
        <div className="text-primary-500 dark:text-primary-400 flex justify-center mb-2">
          {icon}
        </div>
        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          {value}
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
      </CardContent>
    </Card>
  );
}

function RideHistoryCard({ ride }: { ride: (typeof mockRideHistory)[0] }) {
  const isCompleted = ride.status === 'completed';

  return (
    <Card hoverable className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Left section - Date/Time */}
          <div className="flex md:flex-col items-center justify-between md:justify-center gap-2 p-4 md:w-32 bg-slate-50 dark:bg-slate-700 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 md:flex-col md:text-center">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {ride.date}
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{ride.time}</span>
          </div>

          {/* Middle section - Route */}
          <div className="flex-1 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-success-500 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-success-600 dark:text-success-400">
                  Pickup
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-200 truncate">
                  {ride.pickup}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-error-500 flex items-center justify-center flex-shrink-0">
                <Navigation className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-error-600 dark:text-error-400">
                  Drop-off
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-200 truncate">
                  {ride.destination}
                </p>
              </div>
            </div>

            {ride.driver && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Driver: {ride.driver}
                {ride.rating && ` (${ride.rating}★)`}
              </p>
            )}
          </div>

          {/* Right section - Fare & Status */}
          <div className="flex md:flex-col items-center justify-between md:justify-center gap-2 p-4 md:w-36 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700">
            <Badge
              variant={isCompleted ? 'success' : 'error'}
              size="sm"
            >
              {ride.status}
            </Badge>
            <div className="text-right md:text-center">
              <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
                ₹{ride.fare}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{ride.tier}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
