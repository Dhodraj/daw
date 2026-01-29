/**
 * Base Domain Event
 */
export interface DomainEvent {
  eventType: string;
  aggregateId: string;
  tenantId: string;
  occurredAt: Date;
  payload: Record<string, unknown>;
}

/**
 * Ride Created Event
 */
export class RideCreatedEvent implements DomainEvent {
  readonly eventType = 'RIDE_CREATED';
  readonly occurredAt = new Date();

  constructor(
    public readonly aggregateId: string,
    public readonly tenantId: string,
    public readonly payload: {
      riderId: string;
      pickupLatitude: number;
      pickupLongitude: number;
      destinationLatitude: number;
      destinationLongitude: number;
      tier: string;
      paymentMethod: string;
    },
  ) {}
}

/**
 * Driver Assigned Event
 */
export class DriverAssignedEvent implements DomainEvent {
  readonly eventType = 'DRIVER_ASSIGNED';
  readonly occurredAt = new Date();

  constructor(
    public readonly aggregateId: string,
    public readonly tenantId: string,
    public readonly payload: {
      rideId: string;
      driverId: string;
      driverName: string;
      driverPhone: string;
      vehicleNumber: string;
    },
  ) {}
}

/**
 * Ride Status Changed Event
 */
export class RideStatusChangedEvent implements DomainEvent {
  readonly eventType = 'RIDE_STATUS_CHANGED';
  readonly occurredAt = new Date();

  constructor(
    public readonly aggregateId: string,
    public readonly tenantId: string,
    public readonly payload: {
      rideId: string;
      previousStatus: string;
      newStatus: string;
    },
  ) {}
}

/**
 * Trip Started Event
 */
export class TripStartedEvent implements DomainEvent {
  readonly eventType = 'TRIP_STARTED';
  readonly occurredAt = new Date();

  constructor(
    public readonly aggregateId: string,
    public readonly tenantId: string,
    public readonly payload: {
      tripId: string;
      rideId: string;
      driverId: string;
      riderId: string;
      startLatitude: number;
      startLongitude: number;
    },
  ) {}
}

/**
 * Trip Completed Event
 */
export class TripCompletedEvent implements DomainEvent {
  readonly eventType = 'TRIP_COMPLETED';
  readonly occurredAt = new Date();

  constructor(
    public readonly aggregateId: string,
    public readonly tenantId: string,
    public readonly payload: {
      tripId: string;
      rideId: string;
      driverId: string;
      riderId: string;
      distanceMeters: number;
      durationSeconds: number;
      totalFare: number;
      currency: string;
    },
  ) {}
}

/**
 * Driver Location Updated Event
 */
export class DriverLocationUpdatedEvent implements DomainEvent {
  readonly eventType = 'DRIVER_LOCATION_UPDATED';
  readonly occurredAt = new Date();

  constructor(
    public readonly aggregateId: string,
    public readonly tenantId: string,
    public readonly payload: {
      driverId: string;
      latitude: number;
      longitude: number;
      heading?: number;
      speed?: number;
    },
  ) {}
}

/**
 * Ride Cancelled Event
 */
export class RideCancelledEvent implements DomainEvent {
  readonly eventType = 'RIDE_CANCELLED';
  readonly occurredAt = new Date();

  constructor(
    public readonly aggregateId: string,
    public readonly tenantId: string,
    public readonly payload: {
      rideId: string;
      cancelledBy: 'RIDER' | 'DRIVER' | 'SYSTEM';
      reason?: string;
    },
  ) {}
}
