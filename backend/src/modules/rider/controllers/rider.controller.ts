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
import { RiderService } from '../services/rider.service';
import { CreateRiderDto, UpdateRiderDto } from '../dto/rider.dto';
import { TenantId } from '../../../shared/decorators/tenant.decorator';

@Controller('v1/riders')
export class RiderController {
  constructor(private readonly riderService: RiderService) {}

  /**
   * Create a new rider
   * POST /v1/riders
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createRider(@TenantId() tenantId: string, @Body() dto: CreateRiderDto) {
    return this.riderService.createRider(tenantId, dto);
  }

  /**
   * Get rider by ID
   * GET /v1/riders/:id
   */
  @Get(':id')
  async getRider(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) riderId: string,
  ) {
    return this.riderService.getRider(tenantId, riderId);
  }

  /**
   * Update rider
   * PUT /v1/riders/:id
   */
  @Put(':id')
  async updateRider(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) riderId: string,
    @Body() dto: UpdateRiderDto,
  ) {
    return this.riderService.updateRider(tenantId, riderId, dto);
  }

  /**
   * Get all riders (admin endpoint)
   * GET /v1/riders
   */
  @Get()
  async getAllRiders(
    @TenantId() tenantId: string,
    @Query('limit') limit?: number,
  ) {
    return this.riderService.getAllRiders(tenantId, limit || 100);
  }

  /**
   * Get rider's ride history
   * GET /v1/riders/:id/rides
   */
  @Get(':id/rides')
  async getRiderRides(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) riderId: string,
    @Query('limit') limit?: number,
  ) {
    return this.riderService.getRiderRides(tenantId, riderId, limit || 20);
  }
}
