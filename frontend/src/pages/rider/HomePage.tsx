import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Navigation,
  CreditCard,
  Car,
  Clock,
  Info,
} from 'lucide-react';
import RideMap from '@/components/Map/RideMap';
import RideRequestForm from '@/components/Ride/RideRequestForm';
import RideStatusCard from '@/components/Ride/RideStatusCard';
import useRideStore from '@/stores/rideStore';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/utils/cn';

export default function HomePage() {
  const [selectionMode, setSelectionMode] = useState<'pickup' | 'destination' | null>(null);
  const { currentRide, setPickupLocation, setDestinationLocation } = useRideStore();
  const user = useAuthStore((state) => state.user);

  const handleLocationSelect = (lat: number, lng: number) => {
    if (selectionMode === 'pickup') {
      setPickupLocation({ latitude: lat, longitude: lng });
    } else if (selectionMode === 'destination') {
      setDestinationLocation({ latitude: lat, longitude: lng });
    }
    setSelectionMode(null);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Selection Mode Banner */}
      <AnimatePresence>
        {selectionMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              'px-4 py-3 text-center font-medium text-white shadow-lg z-10',
              selectionMode === 'pickup'
                ? 'bg-gradient-to-r from-success-500 to-success-600'
                : 'bg-gradient-to-r from-error-500 to-error-600'
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <MapPin className="w-5 h-5 animate-bounce" />
              <span>
                Tap on the map to select your{' '}
                {selectionMode === 'pickup' ? 'pickup' : 'drop-off'} location
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Map Section */}
        <div className="flex-1 lg:flex-[2] min-h-[300px] lg:min-h-0 relative">
          <RideMap
            selectionMode={selectionMode}
            onLocationSelect={handleLocationSelect}
          />

          {/* Map Overlay Info */}
          <div className="absolute bottom-4 left-4 right-4 lg:right-auto pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card-glass p-3 rounded-xl pointer-events-auto max-w-xs"
            >
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Navigation className="w-4 h-4 text-primary-500" />
                <span className="text-sm font-medium">Interactive Map</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Click anywhere to select locations
              </p>
            </motion.div>
          </div>
        </div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:w-[420px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl lg:border-l border-slate-200/50 dark:border-slate-700 overflow-y-auto"
        >
          <div className="p-5 space-y-5">
            {/* Show form if no active ride, otherwise show status */}
            <AnimatePresence mode="wait">
              {!currentRide ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <RideRequestForm
                    riderId={user?.id || ''}
                    onSelectPickup={() => setSelectionMode('pickup')}
                    onSelectDestination={() => setSelectionMode('destination')}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="status"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <RideStatusCard />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Help Section */}
            <AnimatePresence>
              {!currentRide && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="card-glass rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                        <Info className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                        Quick Guide
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <HelpStep
                        number={1}
                        icon={<MapPin className="w-4 h-4" />}
                        title="Set Pickup"
                        description="Click the pickup button and tap on the map"
                      />
                      <HelpStep
                        number={2}
                        icon={<Navigation className="w-4 h-4" />}
                        title="Set Destination"
                        description="Click destination and select drop-off point"
                      />
                      <HelpStep
                        number={3}
                        icon={<CreditCard className="w-4 h-4" />}
                        title="Choose Options"
                        description="Select ride type and payment method"
                      />
                      <HelpStep
                        number={4}
                        icon={<Car className="w-4 h-4" />}
                        title="Request Ride"
                        description="We'll match you with a nearby driver"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stats Footer */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard icon={<Car className="w-4 h-4" />} value="100k+" label="Drivers" />
              <StatCard icon={<Clock className="w-4 h-4" />} value="<3min" label="Avg Wait" />
              <StatCard icon={<MapPin className="w-4 h-4" />} value="50+" label="Cities" />
            </div>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-slate-200/50 dark:border-slate-700">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                SwiftRide v1.0 &middot; Built with precision
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function HelpStep({
  number,
  icon,
  title,
  description,
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
        {number}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-primary-500 dark:text-primary-400">{icon}</span>
          <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">
            {title}
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {description}
        </p>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-3 text-center border border-slate-200/50 dark:border-slate-700">
      <div className="text-primary-500 dark:text-primary-400 flex justify-center mb-1">
        {icon}
      </div>
      <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{value}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );
}
