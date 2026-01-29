import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Navigation,
  Phone,
  MessageSquare,
  MapPin,
  Clock,
  AlertTriangle,
  Flag,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useDriverStore } from '@/stores/driverStore';

export default function RideInProgressPage() {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const [tripDuration, setTripDuration] = useState(0);

  const { activeTrip, updateTripStatus } = useDriverStore();

  useEffect(() => {
    if (activeTrip) {
      updateTripStatus('in_progress');
    }
  }, [activeTrip, updateTripStatus]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTripDuration((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  // If no active trip, show empty state
  if (!activeTrip) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Navigation className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No active trip</p>
          <button
            onClick={() => navigate('/driver/status')}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-xl"
          >
            Go to Status
          </button>
        </div>
      </div>
    );
  }

  const handleEndTrip = () => {
    navigate(`/driver/ride/${rideId}/end-trip`);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Map Navigation View */}
      <div className="flex-1 bg-slate-800 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Navigation className="w-16 h-16 text-primary-400 mx-auto mb-4" />
            </motion.div>
            <p className="text-white text-lg font-medium">En route to destination</p>
            <p className="text-slate-400">{activeTrip.dropoff.address}</p>
          </div>
        </div>

        {/* Top Info Bar */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-slate-900/90 to-transparent p-4">
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{activeTrip.duration}</p>
                  <p className="text-sm text-slate-400">{activeTrip.distance} remaining</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Trip time</p>
                <p className="text-xl font-bold text-white">{formatTime(tripDuration)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Turn-by-turn */}
        <div className="absolute bottom-48 left-4 right-4">
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <Navigation className="w-5 h-5 text-white -rotate-45" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Following route to destination</p>
                <p className="text-sm text-slate-400">Continue on current path</p>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Button */}
        <div className="absolute bottom-52 right-4">
          <button className="p-3 bg-red-500/20 backdrop-blur-sm rounded-xl">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </button>
        </div>
      </div>

      {/* Bottom Panel */}
      <div className="bg-white dark:bg-slate-800 rounded-t-3xl shadow-2xl">
        <div className="p-5">
          {/* Trip Progress */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {activeTrip.rider.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-100">
                  {activeTrip.rider.name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  In vehicle
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={`tel:${activeTrip.rider.phone}`}
                className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl"
              >
                <Phone className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </a>
              <button className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <MessageSquare className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>

          {/* Destination */}
          <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-slate-500 dark:text-slate-400">Drop-off</p>
                <p className="font-medium text-slate-800 dark:text-slate-100">
                  {activeTrip.dropoff.address}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 dark:text-slate-400">Fare</p>
                <p className="font-bold text-slate-800 dark:text-slate-100">
                  ₹{activeTrip.fare.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Add Stop Button */}
          <button className="w-full mb-4 py-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-500 dark:text-slate-400 hover:border-primary-500 hover:text-primary-500 transition-colors text-sm">
            + Add a stop
          </button>

          {/* End Trip Button */}
          <button
            onClick={handleEndTrip}
            className={cn(
              'w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-semibold transition-all',
              'hover:from-primary-600 hover:to-primary-700 hover:shadow-lg hover:shadow-primary-500/30',
              'flex items-center justify-center gap-2'
            )}
          >
            <Flag className="w-5 h-5" />
            End Trip
          </button>
        </div>
      </div>
    </div>
  );
}
