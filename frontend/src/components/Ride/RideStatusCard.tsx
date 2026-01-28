import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Clock,
  Search,
  Car,
  MapPin,
  Navigation,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Phone,
  Star,
  Route,
  Receipt,
  Loader2,
  CircleDot,
  Sparkles
} from 'lucide-react';
import useRideStore from '../../stores/rideStore';
import { RideStatus } from '../../types';

interface StatusConfigItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  textColor: string;
  bgColor: string;
  animate?: boolean;
}

const statusConfig: Record<RideStatus, StatusConfigItem> = {
  [RideStatus.PENDING]: {
    title: 'Processing Request',
    description: 'Your ride request is being processed',
    icon: Clock,
    gradient: 'from-slate-500 to-slate-600',
    textColor: 'text-slate-700',
    bgColor: 'bg-slate-50',
  },
  [RideStatus.SEARCHING]: {
    title: 'Finding Your Driver',
    description: 'Searching for available drivers nearby...',
    icon: Search,
    gradient: 'from-amber-500 to-orange-500',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
    animate: true,
  },
  [RideStatus.DRIVER_ASSIGNED]: {
    title: 'Driver En Route',
    description: 'Your driver is heading to pick you up',
    icon: Car,
    gradient: 'from-blue-500 to-blue-600',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
  },
  [RideStatus.DRIVER_ARRIVED]: {
    title: 'Driver Has Arrived',
    description: 'Your driver is waiting at the pickup location',
    icon: MapPin,
    gradient: 'from-emerald-500 to-emerald-600',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
  },
  [RideStatus.IN_PROGRESS]: {
    title: 'Ride in Progress',
    description: 'Enjoy your journey to the destination',
    icon: Route,
    gradient: 'from-indigo-500 to-purple-500',
    textColor: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
  },
  [RideStatus.COMPLETED]: {
    title: 'Ride Completed',
    description: 'Thank you for riding with SwiftRide!',
    icon: CheckCircle2,
    gradient: 'from-emerald-500 to-teal-500',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
  },
  [RideStatus.CANCELLED]: {
    title: 'Ride Cancelled',
    description: 'This ride has been cancelled',
    icon: XCircle,
    gradient: 'from-rose-500 to-rose-600',
    textColor: 'text-rose-700',
    bgColor: 'bg-rose-50',
  },
  [RideStatus.NO_DRIVERS]: {
    title: 'No Drivers Available',
    description: 'Sorry, all drivers are busy. Please try again.',
    icon: AlertTriangle,
    gradient: 'from-orange-500 to-orange-600',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
  },
};

