import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Phone,
  MessageSquare,
  Navigation,
  Shield,
  Share2,
  AlertTriangle,
  Music,
  Thermometer,
  Volume2,
} from 'lucide-react';

export default function RideInProgressPage() {
  const { rideId } = useParams(); // Will be used for API calls
  void rideId; // Placeholder for future API integration
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  // Mock data
  const ride = {
    driver: 'John Smith',
    eta: 12,
    distance: '3.2 km',
    destination: '456 Oak Avenue',
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      {/* Map Section */}
      <div className="flex-1 lg:flex-[2] h-64 lg:h-full bg-slate-200 dark:bg-slate-800 relative">
        {/* Map placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Navigation className="w-12 h-12 text-primary-500 mx-auto mb-2" />
            </motion.div>
            <p className="text-slate-500 dark:text-slate-400">En route to destination</p>
          </div>
        </div>

        {/* Trip Progress Overlay */}
        <div className="absolute top-4 left-4 right-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Arriving in</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {ride.eta} min
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 dark:text-slate-400">Distance left</p>
                <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  {ride.distance}
                </p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '35%' }}
                transition={{ duration: 1 }}
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
              />
            </div>
          </motion.div>
        </div>

        {/* Emergency Button */}
        <div className="absolute bottom-4 left-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-error-500 text-white rounded-xl shadow-lg hover:bg-error-600 transition-colors">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Emergency</span>
          </button>
        </div>

        {/* Share Trip */}
        <div className="absolute bottom-4 right-4">
          <button className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Share2 className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>

      {/* Info Panel */}
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
                Trip in Progress
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Trip time: {formatTime(elapsedTime)}
              </p>
            </div>
            <div className="px-3 py-1.5 bg-success-100 dark:bg-success-900/30 rounded-full">
              <span className="text-sm font-medium text-success-600 dark:text-success-400">
                Active
              </span>
            </div>
          </div>

          {/* Destination Card */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-white/70">Heading to</p>
                <p className="font-semibold">{ride.destination}</p>
              </div>
            </div>
          </div>

          {/* Driver Card */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center text-white font-bold">
                  {ride.driver.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">{ride.driver}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Your driver</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <Phone className="w-5 h-5 text-primary-500" />
                </button>
                <button className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <MessageSquare className="w-5 h-5 text-primary-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
              Trip Controls
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <button className="flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Music className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <span className="text-xs text-slate-600 dark:text-slate-400">Music</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Thermometer className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <span className="text-xs text-slate-600 dark:text-slate-400">AC</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Volume2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <span className="text-xs text-slate-600 dark:text-slate-400">Quiet</span>
              </button>
            </div>
          </div>

          {/* Safety Card */}
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-100">
                  You're protected
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Trip is being monitored. Tap Emergency if you need immediate assistance.
                </p>
              </div>
            </div>
          </div>

          {/* Add Stop */}
          <button className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-500 dark:text-slate-400 hover:border-primary-500 hover:text-primary-500 transition-colors">
            + Add a stop
          </button>
        </div>
      </motion.div>
    </div>
  );
}
