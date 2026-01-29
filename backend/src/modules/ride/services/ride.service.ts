import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../shared/database/prisma.service';
import { RedisService } from '../../../shared/redis/redis.service';
import { MetricsService } from '../../../shared/monitoring/metrics.service';
import { DriverService } from '../../driver/services/driver.service';
import { CreateRideDto, AcceptOfferDto } from '../dto/ride.dto';
import {
  RideStatus,
  RideTier,
  DriverStatus,
  OfferResponse,
  canTransition,
  RideStateTransitions,
} from '../../../shared/interfaces/common.interfaces';

interface MatchResult {
  status: 'OFFER_SENT' | 'NO_DRIVERS' | 'ALL_DRIVERS_BUSY';
  driverId?: string;
  offerId?: string;
}

interface RankedDriver {
  driverId: string;
  distance: number;
  score: number;
}

@Injectable()
export class RideService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly driverService: DriverService,
    private readonly configService: ConfigService,
    private readonly metricsService: MetricsService,
  ) {}

  /**
   * Create a new ride request
   * POST /v1/rides
   */
  async createRide(
    tenantId: string,
    dto: CreateRideDto,
    idempotencyKey?: string,
  ) {
    const prismaClient = await this.prisma.forTenant(tenantId);
    const startTime = Date.now();

    // Check for existing ride with same idempotency key
    if (idempotencyKey) {
      const existing = await prismaClient.ride.findUnique({
        where: { idempotencyKey },
      });
      if (existing) {
        return this.mapRideToCreateResponse(existing);
      }
    }

    // Validate rider exists
    const rider = await prismaClient.rider.findUnique({
      where: { id: dto.riderId },
    });
    if (!rider) {
      throw new NotFoundException('Rider not found');
    }

    // Calculate estimated fare
    const estimatedFare = this.calculateEstimatedFare(dto);

    // Create the ride
    const ride = await prismaClient.ride.create({
      data: {
        riderId: dto.riderId,
        idempotencyKey,
        pickupLatitude: dto.pickupLocation.latitude,
        pickupLongitude: dto.pickupLocation.longitude,
        pickupAddress: dto.pickupLocation.address,
        destinationLatitude: dto.destinationLocation.latitude,
        destinationLongitude: dto.destinationLocation.longitude,
        destinationAddress: dto.destinationLocation.address,
        tier: dto.tier,
        status: RideStatus.SEARCHING,
        paymentMethod: dto.paymentMethod,
        estimatedFareMin: estimatedFare.min,
        estimatedFareMax: estimatedFare.max,
        surgeMultiplier: 1.0, // TODO: Implement surge pricing
      },
    });

    // Start matching asynchronously
    this.findAndAssignDriver(tenantId, ride.id).catch((err) => {
      console.error(`Matching failed for ride ${ride.id}:`, err);
    });

    // Publish ride created event
    this.redis.publish(`tenant:${tenantId}:rides:created`, {
      rideId: ride.id,
      riderId: dto.riderId,
      timestamp: Date.now(),
    });

    const duration = Date.now() - startTime;
    console.log(`Ride ${ride.id} created in ${duration}ms`);

    // Record metrics
    this.metricsService.recordRideCreated({
      rideId: ride.id,
      tenantId,
      tier: dto.tier,
      durationMs: duration,
    });

    return this.mapRideToCreateResponse(ride);
  }

  /**
   * Get ride by ID
   * GET /v1/rides/:id
   */
  async getRide(tenantId: string, rideId: string) {
    const prismaClient = await this.prisma.forTenant(tenantId);

    const ride = await prismaClient.ride.findUnique({
      where: { id: rideId },
      include: {
        rider: true,
        driver: true,
        trip: true,
      },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    // Get driver's current location from Redis if assigned
    let driverLocation = null;
    if (ride.driverId) {
      driverLocation = await this.redis.getDriverLocation(
        tenantId,
        ride.driverId,
      );
    }

    return this.mapRideToResponse(ride, driverLocation);
  }

  /**
   * Cancel a ride
   * POST /v1/rides/:id/cancel
   */
  async cancelRide(tenantId: string, rideId: string, reason?: string) {
    const prismaClient = await this.prisma.forTenant(tenantId);

    const ride = await prismaClient.ride.findUnique({
      where: { id: rideId },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    // Check if transition is valid
    if (
      !canTransition(
        RideStateTransitions,
        ride.status as RideStatus,
        RideStatus.CANCELLED,
      )
    ) {
      throw new BadRequestException(
        `Cannot cancel ride in ${ride.status} status`,
      );
    }

    // Update ride status
    const updatedRide = await prismaClient.ride.update({
      where: { id: rideId },
      data: {
        status: RideStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
    });

    // If driver was assigned, release the lock and update their status
    if (ride.driverId) {
      await this.redis.unlockDriver(tenantId, ride.driverId, rideId);
      await this.driverService.updateDriverStatus(
        tenantId,
        ride.driverId,
        DriverStatus.AVAILABLE,
      );
    }

    // Publish cancellation event
    this.redis.publish(`tenant:${tenantId}:ride:${rideId}:cancelled`, {
      rideId,
      reason,
      timestamp: Date.now(),
    });

    // Record cancellation metrics
    this.metricsService.recordRideCancelled({
      rideId,
      tenantId,
      reason,
      stage: ride.status,
    });

    return { id: rideId, status: RideStatus.CANCELLED };
  }

  /**
   * Accept a ride offer (driver endpoint)
   * POST /v1/rides/offers/:offerId/accept
   */
  async acceptOffer(
    tenantId: string,
    offerId: string,
    driverId: string,
    dto: AcceptOfferDto,
  ) {
    const prismaClient = await this.prisma.forTenant(tenantId);

    // Get the offer
    const offer = await prismaClient.rideOffer.findUnique({
      where: { id: offerId },
      include: {
        ride: {
          include: { rider: true },
        },
      },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    // Verify the offer is for this driver
    if (offer.driverId !== driverId) {
      throw new BadRequestException('This offer is not for you');
    }

    // Check if offer is still pending
    if (offer.response) {
      throw new ConflictException('Offer has already been responded to');
    }

    // Check if offer has timed out
    const offerAge = Date.now() - offer.offeredAt.getTime();
    if (offerAge > offer.timeoutSeconds * 1000) {
      // Mark offer as timed out
      await prismaClient.rideOffer.update({
        where: { id: offerId },
        data: {
          response: OfferResponse.TIMEOUT,
          respondedAt: new Date(),
        },
      });
      throw new ConflictException('Offer has expired');
    }

    // Use transaction to ensure consistency
    const result = await prismaClient.$transaction(async (tx) => {
      // Update offer
      await tx.rideOffer.update({
        where: { id: offerId },
        data: {
          response: OfferResponse.ACCEPTED,
          respondedAt: new Date(),
        },
      });

      // Assign driver to ride
      const ride = await tx.ride.update({
        where: { id: offer.rideId },
        data: {
          driverId,
          status: RideStatus.DRIVER_ASSIGNED,
          driverAssignedAt: new Date(),
        },
      });

      // Update driver status
      await tx.driver.update({
        where: { id: driverId },
        data: { status: DriverStatus.BUSY },
      });

      // Create trip record
      const trip = await tx.trip.create({
        data: {
          rideId: ride.id,
          driverId,
          riderId: ride.riderId,
          status: 'NOT_STARTED',
        },
      });

      return { ride, trip };
    });

    // Publish acceptance event
    this.redis.publish(
      `tenant:${tenantId}:ride:${offer.rideId}:driver_assigned`,
      {
        rideId: offer.rideId,
        driverId,
        tripId: result.trip.id,
        timestamp: Date.now(),
      },
    );

    return {
      rideId: offer.rideId,
      riderId: offer.ride.riderId,
      pickup: {
        location: {
          latitude: parseFloat(offer.ride.pickupLatitude.toString()),
          longitude: parseFloat(offer.ride.pickupLongitude.toString()),
        },
        address: offer.ride.pickupAddress,
      },
      destination: {
        location: {
          latitude: parseFloat(offer.ride.destinationLatitude.toString()),
          longitude: parseFloat(offer.ride.destinationLongitude.toString()),
        },
        address: offer.ride.destinationAddress,
      },
      estimatedFare: {
        min: parseFloat(offer.ride.estimatedFareMin?.toString() || '0'),
        max: parseFloat(offer.ride.estimatedFareMax?.toString() || '0'),
      },
    };
  }

  /**
   * Decline a ride offer
   * POST /v1/rides/offers/:offerId/decline
   */
  async declineOffer(tenantId: string, offerId: string, driverId: string) {
    const prismaClient = await this.prisma.forTenant(tenantId);

    const offer = await prismaClient.rideOffer.findUnique({
      where: { id: offerId },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (offer.driverId !== driverId) {
      throw new BadRequestException('This offer is not for you');
    }

    if (offer.response) {
      throw new ConflictException('Offer has already been responded to');
    }

    // Update offer
    await prismaClient.rideOffer.update({
      where: { id: offerId },
      data: {
        response: OfferResponse.DECLINED,
        respondedAt: new Date(),
      },
    });

    // Release driver lock
    await this.redis.unlockDriver(tenantId, driverId, offer.rideId);

    // Try to find next driver
    this.findAndAssignDriver(tenantId, offer.rideId, [driverId]).catch(
      (err) => {
        console.error(
          `Failed to find next driver for ride ${offer.rideId}:`,
          err,
        );
      },
    );

    return { status: 'declined' };
  }

  /**
   * Mark driver as arrived at pickup
   * POST /v1/rides/:id/arrived
   */
  async markDriverArrived(tenantId: string, rideId: string, driverId: string) {
    const prismaClient = await this.prisma.forTenant(tenantId);

    const ride = await prismaClient.ride.findUnique({
      where: { id: rideId },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    if (ride.driverId !== driverId) {
      throw new BadRequestException('You are not assigned to this ride');
    }

    if (ride.status !== RideStatus.DRIVER_ASSIGNED) {
      throw new BadRequestException('Invalid ride status for this action');
    }

    const updatedRide = await prismaClient.ride.update({
      where: { id: rideId },
      data: {
        status: RideStatus.DRIVER_ARRIVED,
        driverArrivedAt: new Date(),
      },
    });

    // Publish event
    this.redis.publish(`tenant:${tenantId}:ride:${rideId}:driver_arrived`, {
      rideId,
      timestamp: Date.now(),
    });

    return { id: rideId, status: RideStatus.DRIVER_ARRIVED };
  }

  // =====================
  // Matching Algorithm
  // =====================

  /**
   * Find and assign a driver to a ride
   * Target: <1s p95 latency
   */
  private async findAndAssignDriver(
    tenantId: string,
    rideId: string,
    excludeDrivers: string[] = [],
  ): Promise<MatchResult> {
    const startTime = Date.now();
    const prismaClient = await this.prisma.forTenant(tenantId);

    const ride = await prismaClient.ride.findUnique({
      where: { id: rideId },
    });

    if (!ride || ride.status !== RideStatus.SEARCHING) {
      return { status: 'NO_DRIVERS' };
    }

    const config = this.configService.get('matching');

    // Step 1: Find nearby drivers (~50ms)
    const nearbyDrivers = await this.driverService.findNearbyDrivers(
      tenantId,
      parseFloat(ride.pickupLatitude.toString()),
      parseFloat(ride.pickupLongitude.toString()),
      ride.tier as RideTier,
      config.searchRadiusMeters,
      config.maxDriversToConsider,
    );

    // Filter out excluded drivers
    const eligibleDrivers = nearbyDrivers.filter(
      (d) => !excludeDrivers.includes(d.driverId),
    );

    if (eligibleDrivers.length === 0) {
      // No drivers available
      await prismaClient.ride.update({
        where: { id: rideId },
        data: { status: RideStatus.NO_DRIVERS },
      });

      this.redis.publish(`tenant:${tenantId}:ride:${rideId}:no_drivers`, {
        rideId,
        timestamp: Date.now(),
      });

      // Record matching metrics
      this.metricsService.recordMatchingAttempt({
        rideId,
        tenantId,
        durationMs: Date.now() - startTime,
        driversFound: 0,
        success: false,
      });

      return { status: 'NO_DRIVERS' };
    }

    // Step 2: Rank drivers (~20ms)
    const rankedDrivers = await this.rankDrivers(tenantId, eligibleDrivers);

    // Step 3: Try to lock and offer to best drivers
    for (const driver of rankedDrivers.slice(0, 5)) {
      const locked = await this.redis.lockDriver(
        tenantId,
        driver.driverId,
        rideId,
        config.lockTtlSeconds,
      );

      if (locked) {
        // Create offer
        const offer = await prismaClient.rideOffer.create({
          data: {
            rideId,
            driverId: driver.driverId,
            timeoutSeconds: config.offerTimeoutSeconds,
          },
        });

        // Publish offer event
        this.redis.publish(
          `tenant:${tenantId}:driver:${driver.driverId}:offer`,
          {
            offerId: offer.id,
            rideId,
            pickup: {
              latitude: parseFloat(ride.pickupLatitude.toString()),
              longitude: parseFloat(ride.pickupLongitude.toString()),
              address: ride.pickupAddress,
            },
            destination: {
              latitude: parseFloat(ride.destinationLatitude.toString()),
              longitude: parseFloat(ride.destinationLongitude.toString()),
              address: ride.destinationAddress,
            },
            tier: ride.tier,
            estimatedFare: {
              min: parseFloat(ride.estimatedFareMin?.toString() || '0'),
              max: parseFloat(ride.estimatedFareMax?.toString() || '0'),
            },
            distanceToPickup: driver.distance,
            timeoutSeconds: config.offerTimeoutSeconds,
            timestamp: Date.now(),
          },
        );

        // Schedule timeout handler
        setTimeout(async () => {
          await this.handleOfferTimeout(
            tenantId,
            offer.id,
            rideId,
            driver.driverId,
          );
        }, config.offerTimeoutSeconds * 1000);

        const duration = Date.now() - startTime;
        console.log(
          `Driver ${driver.driverId} offered for ride ${rideId} in ${duration}ms`,
        );

        // Record successful matching metrics
        this.metricsService.recordMatchingAttempt({
          rideId,
          tenantId,
          durationMs: duration,
          driversFound: eligibleDrivers.length,
          success: true,
        });

        // Record driver offer
        this.metricsService.recordDriverOffer({
          offerId: offer.id,
          rideId,
          driverId: driver.driverId,
          tenantId,
          distance: driver.distance,
        });

        return {
          status: 'OFFER_SENT',
          driverId: driver.driverId,
          offerId: offer.id,
        };
      }
    }

    return { status: 'ALL_DRIVERS_BUSY' };
  }

  /**
   * Rank drivers by score (distance, rating, acceptance rate)
   */
  private async rankDrivers(
    tenantId: string,
    drivers: Array<{ driverId: string; distance: number }>,
  ): Promise<RankedDriver[]> {
    const prismaClient = await this.prisma.forTenant(tenantId);

    // Fetch driver details
    const driverIds = drivers.map((d) => d.driverId);
    const driverDetails = await prismaClient.driver.findMany({
      where: { id: { in: driverIds } },
      select: { id: true, rating: true, acceptanceRate: true },
    });

    const detailsMap = new Map(driverDetails.map((d) => [d.id, d]));

    return drivers
      .map((d) => {
        const details = detailsMap.get(d.driverId);
        const rating = parseFloat(details?.rating?.toString() || '5.0');
        const acceptanceRate = parseFloat(
          details?.acceptanceRate?.toString() || '1.0',
        );

        // Calculate score (higher is better)
        // Distance: closer is better (max 100 points, decreases by 1 point per 50m)
        const distanceScore = Math.max(0, 100 - d.distance / 50);
        // Rating: 5.0 = 50 points
        const ratingScore = rating * 10;
        // Acceptance rate: 1.0 = 30 points
        const acceptanceScore = acceptanceRate * 30;

        const score =
          distanceScore * 0.5 + ratingScore * 0.3 + acceptanceScore * 0.2;

        return {
          driverId: d.driverId,
          distance: d.distance,
          score,
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Handle offer timeout
   */
  private async handleOfferTimeout(
    tenantId: string,
    offerId: string,
    rideId: string,
    driverId: string,
  ) {
    const prismaClient = await this.prisma.forTenant(tenantId);

    const offer = await prismaClient.rideOffer.findUnique({
      where: { id: offerId },
    });

    // If offer already responded, do nothing
    if (offer?.response) {
      return;
    }

    // Mark as timeout
    await prismaClient.rideOffer.update({
      where: { id: offerId },
      data: {
        response: OfferResponse.TIMEOUT,
        respondedAt: new Date(),
      },
    });

    // Release driver lock
    await this.redis.unlockDriver(tenantId, driverId, rideId);

    // Try to find next driver
    const previousOffers = await prismaClient.rideOffer.findMany({
      where: { rideId },
      select: { driverId: true },
    });

    const excludeDrivers = previousOffers.map((o) => o.driverId);

    this.findAndAssignDriver(tenantId, rideId, excludeDrivers).catch((err) => {
      console.error(`Failed to find next driver after timeout:`, err);
    });
  }

  // =====================
  // Fare Calculation
  // =====================

  private calculateEstimatedFare(dto: CreateRideDto): {
    min: number;
    max: number;
  } {
    const fareConfig = this.configService.get('fare');

    // Calculate distance (simple Haversine approximation)
    const distance = this.calculateDistance(
      dto.pickupLocation.latitude,
      dto.pickupLocation.longitude,
      dto.destinationLocation.latitude,
      dto.destinationLocation.longitude,
    );

    // Estimate time (assume 20 km/h average in city)
    const estimatedMinutes = (distance / 20) * 60;

    const baseFare = fareConfig.baseFare[dto.tier] || 50;
    const distanceFare = distance * fareConfig.ratePerKm;
    const timeFare = estimatedMinutes * fareConfig.ratePerMin;
    const subtotal = baseFare + distanceFare + timeFare;
    const taxes = subtotal * fareConfig.taxRate;

    const total = subtotal + taxes;

    // Return range (±15%)
    return {
      min: Math.round(total * 0.85),
      max: Math.round(total * 1.15),
    };
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // =====================
  // Response Mappers
  // =====================

  private mapRideToCreateResponse(ride: any) {
    return {
      id: ride.id,
      status: ride.status as RideStatus,
      estimatedFare: {
        min: parseFloat(ride.estimatedFareMin?.toString() || '0'),
        max: parseFloat(ride.estimatedFareMax?.toString() || '0'),
        currency: 'INR',
      },
      surgeMultiplier: parseFloat(ride.surgeMultiplier?.toString() || '1'),
      createdAt: ride.createdAt,
    };
  }

  private mapRideToResponse(ride: any, driverLocation: any) {
    const response: any = {
      id: ride.id,
      status: ride.status as RideStatus,
      rider: {
        id: ride.rider.id,
        name: ride.rider.name,
      },
      pickup: {
        location: {
          latitude: parseFloat(ride.pickupLatitude.toString()),
          longitude: parseFloat(ride.pickupLongitude.toString()),
        },
        address: ride.pickupAddress,
      },
      destination: {
        location: {
          latitude: parseFloat(ride.destinationLatitude.toString()),
          longitude: parseFloat(ride.destinationLongitude.toString()),
        },
        address: ride.destinationAddress,
      },
      tier: ride.tier as RideTier,
      estimatedFare: {
        min: parseFloat(ride.estimatedFareMin?.toString() || '0'),
        max: parseFloat(ride.estimatedFareMax?.toString() || '0'),
        currency: 'INR',
      },
      surgeMultiplier: parseFloat(ride.surgeMultiplier?.toString() || '1'),
      createdAt: ride.createdAt,
      updatedAt: ride.updatedAt,
    };

    if (ride.driver) {
      response.driver = {
        id: ride.driver.id,
        name: ride.driver.name,
        phone: ride.driver.phone,
        vehicleNumber: ride.driver.vehicleNumber,
        rating: parseFloat(ride.driver.rating?.toString() || '5'),
        currentLocation: driverLocation
          ? {
              latitude: driverLocation.latitude,
              longitude: driverLocation.longitude,
            }
          : null,
      };
    }

    if (ride.trip) {
      response.trip = {
        id: ride.trip.id,
        status: ride.trip.status,
      };

      if (ride.trip.totalFare) {
        response.trip.fare = {
          baseFare: parseFloat(ride.trip.baseFare?.toString() || '0'),
          distanceFare: parseFloat(ride.trip.distanceFare?.toString() || '0'),
          timeFare: parseFloat(ride.trip.timeFare?.toString() || '0'),
          surgeAmount: parseFloat(ride.trip.surgeAmount?.toString() || '0'),
          taxes: parseFloat(ride.trip.taxes?.toString() || '0'),
          total: parseFloat(ride.trip.totalFare?.toString() || '0'),
          currency: 'INR',
        };
      }
    }

    return response;
  }
}
