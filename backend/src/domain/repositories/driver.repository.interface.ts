import { Driver, DriverStatus, VehicleType } from '../entities';
import { Location } from '../value-objects';

/**
 * Driver Repository Interface
 * Defines the contract for driver persistence operations
 */
export interface IDriverRepository {
  /**
   * Find a driver by ID
   */
  findById(tenantId: string, id: string): Promise<Driver | null>;

  /**
   * Find a driver by phone
   */
  findByPhone(tenantId: string, phone: string): Promise<Driver | null>;

  /**
   * Find drivers by status
   */
  findByStatus(
    tenantId: string,
    status: DriverStatus[],
    options?: { limit?: number; offset?: number },
  ): Promise<Driver[]>;

  /**
   * Find available drivers near a location
   */
  findAvailableNearLocation(
    tenantId: string,
    location: Location,
    options?: {
      radiusMeters?: number;
      vehicleTypes?: VehicleType[];
      limit?: number;
    },
  ): Promise<Driver[]>;

  /**
   * Find available drivers for a specific tier
   */
  findAvailableForTier(
    tenantId: string,
    tier: VehicleType,
    location: Location,
    options?: {
      radiusMeters?: number;
      limit?: number;
      excludeDriverIds?: string[];
    },
  ): Promise<Driver[]>;

  /**
   * Save a driver (create or update)
   */
  save(tenantId: string, driver: Driver): Promise<Driver>;

  /**
   * Update driver location
   */
  updateLocation(
    tenantId: string,
    driverId: string,
    location: Location,
  ): Promise<void>;

  /**
   * Update driver status
   */
  updateStatus(
    tenantId: string,
    driverId: string,
    status: DriverStatus,
  ): Promise<void>;

  /**
   * Count drivers by status
   */
  countByStatus(tenantId: string, status: DriverStatus): Promise<number>;

  /**
   * Count available drivers near location
   */
  countAvailableNearLocation(
    tenantId: string,
    location: Location,
    radiusMeters: number,
  ): Promise<number>;
}

/**
 * Driver Repository Token for dependency injection
 */
export const DRIVER_REPOSITORY = Symbol('DRIVER_REPOSITORY');
