import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Car, AlertCircle, X } from 'lucide-react';
import useRideStore from '../../stores/rideStore';
import { Button } from '@/components/atoms/Button';
import { Card, CardContent } from '@/components/atoms/Card';
import { LocationInput, RouteConnector } from '@/components/molecules/LocationInput';
import { TierSelector } from '@/components/molecules/TierSelector';
import { PaymentMethodSelector } from '@/components/molecules/PaymentMethodSelector';
import { cn } from '@/utils/cn';

interface RideRequestFormProps {
  riderId: string;
  onSelectPickup: () => void;
  onSelectDestination: () => void;
}

export default function RideRequestForm({
  riderId,
  onSelectPickup,
  onSelectDestination,
}: RideRequestFormProps) {
  const {
    pickupLocation,
    destinationLocation,
    selectedTier,
    paymentMethod,
    isLoading,
    error,
    setSelectedTier,
    setPaymentMethod,
    createRide,
    clearError,
  } = useRideStore();

  // Simple UUID format validation
  const isValidUUID = (id: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Double-check riderId is valid before submitting
    if (!isValidUUID(riderId)) {
      toast.error('User session not ready. Please wait a moment and try again.');
      return;
    }

    const loadingToast = toast.loading('Finding the best driver for you...');
    try {
      await createRide(riderId);
      toast.dismiss(loadingToast);
      toast.success('Ride requested! Looking for drivers nearby.');
    } catch {
      toast.dismiss(loadingToast);
      toast.error('Failed to request ride. Please try again.');
    }
  };

  const canSubmit = pickupLocation && destinationLocation && !isLoading && isValidUUID(riderId);

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-5 py-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Car className="w-6 h-6" />
          Book Your Ride
        </h2>
        <p className="text-primary-100 text-sm mt-1">Safe, reliable, affordable</p>
      </div>

      <CardContent className="p-5 space-y-5">
        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl p-4 relative"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-error-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-error-700 dark:text-error-300 font-medium text-sm">
                    Something went wrong
                  </p>
                  <p className="text-error-600 dark:text-error-400 text-sm mt-1">{error}</p>
                </div>
                <button
                  onClick={clearError}
                  className="p-1 hover:bg-error-100 dark:hover:bg-error-900/30 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-error-500" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Location Inputs */}
          <div className="space-y-3">
            <LocationInput
              type="pickup"
              location={pickupLocation}
              onSelect={onSelectPickup}
            />
            <RouteConnector />
            <LocationInput
              type="destination"
              location={destinationLocation}
              onSelect={onSelectDestination}
            />
          </div>

          {/* Ride Tier Selection */}
          <TierSelector
            value={selectedTier}
            onChange={setSelectedTier}
          />

          {/* Payment Method */}
          <PaymentMethodSelector
            value={paymentMethod}
            onChange={setPaymentMethod}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!canSubmit}
            isLoading={isLoading}
            size="lg"
            fullWidth
            className={cn(canSubmit && 'shadow-lg shadow-primary-500/25')}
            leftIcon={<Car className="w-5 h-5" />}
          >
            {isLoading ? 'Finding Driver...' : 'Request Ride'}
          </Button>

          {/* Helper Text */}
          {!canSubmit && !isLoading && (
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              {!isValidUUID(riderId)
                ? 'Loading user session...'
                : !pickupLocation && !destinationLocation
                  ? 'Select pickup and destination to continue'
                  : !pickupLocation
                    ? 'Select a pickup location'
                    : 'Select a destination'}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
