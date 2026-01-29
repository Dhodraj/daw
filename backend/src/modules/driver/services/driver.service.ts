import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { RedisService } from '../../../shared/redis/redis.service';
import { MetricsService } from '../../../shared/monitoring/metrics.service';
import {
  CreateDriverDto,
  UpdateLocationDto,
  UpdateDriverStatusDto,
} from '../dto/driver.dto';
import {
  DriverStatus,
  RideTier,
} from '../../../shared/interfaces/common.interfaces';

@Injectable()
export class DriverService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly metricsService: MetricsService,
  ) {}

  /**
   * Create a new driver
   */
  async createDriver(tenantId: string, dto: CreateDriverDto) {
    const prismaClient = await this.prisma.forTenant(tenantId);

    // Check if phone already exists
    const existing = await prismaClient.driver.findUnique({
      where: { phone: dto.phone },
    });

    if (existing) {
      throw new ConflictException('Driver with this phone already exists');
    }

    const driver = await prismaClient.driver.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        vehicleNumber: dto.vehicleNumber,
        vehicleType: dto.vehicleType,
        status: DriverStatus.OFFLINE,
      },
    });

    return this.mapDriverToResponse(driver);
  }

  /**
   * Get driver by ID
   */
  async getDriver(tenantId: string, driverId: string) {
    const prismaClient = await this.prisma.forTenant(tenantId);

    const driver = await prismaClient.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    // Get current location from Redis
    const location = await this.redis.getDriverLocation(tenantId, driverId);

    return {
      ...this.mapDriverToResponse(driver),
      currentLocation: location
        ? { latitude: location.latitude, longitude: location.longitude }
        : null,
    };
  }

  /**
   * Update driver's location - Critical path, must be fast
   * Target: <50ms p95
   */
  async updateLocation(
    tenantId: string,
    driverId: string,
    dto: UpdateLocationDto,
  ): Promise<{ acknowledged: boolean }> {
    const startTime = Date.now();

    // First, verify driver exists and get their info (cached or from DB)
    const driver = await this.getDriverBasicInfo(tenantId, driverId);

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    // Pipeline Redis operations for efficiency
    const promises: Promise<any>[] = [];

    // 1. Update geospatial index for driver's vehicle type
    promises.push(
      this.redis.geoAdd(
        tenantId,
        driver.vehicleType,
        driverId,
        dto.longitude,
        dto.latitude,
      ),
    );

    // 2. Store detailed location data
    promises.push(
      this.redis.setDriverLocation(
        tenantId,
        driverId,
        {
          latitude: dto.latitude,
          longitude: dto.longitude,
          heading: dto.heading,
          speed: dto.speed,
        },
        120, // 2 minute TTL
      ),
    );

    // 3. If driver was offline, update status to available
    if (driver.status === DriverStatus.OFFLINE) {
      promises.push(
        this.updateDriverStatus(tenantId, driverId, DriverStatus.AVAILABLE),
      );
    }

    // Execute all operations in parallel
    await Promise.all(promises);

    // Publish location update event for real-time subscribers
    this.redis.publish(`tenant:${tenantId}:driver:${driverId}:location`, {
      driverId,
      location: {
        latitude: dto.latitude,
        longitude: dto.longitude,
        heading: dto.heading,
        speed: dto.speed,
      },
      timestamp: Date.now(),
    });

    // Record location update metrics
    const duration = Date.now() - startTime;
    this.metricsService.recordLocationUpdate({
      driverId,
      tenantId,
      durationMs: duration,
    });

    return { acknowledged: true };
  }

  /**
   * Update driver status
   */
  async updateDriverStatus(
    tenantId: string,
    driverId: string,
    status: DriverStatus,
  ) {
    const prismaClient = await this.prisma.forTenant(tenantId);

    const driver = await prismaClient.driver.update({
      where: { id: driverId },
      data: {
        status,
        updatedAt: new Date(),
      },
    });

    // If going offline, remove from geo index
    if (status === DriverStatus.OFFLINE) {
      await this.redis.geoRemove(tenantId, driverId);
    }

    // Publish status change event
    this.redis.publish(`tenant:${tenantId}:driver:${driverId}:status`, {
      driverId,
      status,
      timestamp: Date.now(),
    });

    return this.mapDriverToResponse(driver);
  }

  /**
   * Get basic driver info (with caching for location updates)
   */
  private async getDriverBasicInfo(
    tenantId: string,
    driverId: string,
  ): Promise<{ id: string; vehicleType: string; status: string } | null> {
    // Try to get from Redis cache first
    const cacheKey = `tenant:${tenantId}:driver:info:${driverId}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from database
    const prismaClient = await this.prisma.forTenant(tenantId);
    const driver = await prismaClient.driver.findUnique({
      where: { id: driverId },
      select: { id: true, vehicleType: true, status: true },
    });

    if (driver) {
      // Cache for 5 minutes
      await this.redis.set(cacheKey, JSON.stringify(driver), 300);
    }

    return driver;
  }

  /**
   * Get all available drivers (for admin/debug)
   */
  async getAvailableDrivers(tenantId: string, tier?: RideTier) {
    const prismaClient = await this.prisma.forTenant(tenantId);

    const where: any = {
      status: DriverStatus.AVAILABLE,
    };

    if (tier) {
      where.vehicleType = tier;
    }

    const drivers = await prismaClient.driver.findMany({
      where,
      take: 100,
    });

    return drivers.map((d) => this.mapDriverToResponse(d));
  }

  /**
   * Find nearby available drivers
   */
  async findNearbyDrivers(
    tenantId: string,
    latitude: number,
    longitude: number,
    tier: RideTier,
    radiusMeters: number = 5000,
    limit: number = 20,
  ): Promise<Array<{ driverId: string; distance: number }>> {
    // Use Redis geospatial search
    const nearbyDrivers = await this.redis.geoSearch(
      tenantId,
      tier,
      longitude,
      latitude,
      radiusMeters,
      limit,
    );

    // Filter out locked drivers
    const availableDrivers: Array<{ driverId: string; distance: number }> = [];

    for (const driver of nearbyDrivers) {
      const isLocked = await this.redis.isDriverLocked(
        tenantId,
        driver.driverId,
      );
      if (!isLocked) {
        availableDrivers.push(driver);
      }
    }

    return availableDrivers;
  }

  /**
   * Get driver's trip history
   */
  async getDriverTrips(tenantId: string, driverId: string, limit: number = 20) {
    const prismaClient = await this.prisma.forTenant(tenantId);

    const trips = await prismaClient.trip.findMany({
      where: { driverId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        ride: {
          select: {
            id: true,
            pickupAddress: true,
            destinationAddress: true,
            tier: true,
            surgeMultiplier: true,
          },
        },
        rider: {
          select: {
            id: true,
            name: true,
            rating: true,
          },
        },
      },
    });

    return trips.map((trip) => ({
      id: trip.id,
      rideId: trip.rideId,
      status: trip.status,
      pickup: trip.ride.pickupAddress,
      dropoff: trip.ride.destinationAddress,
      tier: trip.ride.tier,
      fare: trip.totalFare ? parseFloat(trip.totalFare.toString()) : null,
      distance: trip.distanceMeters,
      duration: trip.durationSeconds,
      surgeMultiplier: parseFloat(trip.ride.surgeMultiplier.toString()),
      rider: {
        id: trip.rider.id,
        name: trip.rider.name,
        rating: parseFloat(trip.rider.rating?.toString() || '5'),
      },
      startedAt: trip.startedAt,
      endedAt: trip.endedAt,
      createdAt: trip.createdAt,
    }));
  }

  /**
   * Get driver's earnings summary
   */
  async getDriverEarnings(
    tenantId: string,
    driverId: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const prismaClient = await this.prisma.forTenant(tenantId);

    const where: any = {
      driverId,
      status: 'COMPLETED',
    };

    if (startDate || endDate) {
      where.endedAt = {};
      if (startDate) where.endedAt.gte = startDate;
      if (endDate) where.endedAt.lte = endDate;
    }

    const trips = await prismaClient.trip.findMany({
      where,
      select: {
        totalFare: true,
        endedAt: true,
      },
    });

    const totalEarnings = trips.reduce(
      (sum, trip) =>
        sum + (trip.totalFare ? parseFloat(trip.totalFare.toString()) : 0),
      0,
    );

    return {
      totalEarnings,
      tripCount: trips.length,
      trips: trips.map((t) => ({
        fare: t.totalFare ? parseFloat(t.totalFare.toString()) : 0,
        date: t.endedAt,
      })),
    };
  }

  private mapDriverToResponse(driver: any) {
    return {
      id: driver.id,
      name: driver.name,
      phone: driver.phone,
      email: driver.email,
      vehicleNumber: driver.vehicleNumber,
      vehicleType: driver.vehicleType as RideTier,
      status: driver.status as DriverStatus,
      rating: parseFloat(driver.rating?.toString() || '5.0'),
      acceptanceRate: parseFloat(driver.acceptanceRate?.toString() || '1.0'),
      createdAt: driver.createdAt,
      updatedAt: driver.updatedAt,
    };
  }
}
