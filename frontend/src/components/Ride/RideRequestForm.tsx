import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  MapPin,
  Navigation,
  Car,
  Sparkles,
  Crown,
  Users,
  ChevronDown,
  ChevronUp,
  Wallet,
  CreditCard,
  Banknote,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';
import useRideStore from '../../stores/rideStore';
import { RideTier, PaymentMethod } from '../../types';

interface RideRequestFormProps {
  riderId: string;
  onSelectPickup: () => void;
  onSelectDestination: () => void;
}

const tierOptions = [
  {
    value: RideTier.ECONOMY,
    label: 'Economy',
    description: 'Affordable everyday rides',
    basePrice: '₹50',
    icon: Car,
    gradient: 'from-slate-500 to-slate-600'
  },
  {
    value: RideTier.COMFORT,
    label: 'Comfort',
    description: 'Spacious sedans with AC',
    basePrice: '₹80',
    icon: Sparkles,
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    value: RideTier.PREMIUM,
    label: 'Premium',
    description: 'Luxury cars, top-rated drivers',
    basePrice: '₹120',
    icon: Crown,
    gradient: 'from-amber-500 to-amber-600'
  },
  {
    value: RideTier.XL,
    label: 'XL',
    description: 'Perfect for groups of 4-6',
    basePrice: '₹100',
    icon: Users,
    gradient: 'from-purple-500 to-purple-600'
  },
];

const paymentOptions = [
  { value: PaymentMethod.CASH, label: 'Cash', icon: Banknote },
  { value: PaymentMethod.CARD, label: 'Card', icon: CreditCard },
  { value: PaymentMethod.WALLET, label: 'Wallet', icon: Wallet },
];

