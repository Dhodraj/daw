import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RideService } from '../services/ride.service';
import {
  CreateRideDto,
  CancelRideDto,
  AcceptOfferDto,
} from '../dto/ride.dto';
import { TenantId } from '../../../shared/decorators/tenant.decorator';

@Controller('v1/rides')
export class RideController {
  constructor(private readonly rideService: RideService) {}

  /**
   * Create a new ride request
   * POST /v1/rides
   *
   * Response: 202 Accepted
   */
  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async createRide(
    @TenantId() tenantId: string,
    @Body() dto: CreateRideDto,
    @Headers('x-idempotency-key') idempotencyKey?: string,
  ) {
    return this.rideService.createRide(tenantId, dto, idempotencyKey);
  }

  /**
   * Get ride status
   * GET /v1/rides/:id
   */
  @Get(':id')
  async getRide(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) rideId: string,
  ) {
    return this.rideService.getRide(tenantId, rideId);
  }

  /**
   * Cancel a ride
   * POST /v1/rides/:id/cancel
   */
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelRide(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) rideId: string,
    @Body() dto: CancelRideDto,
  ) {
    return this.rideService.cancelRide(tenantId, rideId, dto.reason);
  }

  /**
   * Mark driver as arrived at pickup
   * POST /v1/rides/:id/arrived
   */
  @Post(':id/arrived')
  @HttpCode(HttpStatus.OK)
  async markDriverArrived(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) rideId: string,
    @Headers('x-driver-id') driverId: string,
  ) {
    return this.rideService.markDriverArrived(tenantId, rideId, driverId);
  }

  /**
   * Accept a ride offer (driver endpoint)
   * POST /v1/rides/offers/:offerId/accept
   */
  @Post('offers/:offerId/accept')
  @HttpCode(HttpStatus.OK)
  async acceptOffer(
    @TenantId() tenantId: string,
    @Param('offerId', ParseUUIDPipe) offerId: string,
    @Headers('x-driver-id') driverId: string,
    @Body() dto: AcceptOfferDto,
  ) {
    return this.rideService.acceptOffer(tenantId, offerId, driverId, dto);
  }

  /**
   * Decline a ride offer (driver endpoint)
   * POST /v1/rides/offers/:offerId/decline
   */
  @Post('offers/:offerId/decline')
  @HttpCode(HttpStatus.OK)
  async declineOffer(
    @TenantId() tenantId: string,
    @Param('offerId', ParseUUIDPipe) offerId: string,
    @Headers('x-driver-id') driverId: string,
  ) {
    return this.rideService.declineOffer(tenantId, offerId, driverId);
  }
}
