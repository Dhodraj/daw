import { create } from 'zustand';
import { RideStatus, RideTier, PaymentMethod } from '../types';
import type { Ride, Location } from '../types';
import api from '../services/api';
import socketService from '../services/socket';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

interface RideState {
  // Current ride
  currentRide: Ride | null;
  isLoading: boolean;
  error: string | null;

  // Form state
  pickupLocation: Location | null;
  destinationLocation: Location | null;
  selectedTier: RideTier;
  paymentMethod: PaymentMethod;

  // Driver tracking
  driverLocation: { latitude: number; longitude: number } | null;

  // Actions
  setPickupLocation: (location: Location | null) => void;
  setDestinationLocation: (location: Location | null) => void;
  setSelectedTier: (tier: RideTier) => void;
  setPaymentMethod: (method: PaymentMethod) => void;

  createRide: (riderId: string) => Promise<void>;
  fetchRide: (rideId: string) => Promise<void>;
  cancelRide: (reason?: string) => Promise<void>;

  subscribeToRideUpdates: (rideId: string) => () => void;
  updateDriverLocation: (location: { latitude: number; longitude: number }) => void;

  clearRide: () => void;
  clearError: () => void;
}

export const useRideStore = create<RideState>((set, get) => ({
  // Initial state
  currentRide: null,
  isLoading: false,
  error: null,
  pickupLocation: null,
  destinationLocation: null,
  selectedTier: RideTier.ECONOMY,
  paymentMethod: PaymentMethod.CASH,
  driverLocation: null,

  // Setters
  setPickupLocation: (location) => set({ pickupLocation: location }),
  setDestinationLocation: (location) => set({ destinationLocation: location }),
  setSelectedTier: (tier) => set({ selectedTier: tier }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),

  // Create a new ride
  createRide: async (riderId: string) => {
    const { pickupLocation, destinationLocation, selectedTier, paymentMethod } = get();

    if (!pickupLocation || !destinationLocation) {
      set({ error: 'Please select pickup and destination locations' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await api.createRide({
        pickupLocation,
        destinationLocation,
        tier: selectedTier,
        paymentMethod,
        riderId,
      });

      // Fetch full ride details
      const ride = await api.getRide(response.id);
      set({ currentRide: ride, isLoading: false });

      // Subscribe to updates
      get().subscribeToRideUpdates(ride.id);
    } catch (err) {
      const error = err as ApiError;
      set({
        error: error.response?.data?.message || 'Failed to create ride',
        isLoading: false,
      });
    }
  },

  // Fetch ride details
  fetchRide: async (rideId: string) => {
    set({ isLoading: true, error: null });

    try {
      const ride = await api.getRide(rideId);
      set({ currentRide: ride, isLoading: false });
    } catch (err) {
      const error = err as ApiError;
      set({
        error: error.response?.data?.message || 'Failed to fetch ride',
        isLoading: false,
      });
    }
  },

  // Cancel ride
  cancelRide: async (reason?: string) => {
    const { currentRide } = get();
    if (!currentRide) return;

    set({ isLoading: true, error: null });

    try {
      await api.cancelRide(currentRide.id, reason);
      set({
        currentRide: { ...currentRide, status: RideStatus.CANCELLED },
        isLoading: false,
      });
    } catch (err) {
      const error = err as ApiError;
      set({
        error: error.response?.data?.message || 'Failed to cancel ride',
        isLoading: false,
      });
    }
  },

  // Subscribe to real-time ride updates
  subscribeToRideUpdates: (rideId: string) => {
    const unsubscribe = socketService.subscribeToRide(rideId, (data) => {
      const { currentRide } = get();

      if (!currentRide || currentRide.id !== rideId) return;

      // Handle different event types
      if (data.status && typeof data.status === 'string') {
        set({
          currentRide: {
            ...currentRide,
            status: data.status as RideStatus,
          },
        });
      }

      // If driver assigned, fetch updated ride to get driver details
      if (data.driverId && typeof data.driverId === 'string' && !currentRide.driver) {
        get().fetchRide(rideId);

        // Subscribe to driver location
        socketService.subscribeToDriverLocation(data.driverId, (locationData) => {
          const location = locationData.location as { latitude: number; longitude: number } | undefined;
          if (location) {
            get().updateDriverLocation(location);
          }
        });
      }
    });

    return unsubscribe;
  },

  // Update driver location
  updateDriverLocation: (location) => {
    set({ driverLocation: location });
  },

  // Clear current ride
  clearRide: () => {
    set({
      currentRide: null,
      driverLocation: null,
      pickupLocation: null,
      destinationLocation: null,
      error: null,
    });
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useRideStore;
