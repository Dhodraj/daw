import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { DriverService } from '../services/driver.service';
import {
  CreateDriverDto,
  UpdateLocationDto,
  UpdateDriverStatusDto,
  AcceptRideDto,
} from '../dto/driver.dto';
import { TenantId } from '../../../shared/decorators/tenant.decorator';
import { RideTier } from '../../../shared/interfaces/common.interfaces';

@Controller('v1/drivers')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  /**
   * Create a new driver
   * POST /v1/drivers
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createDriver(
    @TenantId() tenantId: string,
    @Body() dto: CreateDriverDto,
  ) {
    return this.driverService.createDriver(tenantId, dto);
  }

  /**
   * Get driver by ID
   * GET /v1/drivers/:id
   */
  @Get(':id')
  async getDriver(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) driverId: string,
  ) {
    return this.driverService.getDriver(tenantId, driverId);
  }

  /**
   * Get driver's trip history
   * GET /v1/drivers/:id/trips
   */
  @Get(':id/trips')
  async getDriverTrips(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) driverId: string,
    @Query('limit') limit?: number,
  ) {
    return this.driverService.getDriverTrips(tenantId, driverId, limit || 20);
  }

  /**
   * Get driver's earnings
   * GET /v1/drivers/:id/earnings
   */
  @Get(':id/earnings')
  async getDriverEarnings(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) driverId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.driverService.getDriverEarnings(
      tenantId,
      driverId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  /**
   * Update driver location
   * POST /v1/drivers/:id/location
   *
   * This is a high-throughput endpoint handling ~200k requests/sec
   * Response: 202 Accepted (fire-and-forget pattern)
   */
  @Post(':id/location')
  @HttpCode(HttpStatus.ACCEPTED)
  async updateLocation(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) driverId: string,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.driverService.updateLocation(tenantId, driverId, dto);
  }

  /**
   * Update driver status (go online/offline)
   * PUT /v1/drivers/:id/status
   */
  @Put(':id/status')
  async updateStatus(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) driverId: string,
    @Body() dto: UpdateDriverStatusDto,
  ) {
    return this.driverService.updateDriverStatus(
      tenantId,
      driverId,
      dto.status,
    );
  }

  /**
   * Accept a ride offer
   * POST /v1/drivers/:id/accept
   *
   * Note: The actual implementation is in the Ride module
   * This endpoint redirects to the ride acceptance flow
   */
  @Post(':id/accept')
  @HttpCode(HttpStatus.OK)
  async acceptRide(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) driverId: string,
    @Body() dto: AcceptRideDto,
  ) {
    // This will be handled by the RideService
    // Importing RideService here would create circular dependency
    // So we expose it via a separate endpoint in RideController
    // This is a placeholder that returns an error directing to the correct endpoint
    return {
      message: 'Use POST /v1/rides/offers/:offerId/accept instead',
      offerId: dto.offerId,
    };
  }

  /**
   * Get all available drivers (admin endpoint)
   * GET /v1/drivers/available
   */
  @Get()
  async getAvailableDrivers(
    @TenantId() tenantId: string,
    @Query('tier') tier?: RideTier,
  ) {
    return this.driverService.getAvailableDrivers(tenantId, tier);
  }
}
