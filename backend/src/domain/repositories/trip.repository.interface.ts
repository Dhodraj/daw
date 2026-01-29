import { Trip, TripStatus } from '../entities';

/**
 * Trip Repository Interface
 * Defines the contract for trip persistence operations
 */
export interface ITripRepository {
  /**
   * Find a trip by ID
   */
  findById(tenantId: string, id: string): Promise<Trip | null>;

  /**
   * Find a trip by ride ID
   */
  findByRideId(tenantId: string, rideId: string): Promise<Trip | null>;

  /**
   * Find trips by driver ID
   */
  findByDriverId(
    tenantId: string,
    driverId: string,
    options?: { status?: TripStatus[]; limit?: number; offset?: number },
  ): Promise<Trip[]>;

  /**
   * Find trips by rider ID
   */
  findByRiderId(
    tenantId: string,
    riderId: string,
    options?: { status?: TripStatus[]; limit?: number; offset?: number },
  ): Promise<Trip[]>;

  /**
   * Find active trip for a driver
   */
  findActiveByDriverId(
    tenantId: string,
    driverId: string,
  ): Promise<Trip | null>;

  /**
   * Find active trip for a rider
   */
  findActiveByRiderId(tenantId: string, riderId: string): Promise<Trip | null>;

  /**
   * Save a trip (create or update)
   */
  save(tenantId: string, trip: Trip): Promise<Trip>;

  /**
   * Get trip count for a driver
   */
  countByDriverId(tenantId: string, driverId: string): Promise<number>;

  /**
   * Get trip count for a rider
   */
  countByRiderId(tenantId: string, riderId: string): Promise<number>;

  /**
   * Get total earnings for a driver
   */
  getTotalEarnings(
    tenantId: string,
    driverId: string,
    options?: { fromDate?: Date; toDate?: Date },
  ): Promise<number>;
}

/**
 * Trip Repository Token for dependency injection
 */
export const TRIP_REPOSITORY = Symbol('TRIP_REPOSITORY');
