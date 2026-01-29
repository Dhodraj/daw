import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Check,
  Clock,
  MapPin,
  Star,
  AlertCircle,
  ChevronRight,
  Navigation,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useDriverStore } from '@/stores/driverStore';
import api from '@/services/api';

export default function EndTripPage() {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const [riderRating, setRiderRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { activeTrip, endTrip } = useDriverStore();

  // If no active trip, show empty state
  if (!activeTrip && !submitted) {
    return (
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="text-center">
          <Navigation className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No active trip</p>
          <button
            onClick={() => navigate('/driver/status')}
            className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-xl"
          >
            Go to Status
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // If we have active trip data, end it via API
      if (activeTrip && rideId) {
        await api.endTrip(rideId, {
          latitude: activeTrip.dropoff.latitude,
          longitude: activeTrip.dropoff.longitude,
        });
      }

      // Update local store
      endTrip();
      setSubmitted(true);

      setTimeout(() => {
        navigate('/driver/status');
      }, 2000);
    } catch (error) {
      console.error('Failed to end trip:', error);
      // Still end trip locally even if API fails
      endTrip();
      setSubmitted(true);
      setTimeout(() => {
        navigate('/driver/status');
      }, 2000);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-full flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-success-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Trip Complete!
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Returning to home screen...
          </p>
        </motion.div>
      </div>
    );
  }

  // Use activeTrip data if available
  const trip = activeTrip
    ? {
        fare: activeTrip.fare,
        total: activeTrip.fare,
        distance: activeTrip.distance,
        duration: activeTrip.duration,
        pickup: activeTrip.pickup.address,
        dropoff: activeTrip.dropoff.address,
        rider: activeTrip.rider.name,
      }
    : {
        fare: 0,
        total: 0,
        distance: '0 km',
        duration: '0 min',
        pickup: 'Unknown',
        dropoff: 'Unknown',
        rider: 'Rider',
      };

  return (
    <div className="min-h-full flex flex-col items-center py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Trip Completed
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Great job! Here's your earnings summary
          </p>
        </div>

        {/* Earnings Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700 p-6 mb-6">
          <div className="text-center mb-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">You Earned</p>
            <p className="text-4xl font-bold text-emerald-500">
              ₹{trip.total.toFixed(2)}
            </p>
          </div>

          {/* Breakdown */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Trip fare</span>
              <span className="text-slate-800 dark:text-slate-100">₹{trip.fare.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Trip Summary */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700 p-6 mb-6">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">
            Trip Summary
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Distance</p>
                <p className="font-medium text-slate-800 dark:text-slate-100">{trip.distance}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Duration</p>
                <p className="font-medium text-slate-800 dark:text-slate-100">{trip.duration}</p>
              </div>
            </div>
          </div>

          {/* Route */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center pt-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <div className="w-0.5 h-8 bg-slate-200 dark:bg-slate-700" />
              <div className="w-2 h-2 bg-primary-500 rounded-full" />
            </div>
            <div className="flex-1 space-y-4">
              <p className="text-sm text-slate-700 dark:text-slate-300">{trip.pickup}</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">{trip.dropoff}</p>
            </div>
          </div>
        </div>

        {/* Rate Rider */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700 p-6 mb-6">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-center mb-4">
            Rate {trip.rider}
          </h3>

          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRiderRating(star)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    'w-10 h-10 transition-colors',
                    riderRating >= star
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-slate-300 dark:text-slate-600'
                  )}
                />
              </button>
            ))}
          </div>

          {/* Quick Feedback */}
          {riderRating > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <div className="flex flex-wrap gap-2 justify-center">
                {['Friendly', 'On time', 'Good directions', 'Respectful', 'Tidy'].map((tag) => (
                  <button
                    key={tag}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-sm text-slate-600 dark:text-slate-400 hover:bg-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Report Issue */}
        <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-slate-400" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Report an issue</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>

        {/* Done Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={cn(
            'w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-semibold transition-all',
            'hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg hover:shadow-emerald-500/30',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isSubmitting ? 'Completing...' : 'Done'}
        </button>
      </motion.div>
    </div>
  );
}
