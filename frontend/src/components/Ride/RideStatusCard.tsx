import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Clock,
  Search,
  Car,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Route,
  Loader2,
  CircleDot,
} from 'lucide-react';
import useRideStore from '../../stores/rideStore';
import { RideStatus } from '../../types';
import { Button } from '@/components/atoms/Button';
import { Card, CardContent } from '@/components/atoms/Card';
import { DriverCard } from '@/components/molecules/DriverCard';
import { RouteDisplay } from '@/components/molecules/RouteDisplay';
import { FareDisplay } from '@/components/molecules/FareDisplay';
import { cn } from '@/utils/cn';

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
    gradient: 'from-success-500 to-success-600',
    textColor: 'text-success-700',
    bgColor: 'bg-success-50',
  },
  [RideStatus.IN_PROGRESS]: {
    title: 'Ride in Progress',
    description: 'Enjoy your journey to the destination',
    icon: Route,
    gradient: 'from-primary-500 to-purple-500',
    textColor: 'text-primary-700',
    bgColor: 'bg-primary-50',
  },
  [RideStatus.COMPLETED]: {
    title: 'Ride Completed',
    description: 'Thank you for riding with SwiftRide!',
    icon: CheckCircle2,
    gradient: 'from-success-500 to-teal-500',
    textColor: 'text-success-700',
    bgColor: 'bg-success-50',
  },
  [RideStatus.CANCELLED]: {
    title: 'Ride Cancelled',
    description: 'This ride has been cancelled',
    icon: XCircle,
    gradient: 'from-error-500 to-error-600',
    textColor: 'text-error-700',
    bgColor: 'bg-error-50',
  },
  [RideStatus.NO_DRIVERS]: {
    title: 'No Drivers Available',
    description: 'Sorry, all drivers are busy. Please try again.',
    icon: AlertTriangle,
    gradient: 'from-warning-500 to-warning-600',
    textColor: 'text-warning-700',
    bgColor: 'bg-warning-50',
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
    >
      <Card padding="none" className="overflow-hidden">
        {/* Status Header */}
        <div className={cn('bg-gradient-to-r px-5 py-4 relative overflow-hidden', config.gradient)}>
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
        <CardContent className="p-5 space-y-4">
          {/* Driver Info */}
          <AnimatePresence>
            {currentRide.driver && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <DriverCard
                  driver={{
                    name: currentRide.driver.name,
                    phone: currentRide.driver.phone,
                    vehicleNumber: currentRide.driver.vehicleNumber,
                    rating: currentRide.driver.rating,
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Route Info */}
          <RouteDisplay
            pickup={{
              latitude: currentRide.pickup.location.latitude,
              longitude: currentRide.pickup.location.longitude,
              address: currentRide.pickup.address,
            }}
            destination={{
              latitude: currentRide.destination.location.latitude,
              longitude: currentRide.destination.location.longitude,
              address: currentRide.destination.address,
            }}
          />

          {/* Fare Estimate */}
          <FareDisplay
            estimate={{
              min: currentRide.estimatedFare.min,
              max: currentRide.estimatedFare.max,
              currency: currentRide.estimatedFare.currency,
            }}
            tier={currentRide.tier}
          />

          {/* Trip Fare (if completed) */}
          <AnimatePresence>
            {currentRide.trip?.fare && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <FareDisplay
                  breakdown={{
                    baseFare: currentRide.trip.fare.baseFare,
                    distanceFare: currentRide.trip.fare.distanceFare,
                    timeFare: currentRide.trip.fare.timeFare,
                    surgeAmount: currentRide.trip.fare.surgeAmount,
                    taxes: currentRide.trip.fare.taxes,
                    total: currentRide.trip.fare.total,
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {canCancel && (
              <Button
                variant="danger"
                onClick={handleCancel}
                disabled={isLoading}
                fullWidth
                leftIcon={<XCircle className="w-5 h-5" />}
              >
                Cancel Ride
              </Button>
            )}
            {!isActive && (
              <Button
                variant="primary"
                onClick={clearRide}
                fullWidth
                leftIcon={<Car className="w-5 h-5" />}
              >
                Book New Ride
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
