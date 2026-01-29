import { Ride, RideStatus } from '../entities';

/**
 * Ride Repository Interface
 * Defines the contract for ride persistence operations
 */
export interface IRideRepository {
  /**
   * Find a ride by ID
   */
  findById(tenantId: string, id: string): Promise<Ride | null>;

  /**
   * Find a ride by idempotency key
   */
  findByIdempotencyKey(tenantId: string, key: string): Promise<Ride | null>;

  /**
   * Find rides by rider ID
   */
  findByRiderId(
    tenantId: string,
    riderId: string,
    options?: { status?: RideStatus[]; limit?: number; offset?: number },
  ): Promise<Ride[]>;

  /**
   * Find rides by driver ID
   */
  findByDriverId(
    tenantId: string,
    driverId: string,
    options?: { status?: RideStatus[]; limit?: number; offset?: number },
  ): Promise<Ride[]>;

  /**
   * Find active ride for a rider
   */
  findActiveByRiderId(tenantId: string, riderId: string): Promise<Ride | null>;

  /**
   * Find active ride for a driver
   */
  findActiveByDriverId(
    tenantId: string,
    driverId: string,
  ): Promise<Ride | null>;

  /**
   * Find rides by status
   */
  findByStatus(
    tenantId: string,
    status: RideStatus[],
    options?: { limit?: number; offset?: number },
  ): Promise<Ride[]>;

  /**
   * Save a ride (create or update)
   */
  save(tenantId: string, ride: Ride): Promise<Ride>;

  /**
   * Delete a ride
   */
  delete(tenantId: string, id: string): Promise<void>;

  /**
   * Count rides by status
   */
  countByStatus(tenantId: string, status: RideStatus): Promise<number>;
}

/**
 * Ride Repository Token for dependency injection
 */
export const RIDE_REPOSITORY = Symbol('RIDE_REPOSITORY');
