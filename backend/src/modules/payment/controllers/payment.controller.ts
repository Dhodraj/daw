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
import { PaymentService } from '../services/payment.service';
import { CreatePaymentDto, RefundPaymentDto } from '../dto/payment.dto';
import { TenantId } from '../../../shared/decorators/tenant.decorator';

@Controller('v1/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Create and process a payment
   * POST /v1/payments
   */
  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async createPayment(
    @TenantId() tenantId: string,
    @Body() dto: CreatePaymentDto,
    @Headers('x-idempotency-key') idempotencyKey?: string,
  ) {
    return this.paymentService.createPayment(tenantId, dto, idempotencyKey);
  }

  /**
   * Get payment by ID
   * GET /v1/payments/:id
   */
  @Get(':id')
  async getPayment(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) paymentId: string,
  ) {
    return this.paymentService.getPayment(tenantId, paymentId);
  }

  /**
   * Get payment by trip ID
   * GET /v1/payments/trip/:tripId
   */
  @Get('trip/:tripId')
  async getPaymentByTrip(
    @TenantId() tenantId: string,
    @Param('tripId', ParseUUIDPipe) tripId: string,
  ) {
    return this.paymentService.getPaymentByTrip(tenantId, tripId);
  }

  /**
   * Process refund
   * POST /v1/payments/:id/refund
   */
  @Post(':id/refund')
  @HttpCode(HttpStatus.OK)
  async refundPayment(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) paymentId: string,
    @Body() dto: RefundPaymentDto,
  ) {
    return this.paymentService.refundPayment(tenantId, paymentId, dto);
  }
}
