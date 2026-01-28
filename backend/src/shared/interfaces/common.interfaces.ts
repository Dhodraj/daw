// Ride status enum
export enum RideStatus {
  PENDING = 'PENDING',
  SEARCHING = 'SEARCHING',
  DRIVER_ASSIGNED = 'DRIVER_ASSIGNED',
  DRIVER_ARRIVED = 'DRIVER_ARRIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_DRIVERS = 'NO_DRIVERS',
}

// Trip status enum
export enum TripStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
}

// Driver status enum
export enum DriverStatus {
  OFFLINE = 'OFFLINE',
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  ON_TRIP = 'ON_TRIP',
}

// Ride tier enum
export enum RideTier {
  ECONOMY = 'ECONOMY',
  COMFORT = 'COMFORT',
  PREMIUM = 'PREMIUM',
  XL = 'XL',
}

// Payment status enum
export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

// Payment method enum
export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  WALLET = 'WALLET',
}

// Ride offer response enum
export enum OfferResponse {
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  TIMEOUT = 'TIMEOUT',
}

// Location interface
export interface Location {
  latitude: number;
  longitude: number;
}

// Extended location with metadata
export interface LocationWithMetadata extends Location {
  heading?: number;
  speed?: number;
  accuracy?: number;
  timestamp?: number;
}

// Fare breakdown interface
export interface FareBreakdown {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surgeAmount: number;
  taxes: number;
  total: number;
  currency: string;
}

// Ride state machine transitions
export const RideStateTransitions: Record<RideStatus, RideStatus[]> = {
  [RideStatus.PENDING]: [RideStatus.SEARCHING, RideStatus.CANCELLED],
  [RideStatus.SEARCHING]: [
    RideStatus.DRIVER_ASSIGNED,
    RideStatus.NO_DRIVERS,
    RideStatus.CANCELLED,
  ],
  [RideStatus.DRIVER_ASSIGNED]: [
    RideStatus.DRIVER_ARRIVED,
    RideStatus.CANCELLED,
  ],
  [RideStatus.DRIVER_ARRIVED]: [RideStatus.IN_PROGRESS, RideStatus.CANCELLED],
  [RideStatus.IN_PROGRESS]: [RideStatus.COMPLETED],
  [RideStatus.COMPLETED]: [],
  [RideStatus.CANCELLED]: [],
  [RideStatus.NO_DRIVERS]: [],
};

// Trip state machine transitions
export const TripStateTransitions: Record<TripStatus, TripStatus[]> = {
  [TripStatus.NOT_STARTED]: [TripStatus.IN_PROGRESS],
  [TripStatus.IN_PROGRESS]: [TripStatus.PAUSED, TripStatus.COMPLETED],
  [TripStatus.PAUSED]: [TripStatus.IN_PROGRESS, TripStatus.COMPLETED],
  [TripStatus.COMPLETED]: [],
};

/**
 * Check if a state transition is valid
 */
export function canTransition<T extends string>(
  transitions: Record<T, T[]>,
  currentState: T,
  newState: T,
): boolean {
  const allowedTransitions = transitions[currentState];
  return allowedTransitions?.includes(newState) ?? false;
}
