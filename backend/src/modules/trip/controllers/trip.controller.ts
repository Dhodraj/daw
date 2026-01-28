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
import { TripService } from '../services/trip.service';
import { StartTripDto, EndTripDto } from '../dto/trip.dto';
import { TenantId } from '../../../shared/decorators/tenant.decorator';

@Controller('v1/trips')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  /**
   * Get trip by ID
   * GET /v1/trips/:id
   */
  @Get(':id')
  async getTrip(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) tripId: string,
  ) {
    return this.tripService.getTrip(tenantId, tripId);
  }

  /**
   * Start a trip (pickup complete, journey begins)
   * POST /v1/trips/:id/start
   */
  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  async startTrip(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) tripId: string,
    @Body() dto: StartTripDto,
  ) {
    return this.tripService.startTrip(tenantId, tripId, dto);
  }

  /**
   * End a trip and trigger fare calculation
   * POST /v1/trips/:id/end
   */
  @Post(':id/end')
  @HttpCode(HttpStatus.OK)
  async endTrip(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) tripId: string,
    @Body() dto: EndTripDto,
    @Headers('x-idempotency-key') idempotencyKey?: string,
  ) {
    return this.tripService.endTrip(tenantId, tripId, dto, idempotencyKey);
  }

  /**
   * Pause a trip (for stops)
   * POST /v1/trips/:id/pause
   */
  @Post(':id/pause')
  @HttpCode(HttpStatus.OK)
  async pauseTrip(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) tripId: string,
  ) {
    return this.tripService.pauseTrip(tenantId, tripId);
  }

  /**
   * Resume a paused trip
   * POST /v1/trips/:id/resume
   */
  @Post(':id/resume')
  @HttpCode(HttpStatus.OK)
  async resumeTrip(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) tripId: string,
  ) {
    return this.tripService.resumeTrip(tenantId, tripId);
  }
}
