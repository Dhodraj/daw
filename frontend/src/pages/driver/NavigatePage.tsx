import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Navigation,
  Phone,
  MessageSquare,
  MapPin,
  Clock,
  X,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useDriverStore } from '@/stores/driverStore';

export default function NavigatePage() {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const { activeTrip, updateTripStatus } = useDriverStore();

  // If no active trip, redirect to status
  if (!activeTrip) {
    return (
      <div className="h-full flex items-center justify-center">
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

  const handleArrived = () => {
    updateTripStatus('arrived_at_pickup');
    navigate(`/driver/ride/${rideId}/in-progress`);
  };

  const handleCancel = () => {
    navigate('/driver/requests');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Map Navigation View */}
      <div className="flex-1 bg-slate-800 relative">
        {/* Navigation UI placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Navigation className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            </motion.div>
            <p className="text-white text-lg font-medium">Navigating to pickup</p>
            <p className="text-slate-400">{activeTrip.pickup.address}</p>
          </div>
        </div>

        {/* Top Info Bar */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-slate-900/90 to-transparent p-4">
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {activeTrip.status === 'navigating_to_pickup' ? 'En route' : 'Arriving'}
                </p>
                <p className="text-sm text-slate-400">{activeTrip.distance} to pickup</p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Turn-by-turn placeholder */}
        <div className="absolute bottom-48 left-4 right-4">
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Navigation className="w-5 h-5 text-white rotate-45" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Following route to pickup</p>
                <p className="text-sm text-slate-400">Continue on current path</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel */}
      <motion.div
        animate={{ height: isExpanded ? 280 : 180 }}
        className="bg-white dark:bg-slate-800 rounded-t-3xl shadow-2xl"
      >
        {/* Drag Handle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex justify-center py-2"
        >
          <div className="w-10 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
        </button>

        <div className="px-5 pb-5">
          {/* Rider Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center text-white font-bold">
                {activeTrip.rider.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  {activeTrip.rider.name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Waiting at pickup
                </p>
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="flex gap-2">
              <a
                href={`tel:${activeTrip.rider.phone}`}
                className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
              >
                <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </a>
              <button className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <MessageSquare className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>

          {/* Pickup Address */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Pickup location</p>
                  <p className="font-medium text-slate-800 dark:text-slate-100">
                    {activeTrip.pickup.address}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Arrived Button */}
          <button
            onClick={handleArrived}
            className={cn(
              'w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-semibold transition-all',
              'hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg hover:shadow-emerald-500/30',
              'flex items-center justify-center gap-2'
            )}
          >
            <CheckCircle className="w-5 h-5" />
            I've Arrived
          </button>
        </div>
      </motion.div>
    </div>
  );
}
