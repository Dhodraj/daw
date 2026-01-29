import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Phone,
  MessageSquare,
  Star,
  Car,
  Clock,
  Navigation,
  Shield,
  Share2,
} from 'lucide-react';

export default function RideStatusPage() {
  const { rideId } = useParams();

  // Mock driver data - in production would come from API
  const driver = {
    name: 'John Smith',
    rating: 4.9,
    trips: 1234,
    vehicle: 'Toyota Camry',
    plate: 'ABC 1234',
    color: 'Silver',
    photo: null,
    eta: 3,
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      {/* Map Section */}
      <div className="flex-1 lg:flex-[2] h-64 lg:h-full bg-slate-200 dark:bg-slate-800 relative">
        {/* Placeholder for map */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Navigation className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-500 dark:text-slate-400">Map view</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Driver en route to pickup
            </p>
          </div>
        </div>

        {/* ETA Overlay */}
        <div className="absolute top-4 left-4 right-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Driver arriving in</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {driver.eta} min
                </p>
              </div>
            </div>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <Share2 className="w-5 h-5 text-slate-500" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Status Panel */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:w-[400px] bg-white dark:bg-slate-800 lg:border-l border-slate-200 dark:border-slate-700 overflow-y-auto"
      >
        <div className="p-5 space-y-5">
          {/* Status Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Driver on the way
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Ride #{rideId?.slice(0, 8)}
              </p>
            </div>
            <div className="w-12 h-12 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center">
              <Car className="w-6 h-6 text-success-500" />
            </div>
          </div>

          {/* Driver Info Card */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-4">
              {/* Driver Photo */}
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {driver.name.charAt(0)}
              </div>

              {/* Driver Details */}
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                  {driver.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {driver.rating}
                    </span>
                  </div>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {driver.trips} trips
                  </span>
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="flex gap-2">
                <button className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-500 transition-colors">
                  <Phone className="w-5 h-5 text-primary-500" />
                </button>
                <button className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-500 transition-colors">
                  <MessageSquare className="w-5 h-5 text-primary-500" />
                </button>
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Vehicle</p>
                  <p className="font-medium text-slate-800 dark:text-slate-100">
                    {driver.color} {driver.vehicle}
                  </p>
                </div>
                <div className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg">
                  <p className="font-mono font-bold text-slate-800 dark:text-slate-100">
                    {driver.plate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Trip Details</h3>
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-success-500 rounded-full" />
                <div className="w-0.5 h-12 bg-slate-200 dark:bg-slate-700" />
                <div className="w-3 h-3 bg-error-500 rounded-full" />
              </div>
              <div className="flex-1 space-y-6">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Pickup</p>
                  <p className="font-medium text-slate-800 dark:text-slate-100">
                    123 Main Street
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Drop-off</p>
                  <p className="font-medium text-slate-800 dark:text-slate-100">
                    456 Oak Avenue
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Safety Features */}
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary-500" />
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-100">Safety features</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Share trip, Emergency help, PIN verification
                </p>
              </div>
            </div>
          </div>

          {/* Cancel Link */}
          <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
            <Link
              to="/rider/home"
              className="text-sm text-error-500 hover:text-error-600 font-medium"
            >
              Cancel Ride
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
