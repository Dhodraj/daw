import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Clock,
  Navigation,
  X,
  Check,
  Star,
  Zap,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useDriverStore } from '@/stores/driverStore';
import { useAuthStore } from '@/stores/authStore';
import api from '@/services/api';

export default function RequestsPage() {
  const navigate = useNavigate();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const user = useAuthStore((state) => state.user);
  const { currentRequest, setCurrentRequest, acceptRequest } = useDriverStore();

  const [timeLeft, setTimeLeft] = useState(currentRequest?.expiresAt
    ? Math.max(0, Math.floor((currentRequest.expiresAt - Date.now()) / 1000))
    : 15
  );

  // Update timeLeft when currentRequest changes
  useEffect(() => {
    if (currentRequest?.expiresAt) {
      setTimeLeft(Math.max(0, Math.floor((currentRequest.expiresAt - Date.now()) / 1000)));
    }
  }, [currentRequest]);

  // Countdown timer
  useEffect(() => {
    if (!currentRequest) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setCurrentRequest(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentRequest, setCurrentRequest]);

  const handleAccept = async () => {
    if (!currentRequest || !user?.id || isAccepting) return;

    setIsAccepting(true);
    try {
      await api.acceptRideOffer(currentRequest.id, user.id);
      acceptRequest();
      navigate(`/driver/ride/${currentRequest.id}/navigate`);
    } catch (error) {
      console.error('Failed to accept ride:', error);
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!currentRequest || !user?.id || isDeclining) return;

    setIsDeclining(true);
    try {
      await api.declineRideOffer(currentRequest.id, user.id);
      setCurrentRequest(null);
    } catch (error) {
      console.error('Failed to decline ride:', error);
    } finally {
      setIsDeclining(false);
    }
  };

  if (!currentRequest) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Navigation className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            No Requests
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm">
            Stay online to receive ride requests. Make sure you're in a busy area for more opportunities.
          </p>
        </motion.div>
      </div>
    );
  }

  const maxTime = 15; // Default timeout in seconds

  return (
    <div className="min-h-full flex flex-col">
      {/* Map Area */}
      <div className="flex-1 bg-slate-200 dark:bg-slate-800 relative min-h-[200px]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <p className="text-slate-500 dark:text-slate-400">Pickup location</p>
          </div>
        </div>

        {/* Timer Overlay */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-800 rounded-full px-6 py-3 shadow-xl flex items-center gap-3"
          >
            <Clock className="w-5 h-5 text-warning-500" />
            <span className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {timeLeft}s
            </span>
            {/* Progress ring */}
            <svg className="w-8 h-8 -rotate-90">
              <circle
                cx="16"
                cy="16"
                r="14"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                className="text-slate-200 dark:text-slate-700"
              />
              <circle
                cx="16"
                cy="16"
                r="14"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeDasharray={88}
                strokeDashoffset={88 - (88 * timeLeft) / maxTime}
                className="text-warning-500 transition-all duration-1000"
              />
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Request Card */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white dark:bg-slate-800 rounded-t-3xl shadow-2xl -mt-6 relative z-10"
      >
        <div className="p-5">
          {/* Fare & Surge */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                  ₹{currentRequest.fare.toFixed(2)}
                </span>
                {currentRequest.surgeMultiplier > 1 && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-sm font-medium">
                    <Zap className="w-4 h-4" />
                    {currentRequest.surgeMultiplier}x
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {currentRequest.pickup.distance} away • {currentRequest.eta} min pickup
              </p>
            </div>
          </div>

          {/* Rider Info */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center text-white font-bold">
              {currentRequest.riderName.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-800 dark:text-slate-100">
                {currentRequest.riderName}
              </p>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span>{currentRequest.riderRating.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Route */}
          <div className="flex items-start gap-3 mb-6">
            <div className="flex flex-col items-center pt-1">
              <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              <div className="w-0.5 h-10 bg-slate-200 dark:bg-slate-700" />
              <div className="w-3 h-3 bg-primary-500 rounded-full" />
            </div>
            <div className="flex-1 space-y-6">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">
                  Pickup
                </p>
                <p className="font-medium text-slate-800 dark:text-slate-100">
                  {currentRequest.pickup.address}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">
                  Drop-off
                </p>
                <p className="font-medium text-slate-800 dark:text-slate-100">
                  {currentRequest.dropoff.address}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleDecline}
              disabled={isDeclining}
              className={cn(
                'flex-1 py-4 px-6 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2',
                isDeclining && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isDeclining ? (
                <div className="w-5 h-5 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
              ) : (
                <>
                  <X className="w-5 h-5" />
                  Decline
                </>
              )}
            </button>
            <button
              onClick={handleAccept}
              disabled={isAccepting}
              className={cn(
                'flex-[2] py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-medium transition-all flex items-center justify-center gap-2',
                'hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg hover:shadow-emerald-500/30',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isAccepting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Accept
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
