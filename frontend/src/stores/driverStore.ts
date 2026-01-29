import { create } from 'zustand';

export type DriverStatus = 'offline' | 'online' | 'busy';

export interface DriverLocation {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  updatedAt?: string;
}

export interface RideRequest {
  id: string;
  riderId: string;
  riderName: string;
  riderRating: number;
  pickup: {
    address: string;
    latitude: number;
    longitude: number;
    distance: string;
  };
  dropoff: {
    address: string;
    latitude: number;
    longitude: number;
  };
  fare: number;
  surgeMultiplier: number;
  eta: number;
  vehicleType: string;
  expiresAt: number;
}

export interface ActiveTrip {
  id: string;
  status: 'navigating_to_pickup' | 'arrived_at_pickup' | 'in_progress' | 'arriving';
  rider: {
    id: string;
    name: string;
    phone: string;
    rating: number;
  };
  pickup: {
    address: string;
    latitude: number;
    longitude: number;
  };
  dropoff: {
    address: string;
    latitude: number;
    longitude: number;
  };
  fare: number;
  distance: string;
  duration: string;
  startedAt?: string;
}

export interface DailyStats {
  earnings: number;
  trips: number;
  onlineHours: number;
  acceptanceRate: number;
}

interface DriverState {
  // Status
  status: DriverStatus;
  location: DriverLocation | null;

  // Current activity
  currentRequest: RideRequest | null;
  activeTrip: ActiveTrip | null;

  // Stats
  dailyStats: DailyStats;

  // Actions
  setStatus: (status: DriverStatus) => void;
  setLocation: (location: DriverLocation) => void;
  setCurrentRequest: (request: RideRequest | null) => void;
  acceptRequest: () => void;
  declineRequest: () => void;
  setActiveTrip: (trip: ActiveTrip | null) => void;
  updateTripStatus: (status: ActiveTrip['status']) => void;
  endTrip: () => void;
  updateDailyStats: (stats: Partial<DailyStats>) => void;
  resetDaily: () => void;
}

const initialDailyStats: DailyStats = {
  earnings: 0,
  trips: 0,
  onlineHours: 0,
  acceptanceRate: 100,
};

export const useDriverStore = create<DriverState>((set, get) => ({
  status: 'offline',
  location: null,
  currentRequest: null,
  activeTrip: null,
  dailyStats: initialDailyStats,

  setStatus: (status) => set({ status }),

  setLocation: (location) => set({ location }),

  setCurrentRequest: (request) => set({ currentRequest: request }),

  acceptRequest: () => {
    const { currentRequest } = get();
    if (!currentRequest) return;

    const trip: ActiveTrip = {
      id: currentRequest.id,
      status: 'navigating_to_pickup',
      rider: {
        id: currentRequest.riderId,
        name: currentRequest.riderName,
        phone: '+1 (555) 000-0000', // Would come from API
        rating: currentRequest.riderRating,
      },
      pickup: {
        address: currentRequest.pickup.address,
        latitude: currentRequest.pickup.latitude,
        longitude: currentRequest.pickup.longitude,
      },
      dropoff: {
        address: currentRequest.dropoff.address,
        latitude: currentRequest.dropoff.latitude,
        longitude: currentRequest.dropoff.longitude,
      },
      fare: currentRequest.fare,
      distance: '0 mi',
      duration: '0 min',
    };

    set({
      currentRequest: null,
      activeTrip: trip,
      status: 'busy',
    });
  },

  declineRequest: () => set({ currentRequest: null }),

  setActiveTrip: (trip) => set({ activeTrip: trip }),

  updateTripStatus: (status) => {
    const { activeTrip } = get();
    if (!activeTrip) return;

    set({
      activeTrip: { ...activeTrip, status },
    });
  },

  endTrip: () => {
    const { activeTrip, dailyStats } = get();
    if (!activeTrip) return;

    set({
      activeTrip: null,
      status: 'online',
      dailyStats: {
        ...dailyStats,
        earnings: dailyStats.earnings + activeTrip.fare,
        trips: dailyStats.trips + 1,
      },
    });
  },

  updateDailyStats: (stats) => {
    const { dailyStats } = get();
    set({ dailyStats: { ...dailyStats, ...stats } });
  },

  resetDaily: () => set({ dailyStats: initialDailyStats }),
}));
