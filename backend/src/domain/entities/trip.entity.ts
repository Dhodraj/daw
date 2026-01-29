import { Location, Fare, Money } from '../value-objects';

/**
 * Trip Status enum
 */
export enum TripStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
}

/**
 * Trip Entity Props
 */
interface TripProps {
  id: string;
  rideId: string;
  driverId: string;
  riderId: string;
  status: TripStatus;
  startLocation?: Location;
  endLocation?: Location;
  routePolyline?: string;
  distanceMeters?: number;
  durationSeconds?: number;
  fare?: Fare;
  startedAt?: Date;
  pausedAt?: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Trip Domain Entity
 * Contains business logic for trip management
 */
export class Trip {
  private constructor(private props: TripProps) {}

  // Getters
  get id(): string {
    return this.props.id;
  }

  get rideId(): string {
    return this.props.rideId;
  }

  get driverId(): string {
    return this.props.driverId;
  }

  get riderId(): string {
    return this.props.riderId;
  }

  get status(): TripStatus {
    return this.props.status;
  }

  get startLocation(): Location | undefined {
    return this.props.startLocation;
  }

  get endLocation(): Location | undefined {
    return this.props.endLocation;
  }

  get routePolyline(): string | undefined {
    return this.props.routePolyline;
  }

  get distanceMeters(): number | undefined {
    return this.props.distanceMeters;
  }

  get durationSeconds(): number | undefined {
    return this.props.durationSeconds;
  }

  get fare(): Fare | undefined {
    return this.props.fare;
  }

  get startedAt(): Date | undefined {
    return this.props.startedAt;
  }

  get pausedAt(): Date | undefined {
    return this.props.pausedAt;
  }

  get endedAt(): Date | undefined {
    return this.props.endedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Create a new Trip
   */
  static create(props: {
    id: string;
    rideId: string;
    driverId: string;
    riderId: string;
  }): Trip {
    const now = new Date();
    return new Trip({
      ...props,
      status: TripStatus.NOT_STARTED,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Reconstitute from persistence
   */
  static reconstitute(props: TripProps): Trip {
    return new Trip(props);
  }

  /**
   * Check if trip can be started
   */
  canStart(): boolean {
    return this.props.status === TripStatus.NOT_STARTED;
  }

  /**
   * Start the trip
   */
  start(startLocation: Location): void {
    if (!this.canStart()) {
      throw new Error(`Cannot start trip in status: ${this.props.status}`);
    }

    this.props.status = TripStatus.IN_PROGRESS;
    this.props.startLocation = startLocation;
    this.props.startedAt = new Date();
    this.props.updatedAt = new Date();
  }

  /**
   * Pause the trip
   */
  pause(): void {
    if (this.props.status !== TripStatus.IN_PROGRESS) {
      throw new Error(`Cannot pause trip in status: ${this.props.status}`);
    }

    this.props.status = TripStatus.PAUSED;
    this.props.pausedAt = new Date();
    this.props.updatedAt = new Date();
  }

  /**
   * Resume the trip
   */
  resume(): void {
    if (this.props.status !== TripStatus.PAUSED) {
      throw new Error(`Cannot resume trip in status: ${this.props.status}`);
    }

    this.props.status = TripStatus.IN_PROGRESS;
    this.props.updatedAt = new Date();
  }

  /**
   * Complete the trip
   */
  complete(
    endLocation: Location,
    distanceMeters: number,
    durationSeconds: number,
    fare: Fare,
    routePolyline?: string,
  ): void {
    if (this.props.status !== TripStatus.IN_PROGRESS) {
      throw new Error(`Cannot complete trip in status: ${this.props.status}`);
    }

    this.props.status = TripStatus.COMPLETED;
    this.props.endLocation = endLocation;
    this.props.distanceMeters = distanceMeters;
    this.props.durationSeconds = durationSeconds;
    this.props.fare = fare;
    this.props.routePolyline = routePolyline;
    this.props.endedAt = new Date();
    this.props.updatedAt = new Date();
  }

  /**
   * Check if trip is active
   */
  isActive(): boolean {
    return [TripStatus.IN_PROGRESS, TripStatus.PAUSED].includes(
      this.props.status,
    );
  }

  /**
   * Check if trip is completed
   */
  isCompleted(): boolean {
    return this.props.status === TripStatus.COMPLETED;
  }

  /**
   * Calculate trip duration in minutes
   */
  getDurationMinutes(): number | null {
    if (!this.durationSeconds) return null;
    return Math.round(this.durationSeconds / 60);
  }

  /**
   * Calculate trip distance in kilometers
   */
  getDistanceKm(): number | null {
    if (!this.distanceMeters) return null;
    return Number((this.distanceMeters / 1000).toFixed(2));
  }

  /**
   * Get total fare
   */
  getTotalFare(): Money | null {
    return this.fare?.total ?? null;
  }

  /**
   * Get all props for persistence
   */
  toProps(): TripProps {
    return { ...this.props };
  }

  /**
   * Serialize to JSON
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      rideId: this.rideId,
      driverId: this.driverId,
      riderId: this.riderId,
      status: this.status,
      startLocation: this.startLocation?.toJSON(),
      endLocation: this.endLocation?.toJSON(),
      routePolyline: this.routePolyline,
      distanceMeters: this.distanceMeters,
      durationSeconds: this.durationSeconds,
      fare: this.fare?.toJSON(),
      startedAt: this.startedAt?.toISOString(),
      pausedAt: this.pausedAt?.toISOString(),
      endedAt: this.endedAt?.toISOString(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