export default function RideRequestForm({ riderId, onSelectPickup, onSelectDestination }: RideRequestFormProps) {
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

  const [showTiers, setShowTiers] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const canSubmit = pickupLocation && destinationLocation && !isLoading;
  const selectedTierData = tierOptions.find((t) => t.value === selectedTier);

  return (
    <div className="card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-5 py-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Car className="w-6 h-6" />
          Book Your Ride
        </h2>
        <p className="text-primary-100 text-sm mt-1">Safe, reliable, affordable</p>
      </div>

      <div className="p-5 space-y-5">
        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="bg-rose-50 border border-rose-200 rounded-xl p-4 relative"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-rose-700 font-medium text-sm">Something went wrong</p>
                  <p className="text-rose-600 text-sm mt-1">{error}</p>
                </div>
                <button
                  onClick={clearError}
                  className="p-1 hover:bg-rose-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-rose-500" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Location Inputs */}
          <div className="space-y-3">
            {/* Pickup Location */}
            <LocationButton
              type="pickup"
              location={pickupLocation}
              onClick={onSelectPickup}
              isSet={!!pickupLocation}
            />

            {/* Route Line Connector */}
            <div className="flex items-center gap-3 px-4">
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-0.5 h-2 bg-slate-300" />
                <div className="w-0.5 h-2 bg-slate-300" />
                <div className="w-0.5 h-2 bg-slate-300" />
              </div>
              <div className="flex-1 border-t border-dashed border-slate-300" />
            </div>

            {/* Destination Location */}
            <LocationButton
              type="destination"
              location={destinationLocation}
              onClick={onSelectDestination}
              isSet={!!destinationLocation}
            />
          </div>

          {/* Ride Tier Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Choose Your Ride
            </label>
            <button
              type="button"
              onClick={() => setShowTiers(!showTiers)}
              className={`w-full px-4 py-3 border-2 rounded-xl text-left transition-all duration-200 ${
                showTiers ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedTierData && (
                    <div className={`w-10 h-10 bg-gradient-to-br ${selectedTierData.gradient} rounded-xl flex items-center justify-center`}>
                      <selectedTierData.icon className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div>
                    <span className="font-semibold text-slate-800">{selectedTierData?.label}</span>
                    <p className="text-sm text-slate-500">{selectedTierData?.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary-600 font-bold">{selectedTierData?.basePrice}+</span>
                  {showTiers ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>
            </button>

            {/* Tier Options Dropdown */}
            <AnimatePresence>
              {showTiers && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="border-2 border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                    {tierOptions.map((tier) => (
                      <button
                        key={tier.value}
                        type="button"
                        onClick={() => {
                          setSelectedTier(tier.value);
                          setShowTiers(false);
                        }}
                        className={`w-full px-4 py-3 text-left transition-all duration-200 hover:bg-slate-50 ${
                          selectedTier === tier.value ? 'bg-primary-50' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 bg-gradient-to-br ${tier.gradient} rounded-xl flex items-center justify-center`}>
                              <tier.icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <span className="font-semibold text-slate-800">{tier.label}</span>
                              <p className="text-sm text-slate-500">{tier.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-600 font-bold">{tier.basePrice}+</span>
                            {selectedTier === tier.value && (
                              <CheckCircle2 className="w-5 h-5 text-primary-500" />
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {paymentOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPaymentMethod(option.value)}
                  className={`flex flex-col items-center gap-2 px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                    paymentMethod === option.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <option.icon className={`w-5 h-5 ${paymentMethod === option.value ? 'text-primary-500' : 'text-slate-400'}`} />
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={!canSubmit}
            whileHover={canSubmit ? { scale: 1.02 } : {}}
            whileTap={canSubmit ? { scale: 0.98 } : {}}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
              canSubmit
                ? 'btn-primary shadow-lg shadow-primary-500/25'
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Finding Driver...</span>
              </>
            ) : (
              <>
                <Car className="w-5 h-5" />
                <span>Request Ride</span>
              </>
            )}
          </motion.button>

          {/* Helper Text */}
          {!canSubmit && !isLoading && (
            <p className="text-center text-sm text-slate-500">
              {!pickupLocation && !destinationLocation
                ? 'Select pickup and destination to continue'
                : !pickupLocation
                ? 'Select a pickup location'
                : 'Select a destination'}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

// Location Button Component
function LocationButton({
  type,
  location,
  onClick,
  isSet,
}: {
  type: 'pickup' | 'destination';
  location: { latitude: number; longitude: number; address?: string } | null;
  onClick: () => void;
  isSet: boolean;
}) {
  const isPickup = type === 'pickup';
  const colorClasses = isPickup
    ? { bg: 'bg-emerald-500', ring: 'ring-emerald-500', text: 'text-emerald-700', border: 'border-emerald-500', bgLight: 'bg-emerald-50' }
    : { bg: 'bg-rose-500', ring: 'ring-rose-500', text: 'text-rose-700', border: 'border-rose-500', bgLight: 'bg-rose-50' };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-2 rounded-xl transition-all duration-200 group ${
        isSet
          ? `${colorClasses.border} ${colorClasses.bgLight}`
          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
          isSet ? colorClasses.bg : 'bg-slate-100 group-hover:bg-slate-200'
        }`}>
          {isPickup ? (
            <MapPin className={`w-5 h-5 ${isSet ? 'text-white' : 'text-slate-400'}`} />
          ) : (
            <Navigation className={`w-5 h-5 ${isSet ? 'text-white' : 'text-slate-400'}`} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold uppercase tracking-wide ${isSet ? colorClasses.text : 'text-slate-400'}`}>
            {isPickup ? 'Pickup Location' : 'Drop-off Location'}
          </p>
          {isSet && location ? (
            <p className="text-sm text-slate-700 truncate font-medium">
              {location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
            </p>
          ) : (
            <p className="text-sm text-slate-500">Tap to select on map</p>
          )}
        </div>
        {isSet && (
          <CheckCircle2 className={`w-5 h-5 ${colorClasses.text}`} />
        )}
      </div>
    </button>
  );
}