export default function RideStatusCard() {
  const { currentRide, isLoading, cancelRide, clearRide } = useRideStore();

  if (!currentRide) return null;

  const config = statusConfig[currentRide.status] || statusConfig[RideStatus.PENDING];
  const StatusIcon = config.icon;

  const cancelableStatuses: RideStatus[] = [
    RideStatus.PENDING,
    RideStatus.SEARCHING,
    RideStatus.DRIVER_ASSIGNED,
    RideStatus.DRIVER_ARRIVED,
  ];
  const canCancel = cancelableStatuses.includes(currentRide.status);

  const terminalStatuses: RideStatus[] = [
    RideStatus.COMPLETED,
    RideStatus.CANCELLED,
    RideStatus.NO_DRIVERS,
  ];
  const isActive = !terminalStatuses.includes(currentRide.status);

  const handleCancel = async () => {
    const loadingToast = toast.loading('Cancelling ride...');
    try {
      await cancelRide('User requested cancellation');
      toast.dismiss(loadingToast);
      toast.success('Ride cancelled successfully');
    } catch {
      toast.dismiss(loadingToast);
      toast.error('Failed to cancel ride');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card rounded-2xl overflow-hidden"
    >
      {/* Status Header */}
      <div className={`bg-gradient-to-r ${config.gradient} px-5 py-4 relative overflow-hidden`}>
        {/* Animated background pattern */}
        {config.animate && (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 animate-pulse bg-white/10" />
          </div>
        )}

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              {config.animate ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <StatusIcon className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{config.title}</h3>
              <p className="text-white/80 text-sm">{config.description}</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="hidden sm:flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full">
            <CircleDot className="w-3 h-3 text-white animate-pulse" />
            <span className="text-xs font-medium text-white">LIVE</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Driver Info */}
        <AnimatePresence>
          {currentRide.driver && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4"
            >
              <div className="flex items-center gap-4">
                {/* Driver Avatar */}
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {currentRide.driver.name.charAt(0)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                </div>

                {/* Driver Details */}
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{currentRide.driver.name}</p>
                  <p className="text-sm text-slate-500">{currentRide.driver.vehicleNumber}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">{currentRide.driver.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-slate-300">|</span>
                    <div className="flex items-center gap-1 text-slate-500">
                      <Sparkles className="w-3 h-3" />
                      <span className="text-xs">Top Driver</span>
                    </div>
                  </div>
                </div>

                {/* Call Button */}
                <motion.a
                  href={`tel:${currentRide.driver.phone}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-emerald-600 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                </motion.a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Route Info */}
        <div className="space-y-3">
          <RoutePoint
            type="pickup"
            address={currentRide.pickup.address || `${currentRide.pickup.location.latitude.toFixed(4)}, ${currentRide.pickup.location.longitude.toFixed(4)}`}
          />
          <div className="flex items-center gap-3 pl-4">
            <div className="flex flex-col items-center gap-1">
              <div className="w-0.5 h-2 bg-slate-300" />
              <div className="w-0.5 h-2 bg-slate-300" />
            </div>
            <div className="flex-1 border-t border-dashed border-slate-200" />
          </div>
          <RoutePoint
            type="destination"
            address={currentRide.destination.address || `${currentRide.destination.location.latitude.toFixed(4)}, ${currentRide.destination.location.longitude.toFixed(4)}`}
          />
        </div>

        {/* Fare Estimate */}
        <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-medium">Estimated Fare</p>
              <p className="font-bold text-lg text-slate-800">
                {currentRide.estimatedFare.currency === 'INR' ? '₹' : currentRide.estimatedFare.currency}
                {currentRide.estimatedFare.min} - {currentRide.estimatedFare.max}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase font-medium">Ride Type</p>
            <span className="badge badge-primary">{currentRide.tier}</span>
          </div>
        </div>

        {/* Trip Fare (if completed) */}
        <AnimatePresence>
          {currentRide.trip?.fare && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <Receipt className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-semibold text-slate-800">Trip Receipt</h4>
                </div>

                <div className="space-y-2">
                  <FareRow label="Base Fare" value={currentRide.trip.fare.baseFare} />
                  <FareRow label="Distance Charge" value={currentRide.trip.fare.distanceFare} />
                  <FareRow label="Time Charge" value={currentRide.trip.fare.timeFare} />
                  {currentRide.trip.fare.surgeAmount > 0 && (
                    <FareRow label="Surge Pricing" value={currentRide.trip.fare.surgeAmount} highlight />
                  )}
                  <FareRow label="Taxes & Fees" value={currentRide.trip.fare.taxes} />
                  <div className="border-t border-emerald-200 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">Total Amount</span>
                      <span className="font-bold text-xl text-emerald-600">
                        ₹{currentRide.trip.fare.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {canCancel && (
            <motion.button
              onClick={handleCancel}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 px-4 border-2 border-rose-500 text-rose-500 rounded-xl font-semibold hover:bg-rose-50 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              <span>Cancel Ride</span>
            </motion.button>
          )}
          {!isActive && (
            <motion.button
              onClick={clearRide}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 px-4 btn-primary rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <Car className="w-5 h-5" />
              <span>Book New Ride</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Route Point Component
function RoutePoint({ type, address }: { type: 'pickup' | 'destination'; address: string }) {
  const isPickup = type === 'pickup';
  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
        isPickup ? 'bg-emerald-500' : 'bg-rose-500'
      }`}>
        {isPickup ? (
          <CircleDot className="w-5 h-5 text-white" />
        ) : (
          <Navigation className="w-5 h-5 text-white" />
        )}
      </div>
      <div className="flex-1">
        <p className={`text-xs font-semibold uppercase tracking-wide ${
          isPickup ? 'text-emerald-600' : 'text-rose-600'
        }`}>
          {isPickup ? 'Pickup Point' : 'Drop-off Point'}
        </p>
        <p className="text-sm text-slate-700 truncate">{address}</p>
      </div>
    </div>
  );
}

// Fare Row Component
function FareRow({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className={highlight ? 'text-amber-600' : 'text-slate-600'}>{label}</span>
      <span className={highlight ? 'text-amber-600 font-medium' : 'text-slate-700'}>
        ₹{value.toFixed(2)}
      </span>
    </div>
  );
}
