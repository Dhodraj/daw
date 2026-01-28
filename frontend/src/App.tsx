import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import {
  Car,
  MapPin,
  Wifi,
  WifiOff,
  Menu,
  X,
  Info,
  Navigation,
  CreditCard,
  Clock
} from 'lucide-react';
import RideMap from './components/Map/RideMap';
import RideRequestForm from './components/Ride/RideRequestForm';
import RideStatusCard from './components/Ride/RideStatusCard';
import useRideStore from './stores/rideStore';
import socketService from './services/socket';

// Demo rider ID (in production, this would come from authentication)
const DEMO_RIDER_ID = '00000000-0000-0000-0000-000000000002';

function App() {
  const [selectionMode, setSelectionMode] = useState<'pickup' | 'destination' | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const { currentRide, setPickupLocation, setDestinationLocation } = useRideStore();

  // Connect to WebSocket on mount
  useEffect(() => {
    socketService.connect();

    // Check connection status
    const checkConnection = () => {
      setIsConnected(socketService.isConnected());
    };

    checkConnection();
    const interval = setInterval(checkConnection, 2000);

    return () => {
      clearInterval(interval);
      socketService.disconnect();
    };
  }, []);

  const handleLocationSelect = (lat: number, lng: number) => {
    if (selectionMode === 'pickup') {
      setPickupLocation({ latitude: lat, longitude: lng });
    } else if (selectionMode === 'destination') {
      setDestinationLocation({ latitude: lat, longitude: lng });
    }
    setSelectionMode(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />

      {/* Header */}
      <header className="header-gradient text-white shadow-xl z-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-accent-500/20 pointer-events-none" />
        <div className="relative px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">SwiftRide</h1>
                <p className="text-xs text-white/70 font-medium">Premium Ride Experience</p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              <ConnectionStatus isConnected={isConnected} />
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 border border-white/10"
              >
                <Info className="w-4 h-4" />
                <span className="text-sm font-medium">Help</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden mt-4 pt-4 border-t border-white/10"
              >
                <div className="flex flex-col gap-3">
                  <ConnectionStatus isConnected={isConnected} />
                  <button
                    onClick={() => { setShowHelp(!showHelp); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg"
                  >
                    <Info className="w-4 h-4" />
                    <span className="text-sm">Help Guide</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Selection Mode Banner */}
      <AnimatePresence>
        {selectionMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`px-4 py-3 text-center font-medium text-white shadow-lg z-10 ${
              selectionMode === 'pickup'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                : 'bg-gradient-to-r from-rose-500 to-rose-600'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <MapPin className="w-5 h-5 animate-bounce" />
              <span>Tap on the map to select your {selectionMode === 'pickup' ? 'pickup' : 'drop-off'} location</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Map Section */}
        <div className="flex-1 lg:flex-[2] h-1/2 lg:h-full relative">
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
              <div className="flex items-center gap-2 text-slate-700">
                <Navigation className="w-4 h-4 text-primary-500" />
                <span className="text-sm font-medium">Interactive Map</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Click anywhere to select locations</p>
            </motion.div>
          </div>
        </div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:w-[420px] bg-white/80 backdrop-blur-xl lg:border-l border-slate-200/50 overflow-y-auto"
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
                    riderId={DEMO_RIDER_ID}
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
              {(showHelp || !currentRide) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="card-glass rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Info className="w-4 h-4 text-primary-600" />
                      </div>
                      <h3 className="font-semibold text-slate-800">Quick Guide</h3>
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
            <div className="text-center pt-4 border-t border-slate-200/50">
              <p className="text-xs text-slate-400">
                SwiftRide v1.0 &middot; Built with precision
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Connection Status Component
function ConnectionStatus({ isConnected }: { isConnected: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
      isConnected
        ? 'bg-emerald-500/20 text-emerald-100'
        : 'bg-rose-500/20 text-rose-100'
    }`}>
      {isConnected ? (
        <>
          <Wifi className="w-4 h-4" />
          <span>Live</span>
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span>Offline</span>
        </>
      )}
    </div>
  );
}

// Help Step Component
function HelpStep({ number, icon, title, description }: {
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
          <span className="text-primary-500">{icon}</span>
          <span className="font-medium text-slate-700 text-sm">{title}</span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-3 text-center border border-slate-200/50">
      <div className="text-primary-500 flex justify-center mb-1">{icon}</div>
      <div className="text-lg font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

export default App;
