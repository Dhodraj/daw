import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { CreateRiderDto, UpdateRiderDto } from '../dto/rider.dto';
import { PaymentMethod } from '../../../shared/interfaces/common.interfaces';

@Injectable()
export class RiderService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new rider
   */
  async createRider(tenantId: string, dto: CreateRiderDto) {
    const prismaClient = await this.prisma.forTenant(tenantId);

    // Check if phone already exists
    const existing = await prismaClient.rider.findUnique({
      where: { phone: dto.phone },
    });

    if (existing) {
      throw new ConflictException('Rider with this phone already exists');
    }

    const rider = await prismaClient.rider.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        defaultPaymentMethod: dto.defaultPaymentMethod || PaymentMethod.CASH,
      },
    });

    return this.mapRiderToResponse(rider);
  }

  /**
   * Get rider by ID
   */
  async getRider(tenantId: string, riderId: string) {
    const prismaClient = await this.prisma.forTenant(tenantId);

    const rider = await prismaClient.rider.findUnique({
      where: { id: riderId },
    });

    if (!rider) {
      throw new NotFoundException('Rider not found');
    }

    return this.mapRiderToResponse(rider);
  }

  /**
   * Get rider by phone
   */
  async getRiderByPhone(tenantId: string, phone: string) {
    const prismaClient = await this.prisma.forTenant(tenantId);

    const rider = await prismaClient.rider.findUnique({
      where: { phone },
    });

    if (!rider) {
      throw new NotFoundException('Rider not found');
    }

    return this.mapRiderToResponse(rider);
  }

  /**
   * Update rider
   */
  async updateRider(tenantId: string, riderId: string, dto: UpdateRiderDto) {
    const prismaClient = await this.prisma.forTenant(tenantId);

    const rider = await prismaClient.rider.findUnique({
      where: { id: riderId },
    });

    if (!rider) {
      throw new NotFoundException('Rider not found');
    }

    const updatedRider = await prismaClient.rider.update({
      where: { id: riderId },
      data: {
        name: dto.name,
        email: dto.email,
        defaultPaymentMethod: dto.defaultPaymentMethod,
        updatedAt: new Date(),
      },
    });

    return this.mapRiderToResponse(updatedRider);
  }

  /**
   * Get all riders (for admin/testing)
   */
  async getAllRiders(tenantId: string, limit: number = 100) {
    const prismaClient = await this.prisma.forTenant(tenantId);

    const riders = await prismaClient.rider.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return riders.map((r) => this.mapRiderToResponse(r));
  }

  /**
   * Get rider's ride history
   */
  async getRiderRides(tenantId: string, riderId: string, limit: number = 20) {
    const prismaClient = await this.prisma.forTenant(tenantId);

    const rides = await prismaClient.ride.findMany({
      where: { riderId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            vehicleNumber: true,
            rating: true,
          },
        },
        trip: {
          select: {
            id: true,
            status: true,
            totalFare: true,
            distanceMeters: true,
            durationSeconds: true,
          },
        },
      },
    });

    return rides.map((ride) => ({
      id: ride.id,
      status: ride.status,
      tier: ride.tier,
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
      driver: ride.driver
        ? {
            id: ride.driver.id,
            name: ride.driver.name,
            vehicleNumber: ride.driver.vehicleNumber,
            rating: parseFloat(ride.driver.rating?.toString() || '5'),
          }
        : null,
      trip: ride.trip
        ? {
            id: ride.trip.id,
            status: ride.trip.status,
            fare: ride.trip.totalFare
              ? parseFloat(ride.trip.totalFare.toString())
              : null,
            distance: ride.trip.distanceMeters,
            duration: ride.trip.durationSeconds,
          }
        : null,
      createdAt: ride.createdAt,
    }));
  }

  private mapRiderToResponse(rider: any) {
    return {
      id: rider.id,
      name: rider.name,
      phone: rider.phone,
      email: rider.email,
      defaultPaymentMethod: rider.defaultPaymentMethod as PaymentMethod,
      rating: parseFloat(rider.rating?.toString() || '5.0'),
      createdAt: rider.createdAt,
      updatedAt: rider.updatedAt,
    };
  }
}
