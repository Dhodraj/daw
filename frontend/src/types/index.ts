// Ride Status Constants
export const RideStatus = {
  PENDING: 'PENDING',
  SEARCHING: 'SEARCHING',
  DRIVER_ASSIGNED: 'DRIVER_ASSIGNED',
  DRIVER_ARRIVED: 'DRIVER_ARRIVED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_DRIVERS: 'NO_DRIVERS',
} as const;
export type RideStatus = (typeof RideStatus)[keyof typeof RideStatus];

// Trip Status Constants
export const TripStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
} as const;
export type TripStatus = (typeof TripStatus)[keyof typeof TripStatus];

// Ride Tier Constants
export const RideTier = {
  ECONOMY: 'ECONOMY',
  COMFORT: 'COMFORT',
  PREMIUM: 'PREMIUM',
  XL: 'XL',
} as const;
export type RideTier = (typeof RideTier)[keyof typeof RideTier];

// Payment Method Constants
export const PaymentMethod = {
  CASH: 'CASH',
  CARD: 'CARD',
  WALLET: 'WALLET',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

// Interfaces
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicleNumber: string;
  rating: number;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface Rider {
  id: string;
  name: string;
}

export interface FareEstimate {
  min: number;
  max: number;
  currency: string;
}

export interface FareBreakdown {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surgeAmount: number;
  taxes: number;
  total: number;
  currency: string;
}

export interface Trip {
  id: string;
  status: TripStatus;
  fare?: FareBreakdown;
}

export interface Ride {
  id: string;
  status: RideStatus;
  rider: Rider;
  driver?: Driver;
  pickup: {
    location: Location;
    address?: string;
  };
  destination: {
    location: Location;
    address?: string;
  };
  tier: RideTier;
  estimatedFare: FareEstimate;
  surgeMultiplier: number;
  trip?: Trip;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRideRequest {
  pickupLocation: Location;
  destinationLocation: Location;
  tier: RideTier;
  paymentMethod: PaymentMethod;
  riderId: string;
}

export interface CreateRideResponse {
  id: string;
  status: RideStatus;
  estimatedFare: FareEstimate;
  surgeMultiplier: number;
  createdAt: string;
}

// WebSocket event types
export interface RideUpdateEvent {
  channel: string;
  data: {
    rideId: string;
    status?: RideStatus;
    driverId?: string;
    tripId?: string;
    timestamp: number;
  };
}

export interface DriverLocationEvent {
  driverId: string;
  location: {
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
  };
  timestamp: number;
}
