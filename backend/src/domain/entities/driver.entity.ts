import { Location } from '../value-objects';

/**
 * Driver Status enum
 */
export enum DriverStatus {
  OFFLINE = 'OFFLINE',
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  ON_TRIP = 'ON_TRIP',
}

/**
 * Vehicle Type enum
 */
export enum VehicleType {
  ECONOMY = 'ECONOMY',
  COMFORT = 'COMFORT',
  PREMIUM = 'PREMIUM',
  XL = 'XL',
}

/**
 * Driver Entity Props
 */
interface DriverProps {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  status: DriverStatus;
  rating: number;
  acceptanceRate: number;
  currentLocation?: Location;
  lastLocationUpdate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Driver Domain Entity
 * Contains business logic for driver management
 */
export class Driver {
  private constructor(private props: DriverProps) {}

  // Getters
  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get phone(): string {
    return this.props.phone;
  }

  get email(): string | undefined {
    return this.props.email;
  }

  get vehicleNumber(): string {
    return this.props.vehicleNumber;
  }

  get vehicleType(): VehicleType {
    return this.props.vehicleType;
  }

  get status(): DriverStatus {
    return this.props.status;
  }

  get rating(): number {
    return this.props.rating;
  }

  get acceptanceRate(): number {
    return this.props.acceptanceRate;
  }

  get currentLocation(): Location | undefined {
    return this.props.currentLocation;
  }

  get lastLocationUpdate(): Date | undefined {
    return this.props.lastLocationUpdate;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Create a new Driver
   */
  static create(props: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    vehicleNumber: string;
    vehicleType: VehicleType;
  }): Driver {
    const now = new Date();
    return new Driver({
      ...props,
      status: DriverStatus.OFFLINE,
      rating: 5.0,
      acceptanceRate: 1.0,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Reconstitute from persistence
   */
  static reconstitute(props: DriverProps): Driver {
    return new Driver(props);
  }

  /**
   * Check if driver is available for rides
   */
  isAvailable(): boolean {
    return this.props.status === DriverStatus.AVAILABLE;
  }

  /**
   * Check if driver can accept a specific vehicle type request
   */
  canAcceptTier(requestedTier: string): boolean {
    // Higher tier vehicles can accept lower tier requests
    const tierHierarchy = {
      [VehicleType.XL]: [VehicleType.XL],
      [VehicleType.PREMIUM]: [
        VehicleType.PREMIUM,
        VehicleType.COMFORT,
        VehicleType.ECONOMY,
      ],
      [VehicleType.COMFORT]: [VehicleType.COMFORT, VehicleType.ECONOMY],
      [VehicleType.ECONOMY]: [VehicleType.ECONOMY],
    };

    const acceptableTiers = tierHierarchy[this.vehicleType] || [];
    return acceptableTiers.includes(requestedTier as VehicleType);
  }

  /**
   * Go online and become available
   */
  goOnline(): void {
    if (this.props.status === DriverStatus.ON_TRIP) {
      throw new Error('Cannot go online while on trip');
    }

    this.props.status = DriverStatus.AVAILABLE;
    this.props.updatedAt = new Date();
  }

  /**
   * Go offline
   */
  goOffline(): void {
    if (this.props.status === DriverStatus.ON_TRIP) {
      throw new Error('Cannot go offline while on trip');
    }

    this.props.status = DriverStatus.OFFLINE;
    this.props.updatedAt = new Date();
  }

  /**
   * Mark as busy (offered a ride)
   */
  markBusy(): void {
    if (this.props.status !== DriverStatus.AVAILABLE) {
      throw new Error(`Cannot mark busy from status: ${this.props.status}`);
    }

    this.props.status = DriverStatus.BUSY;
    this.props.updatedAt = new Date();
  }

  /**
   * Mark as available again (offer declined/expired)
   */
  markAvailable(): void {
    if (this.props.status !== DriverStatus.BUSY) {
      throw new Error(
        `Cannot mark available from status: ${this.props.status}`,
      );
    }

    this.props.status = DriverStatus.AVAILABLE;
    this.props.updatedAt = new Date();
  }

  /**
   * Start a trip
   */
  startTrip(): void {
    if (this.props.status !== DriverStatus.BUSY) {
      throw new Error(`Cannot start trip from status: ${this.props.status}`);
    }

    this.props.status = DriverStatus.ON_TRIP;
    this.props.updatedAt = new Date();
  }

  /**
   * End a trip
   */
  endTrip(): void {
    if (this.props.status !== DriverStatus.ON_TRIP) {
      throw new Error(`Cannot end trip from status: ${this.props.status}`);
    }

    this.props.status = DriverStatus.AVAILABLE;
    this.props.updatedAt = new Date();
  }

  /**
   * Update location
   */
  updateLocation(location: Location): void {
    this.props.currentLocation = location;
    this.props.lastLocationUpdate = new Date();
    this.props.updatedAt = new Date();
  }

  /**
   * Update rating (weighted average)
   */
  updateRating(newRating: number, totalTrips: number): void {
    if (newRating < 1 || newRating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Weighted average: (oldRating * oldTrips + newRating) / (oldTrips + 1)
    const oldTrips = totalTrips - 1;
    this.props.rating = Number(
      ((this.props.rating * oldTrips + newRating) / totalTrips).toFixed(1),
    );
    this.props.updatedAt = new Date();
  }

  /**
   * Update acceptance rate
   */
  updateAcceptanceRate(accepted: number, total: number): void {
    this.props.acceptanceRate = Number((accepted / total).toFixed(2));
    this.props.updatedAt = new Date();
  }

  /**
   * Calculate distance to a location
   */
  distanceTo(location: Location): number | null {
    if (!this.currentLocation) return null;
    return this.currentLocation.distanceTo(location);
  }

  /**
   * Get all props for persistence
   */
  toProps(): DriverProps {
    return { ...this.props };
  }

  /**
   * Serialize to JSON
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      phone: this.phone,
      email: this.email,
      vehicleNumber: this.vehicleNumber,
      vehicleType: this.vehicleType,
      status: this.status,
      rating: this.rating,
      acceptanceRate: this.acceptanceRate,
      currentLocation: this.currentLocation?.toJSON(),
      lastLocationUpdate: this.lastLocationUpdate?.toISOString(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
