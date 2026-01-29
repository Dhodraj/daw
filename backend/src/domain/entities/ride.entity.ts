import { Location, Money } from '../value-objects';

/**
 * Ride Status enum
 */
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

/**
 * Ride Tier enum
 */
export enum RideTier {
  ECONOMY = 'ECONOMY',
  COMFORT = 'COMFORT',
  PREMIUM = 'PREMIUM',
  XL = 'XL',
}

/**
 * Payment Method enum
 */
export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  WALLET = 'WALLET',
}

/**
 * Ride Entity Props
 */
interface RideProps {
  id: string;
  riderId: string;
  driverId?: string;
  idempotencyKey?: string;
  pickupLocation: Location;
  destinationLocation: Location;
  tier: RideTier;
  status: RideStatus;
  paymentMethod: PaymentMethod;
  estimatedFareMin?: Money;
  estimatedFareMax?: Money;
  surgeMultiplier: number;
  requestedAt: Date;
  driverAssignedAt?: Date;
  driverArrivedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Ride Domain Entity
 * Contains business logic for ride lifecycle management
 */
export class Ride {
  private constructor(private props: RideProps) {}

  // Getters
  get id(): string {
    return this.props.id;
  }

  get riderId(): string {
    return this.props.riderId;
  }

  get driverId(): string | undefined {
    return this.props.driverId;
  }

  get idempotencyKey(): string | undefined {
    return this.props.idempotencyKey;
  }

  get pickupLocation(): Location {
    return this.props.pickupLocation;
  }

  get destinationLocation(): Location {
    return this.props.destinationLocation;
  }

  get tier(): RideTier {
    return this.props.tier;
  }

  get status(): RideStatus {
    return this.props.status;
  }

  get paymentMethod(): PaymentMethod {
    return this.props.paymentMethod;
  }

  get estimatedFareMin(): Money | undefined {
    return this.props.estimatedFareMin;
  }

  get estimatedFareMax(): Money | undefined {
    return this.props.estimatedFareMax;
  }

  get surgeMultiplier(): number {
    return this.props.surgeMultiplier;
  }

  get requestedAt(): Date {
    return this.props.requestedAt;
  }

  get driverAssignedAt(): Date | undefined {
    return this.props.driverAssignedAt;
  }

  get driverArrivedAt(): Date | undefined {
    return this.props.driverArrivedAt;
  }

  get cancelledAt(): Date | undefined {
    return this.props.cancelledAt;
  }

  get cancellationReason(): string | undefined {
    return this.props.cancellationReason;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Create a new Ride
   */
  static create(props: {
    id: string;
    riderId: string;
    pickupLocation: Location;
    destinationLocation: Location;
    tier: RideTier;
    paymentMethod: PaymentMethod;
    idempotencyKey?: string;
    estimatedFareMin?: Money;
    estimatedFareMax?: Money;
    surgeMultiplier?: number;
  }): Ride {
    const now = new Date();
    return new Ride({
      ...props,
      status: RideStatus.PENDING,
      surgeMultiplier: props.surgeMultiplier ?? 1.0,
      requestedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Reconstitute from persistence
   */
  static reconstitute(props: RideProps): Ride {
    return new Ride(props);
  }

  /**
   * Check if ride can be cancelled
   */
  canCancel(): boolean {
    const cancellableStatuses: RideStatus[] = [
      RideStatus.PENDING,
      RideStatus.SEARCHING,
      RideStatus.DRIVER_ASSIGNED,
      RideStatus.DRIVER_ARRIVED,
    ];
    return cancellableStatuses.includes(this.props.status);
  }

  /**
   * Cancel the ride
   */
  cancel(reason?: string): void {
    if (!this.canCancel()) {
      throw new Error(`Cannot cancel ride in status: ${this.props.status}`);
    }

    this.props.status = RideStatus.CANCELLED;
    this.props.cancelledAt = new Date();
    this.props.cancellationReason = reason;
    this.props.updatedAt = new Date();
  }

  /**
   * Start searching for drivers
   */
  startSearching(): void {
    if (this.props.status !== RideStatus.PENDING) {
      throw new Error(
        `Cannot start searching from status: ${this.props.status}`,
      );
    }

    this.props.status = RideStatus.SEARCHING;
    this.props.updatedAt = new Date();
  }

  /**
   * Assign a driver to the ride
   */
  assignDriver(driverId: string): void {
    if (this.props.status !== RideStatus.SEARCHING) {
      throw new Error(`Cannot assign driver in status: ${this.props.status}`);
    }

    this.props.driverId = driverId;
    this.props.status = RideStatus.DRIVER_ASSIGNED;
    this.props.driverAssignedAt = new Date();
    this.props.updatedAt = new Date();
  }

  /**
   * Mark driver as arrived
   */
  markDriverArrived(): void {
    if (this.props.status !== RideStatus.DRIVER_ASSIGNED) {
      throw new Error(
        `Cannot mark driver arrived in status: ${this.props.status}`,
      );
    }

    this.props.status = RideStatus.DRIVER_ARRIVED;
    this.props.driverArrivedAt = new Date();
    this.props.updatedAt = new Date();
  }

  /**
   * Start the trip
   */
  startTrip(): void {
    if (this.props.status !== RideStatus.DRIVER_ARRIVED) {
      throw new Error(`Cannot start trip in status: ${this.props.status}`);
    }

    this.props.status = RideStatus.IN_PROGRESS;
    this.props.updatedAt = new Date();
  }

  /**
   * Complete the ride
   */
  complete(): void {
    if (this.props.status !== RideStatus.IN_PROGRESS) {
      throw new Error(`Cannot complete ride in status: ${this.props.status}`);
    }

    this.props.status = RideStatus.COMPLETED;
    this.props.updatedAt = new Date();
  }

  /**
   * Mark as no drivers available
   */
  markNoDrivers(): void {
    if (this.props.status !== RideStatus.SEARCHING) {
      throw new Error(`Cannot mark no drivers in status: ${this.props.status}`);
    }

    this.props.status = RideStatus.NO_DRIVERS;
    this.props.updatedAt = new Date();
  }

  /**
   * Check if ride is in a terminal state
   */
  isTerminal(): boolean {
    return [
      RideStatus.COMPLETED,
      RideStatus.CANCELLED,
      RideStatus.NO_DRIVERS,
    ].includes(this.props.status);
  }

  /**
   * Check if ride is active
   */
  isActive(): boolean {
    return !this.isTerminal();
  }

  /**
   * Calculate estimated distance
   */
  getEstimatedDistance(): number {
    return this.pickupLocation.distanceTo(this.destinationLocation);
  }

  /**
   * Get all props for persistence
   */
  toProps(): RideProps {
    return { ...this.props };
  }

  /**
   * Serialize to JSON
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      riderId: this.riderId,
      driverId: this.driverId,
      idempotencyKey: this.idempotencyKey,
      pickupLocation: this.pickupLocation.toJSON(),
      destinationLocation: this.destinationLocation.toJSON(),
      tier: this.tier,
      status: this.status,
      paymentMethod: this.paymentMethod,
      estimatedFareMin: this.estimatedFareMin?.toJSON(),
      estimatedFareMax: this.estimatedFareMax?.toJSON(),
      surgeMultiplier: this.surgeMultiplier,
      requestedAt: this.requestedAt.toISOString(),
      driverAssignedAt: this.driverAssignedAt?.toISOString(),
      driverArrivedAt: this.driverArrivedAt?.toISOString(),
      cancelledAt: this.cancelledAt?.toISOString(),
      cancellationReason: this.cancellationReason,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
