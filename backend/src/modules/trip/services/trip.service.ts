import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../shared/database/prisma.service';
import { RedisService } from '../../../shared/redis/redis.service';
import { MetricsService } from '../../../shared/monitoring/metrics.service';
import { StartTripDto, EndTripDto } from '../dto/trip.dto';
import {
  TripStatus,
  RideStatus,
  DriverStatus,
  canTransition,
  TripStateTransitions,
  FareBreakdown,
} from '../../../shared/interfaces/common.interfaces';

@Injectable()
export class TripService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly configService: ConfigService,
    private readonly metricsService: MetricsService,
  ) {}

  /**
   * Start a trip (pickup complete, journey begins)
   * POST /v1/trips/:id/start
   */
  async startTrip(tenantId: string, tripId: string, dto: StartTripDto) {
    const prismaClient = await this.prisma.forTenant(tenantId);

    const trip = await prismaClient.trip.findUnique({
      where: { id: tripId },
      include: { ride: true },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.status !== TripStatus.NOT_STARTED) {
      throw new BadRequestException('Trip has already started');
    }

    // Verify ride is in correct state
    if (trip.ride.status !== RideStatus.DRIVER_ARRIVED) {
      throw new BadRequestException('Driver must arrive at pickup first');
    }

    // Update trip and ride status
    const [updatedTrip] = await prismaClient.$transaction([
      prismaClient.trip.update({
        where: { id: tripId },
        data: {
          status: TripStatus.IN_PROGRESS,
          startLatitude: dto.startLocation.latitude,
          startLongitude: dto.startLocation.longitude,
          startedAt: new Date(),
        },
      }),
      prismaClient.ride.update({
        where: { id: trip.rideId },
        data: { status: RideStatus.IN_PROGRESS },
      }),
      prismaClient.driver.update({
        where: { id: trip.driverId },
        data: { status: DriverStatus.ON_TRIP },
      }),
    ]);

    // Publish event
    this.redis.publish(`tenant:${tenantId}:ride:${trip.rideId}:trip_started`, {
      tripId,
      rideId: trip.rideId,
      startLocation: dto.startLocation,
      timestamp: Date.now(),
    });

    return this.mapTripToResponse(updatedTrip);
  }

  /**
   * End a trip and calculate fare
   * POST /v1/trips/:id/end
   */
  async endTrip(
    tenantId: string,
    tripId: string,
    dto: EndTripDto,
    idempotencyKey?: string,
  ) {
    const prismaClient = await this.prisma.forTenant(tenantId);

    const trip = await prismaClient.trip.findUnique({
      where: { id: tripId },
      include: { ride: true },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    // Check idempotency - if trip already completed, return existing data
    if (trip.status === TripStatus.COMPLETED) {
      return this.mapTripToResponse(trip);
    }

    if (
      !canTransition(
        TripStateTransitions,
        trip.status as TripStatus,
        TripStatus.COMPLETED,
      )
    ) {
      throw new BadRequestException(`Cannot end trip in ${trip.status} status`);
    }

    // Calculate fare
    const fare = this.calculateFare(trip, dto);

    // Calculate actual distance and duration
    const distanceMeters =
      dto.actualDistanceMeters ||
      this.calculateDistanceMeters(
        parseFloat(
          trip.startLatitude?.toString() || trip.ride.pickupLatitude.toString(),
        ),
        parseFloat(
          trip.startLongitude?.toString() ||
            trip.ride.pickupLongitude.toString(),
        ),
        dto.endLocation.latitude,
        dto.endLocation.longitude,
      );

    const durationSeconds = trip.startedAt
      ? Math.floor((Date.now() - trip.startedAt.getTime()) / 1000)
      : 0;

    // Update trip, ride, and driver in a transaction
    const [updatedTrip] = await prismaClient.$transaction([
      prismaClient.trip.update({
        where: { id: tripId },
        data: {
          status: TripStatus.COMPLETED,
          endLatitude: dto.endLocation.latitude,
          endLongitude: dto.endLocation.longitude,
          distanceMeters,
          durationSeconds,
          baseFare: fare.baseFare,
          distanceFare: fare.distanceFare,
          timeFare: fare.timeFare,
          surgeAmount: fare.surgeAmount,
          taxes: fare.taxes,
          totalFare: fare.total,
          endedAt: new Date(),
        },
      }),
      prismaClient.ride.update({
        where: { id: trip.rideId },
        data: { status: RideStatus.COMPLETED },
      }),
      prismaClient.driver.update({
        where: { id: trip.driverId },
        data: { status: DriverStatus.AVAILABLE },
      }),
    ]);

    // Release driver lock
    await this.redis.unlockDriver(tenantId, trip.driverId, trip.rideId);

    // Publish event
    this.redis.publish(`tenant:${tenantId}:ride:${trip.rideId}:completed`, {
      tripId,
      rideId: trip.rideId,
      fare,
      distance: { meters: distanceMeters },
      duration: { seconds: durationSeconds },
      timestamp: Date.now(),
    });

    // Record ride completion metrics
    this.metricsService.recordRideCompleted({
      rideId: trip.rideId,
      tenantId,
      tier: trip.ride.tier,
      fareAmount: fare.total,
      distanceMeters,
      durationSeconds,
    });

    return {
      ...this.mapTripToResponse({
        ...updatedTrip,
        distanceMeters,
        durationSeconds,
      }),
      receiptUrl: `/v1/trips/${tripId}/receipt`,
    };
  }

  /**
   * Get trip by ID
   */
  async getTrip(tenantId: string, tripId: string) {
    const prismaClient = await this.prisma.forTenant(tenantId);

    const trip = await prismaClient.trip.findUnique({
      where: { id: tripId },
      include: {
        ride: true,
        driver: true,
        rider: true,
      },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    return this.mapTripToResponse(trip);
  }

  /**
   * Pause a trip (for stops)
   */
  async pauseTrip(tenantId: string, tripId: string) {
    const prismaClient = await this.prisma.forTenant(tenantId);

    const trip = await prismaClient.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.status !== TripStatus.IN_PROGRESS) {
      throw new BadRequestException('Can only pause an in-progress trip');
    }

    const updatedTrip = await prismaClient.trip.update({
      where: { id: tripId },
      data: {
        status: TripStatus.PAUSED,
        pausedAt: new Date(),
      },
    });

    return this.mapTripToResponse(updatedTrip);
  }

  /**
   * Resume a paused trip
   */
  async resumeTrip(tenantId: string, tripId: string) {
    const prismaClient = await this.prisma.forTenant(tenantId);

    const trip = await prismaClient.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.status !== TripStatus.PAUSED) {
      throw new BadRequestException('Can only resume a paused trip');
    }

    const updatedTrip = await prismaClient.trip.update({
      where: { id: tripId },
      data: {
        status: TripStatus.IN_PROGRESS,
        pausedAt: null,
      },
    });

    return this.mapTripToResponse(updatedTrip);
  }

  // =====================
  // Fare Calculation
  // =====================

  private calculateFare(trip: any, dto: EndTripDto): FareBreakdown {
    const fareConfig = this.configService.get('fare');
    const tier = trip.ride.tier;

    // Calculate distance
    const distanceKm = dto.actualDistanceMeters
      ? dto.actualDistanceMeters / 1000
      : this.calculateDistanceKm(
          parseFloat(
            trip.startLatitude?.toString() ||
              trip.ride.pickupLatitude.toString(),
          ),
          parseFloat(
            trip.startLongitude?.toString() ||
              trip.ride.pickupLongitude.toString(),
          ),
          dto.endLocation.latitude,
          dto.endLocation.longitude,
        );

    // Calculate duration in minutes
    const durationMinutes = trip.startedAt
      ? (Date.now() - trip.startedAt.getTime()) / 60000
      : 0;

    // Get base fare for tier
    const baseFare = fareConfig.baseFare[tier] || 50;

    // Calculate components
    const distanceFare =
      Math.round(distanceKm * fareConfig.ratePerKm * 100) / 100;
    const timeFare =
      Math.round(durationMinutes * fareConfig.ratePerMin * 100) / 100;

    // Get surge multiplier from ride
    const surgeMultiplier = parseFloat(
      trip.ride.surgeMultiplier?.toString() || '1',
    );
    const subtotal = baseFare + distanceFare + timeFare;
    const surgeAmount =
      Math.round(subtotal * (surgeMultiplier - 1) * 100) / 100;

    const subtotalWithSurge = subtotal + surgeAmount;
    const taxes =
      Math.round(subtotalWithSurge * fareConfig.taxRate * 100) / 100;
    const total = Math.round((subtotalWithSurge + taxes) * 100) / 100;

    return {
      baseFare,
      distanceFare,
      timeFare,
      surgeAmount,
      taxes,
      total,
      currency: 'INR',
    };
  }

  private calculateDistanceKm(
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

  private calculateDistanceMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    return Math.round(this.calculateDistanceKm(lat1, lon1, lat2, lon2) * 1000);
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // =====================
  // Response Mapper
  // =====================

  private mapTripToResponse(trip: any) {
    const response: any = {
      id: trip.id,
      rideId: trip.rideId,
      status: trip.status as TripStatus,
      startedAt: trip.startedAt,
      endedAt: trip.endedAt,
    };

    if (trip.totalFare) {
      response.fare = {
        baseFare: parseFloat(trip.baseFare?.toString() || '0'),
        distanceFare: parseFloat(trip.distanceFare?.toString() || '0'),
        timeFare: parseFloat(trip.timeFare?.toString() || '0'),
        surgeAmount: parseFloat(trip.surgeAmount?.toString() || '0'),
        taxes: parseFloat(trip.taxes?.toString() || '0'),
        total: parseFloat(trip.totalFare?.toString() || '0'),
        currency: 'INR',
      };
    }

    if (trip.distanceMeters) {
      response.distance = {
        meters: trip.distanceMeters,
        displayText: `${(trip.distanceMeters / 1000).toFixed(1)} km`,
      };
    }

    if (trip.durationSeconds) {
      response.duration = {
        seconds: trip.durationSeconds,
        displayText: this.formatDuration(trip.durationSeconds),
      };
    }

    return response;
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  }
}
