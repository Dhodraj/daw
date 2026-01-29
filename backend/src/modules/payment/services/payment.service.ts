import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { RedisService } from '../../../shared/redis/redis.service';
import { CreatePaymentDto, RefundPaymentDto } from '../dto/payment.dto';
import {
  PaymentStatus,
  PaymentMethod,
  TripStatus,
} from '../../../shared/interfaces/common.interfaces';
import { v4 as uuidv4 } from 'uuid';

// Mock PSP Response
interface MockPSPResponse {
  success: boolean;
  transactionId: string;
  status: 'COMPLETED' | 'FAILED' | 'PENDING';
  message?: string;
}

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Create and process a payment
   * POST /v1/payments
   */
  async createPayment(
    tenantId: string,
    dto: CreatePaymentDto,
    idempotencyKey?: string,
  ) {
    const prismaClient = await this.prisma.forTenant(tenantId);

    // Check idempotency
    if (idempotencyKey) {
      const existing = await prismaClient.payment.findUnique({
        where: { idempotencyKey },
      });
      if (existing) {
        return this.mapPaymentToResponse(existing);
      }
    }

    // Validate trip exists and is completed
    const trip = await prismaClient.trip.findUnique({
      where: { id: dto.tripId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.status !== TripStatus.COMPLETED) {
      throw new BadRequestException(
        'Payment can only be processed for completed trips',
      );
    }

    // Check if payment already exists for this trip
    const existingPayment = await prismaClient.payment.findUnique({
      where: { tripId: dto.tripId },
    });

    if (existingPayment) {
      if (existingPayment.status === PaymentStatus.COMPLETED) {
        throw new ConflictException('Payment already completed for this trip');
      }
      // Return existing pending payment
      return this.mapPaymentToResponse(existingPayment);
    }

    // Create payment record
    const payment = await prismaClient.payment.create({
      data: {
        tripId: dto.tripId,
        riderId: trip.riderId,
        idempotencyKey,
        amount: dto.amount,
        currency: dto.currency || 'INR',
        paymentMethod: dto.paymentMethod,
        status: PaymentStatus.PROCESSING,
        pspName: 'mock_psp',
      },
    });

    // Process payment based on method
    let pspResponse: MockPSPResponse;

    if (dto.paymentMethod === PaymentMethod.CASH) {
      // Cash payments are marked complete immediately
      pspResponse = {
        success: true,
        transactionId: `CASH_${uuidv4().slice(0, 8)}`,
        status: 'COMPLETED',
      };
    } else {
      // Process card/wallet payment via mock PSP
      pspResponse = await this.processMockPayment(dto);
    }

    // Update payment with PSP response
    const updatedPayment = await prismaClient.payment.update({
      where: { id: payment.id },
      data: {
        status: pspResponse.success
          ? PaymentStatus.COMPLETED
          : PaymentStatus.FAILED,
        pspTransactionId: pspResponse.transactionId,
        pspResponse: pspResponse as any,
        completedAt: pspResponse.success ? new Date() : null,
      },
    });

    // Publish payment event
    this.redis.publish(`tenant:${tenantId}:payment:${payment.id}:completed`, {
      paymentId: payment.id,
      tripId: dto.tripId,
      status: updatedPayment.status,
      amount: dto.amount,
      timestamp: Date.now(),
    });

    return this.mapPaymentToResponse(updatedPayment);
  }

  /**
   * Get payment by ID
   */
  async getPayment(tenantId: string, paymentId: string) {
    const prismaClient = await this.prisma.forTenant(tenantId);

    const payment = await prismaClient.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return this.mapPaymentToResponse(payment);
  }

  /**
   * Get payment by trip ID
   */
  async getPaymentByTrip(tenantId: string, tripId: string) {
    const prismaClient = await this.prisma.forTenant(tenantId);

    const payment = await prismaClient.payment.findUnique({
      where: { tripId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found for this trip');
    }

    return this.mapPaymentToResponse(payment);
  }

  /**
   * Process refund
   */
  async refundPayment(
    tenantId: string,
    paymentId: string,
    dto: RefundPaymentDto,
  ) {
    const prismaClient = await this.prisma.forTenant(tenantId);

    const payment = await prismaClient.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Can only refund completed payments');
    }

    // For mock PSP, refund is always successful
    const refundAmount = dto.amount || parseFloat(payment.amount.toString());

    const updatedPayment = await prismaClient.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.REFUNDED,
        pspResponse: {
          ...((payment.pspResponse as object) || {}),
          refund: {
            amount: refundAmount,
            reason: dto.reason,
            processedAt: new Date().toISOString(),
          },
        } as any,
      },
    });

    // Publish refund event
    this.redis.publish(`tenant:${tenantId}:payment:${paymentId}:refunded`, {
      paymentId,
      refundAmount,
      reason: dto.reason,
      timestamp: Date.now(),
    });

    return this.mapPaymentToResponse(updatedPayment);
  }

  // =====================
  // Mock PSP Integration
  // =====================

  /**
   * Mock payment processing
   * Simulates a payment gateway with configurable success/failure rates
   */
  private async processMockPayment(
    dto: CreatePaymentDto,
  ): Promise<MockPSPResponse> {
    // Simulate network latency (50-200ms)
    await this.delay(50 + Math.random() * 150);

    // Simulate 95% success rate
    const success = Math.random() < 0.95;

    if (success) {
      return {
        success: true,
        transactionId: `TXN_${uuidv4().slice(0, 12).toUpperCase()}`,
        status: 'COMPLETED',
      };
    } else {
      // Simulate different failure scenarios
      const failureReasons = [
        'Insufficient funds',
        'Card declined',
        'Network timeout',
        'Invalid card details',
      ];
      const reason =
        failureReasons[Math.floor(Math.random() * failureReasons.length)];

      return {
        success: false,
        transactionId: `FAILED_${uuidv4().slice(0, 8)}`,
        status: 'FAILED',
        message: reason,
      };
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // =====================
  // Response Mapper
  // =====================

  private mapPaymentToResponse(payment: any) {
    return {
      id: payment.id,
      tripId: payment.tripId,
      amount: parseFloat(payment.amount.toString()),
      currency: payment.currency,
      paymentMethod: payment.paymentMethod as PaymentMethod,
      status: payment.status as PaymentStatus,
      pspTransactionId: payment.pspTransactionId,
      createdAt: payment.createdAt,
      completedAt: payment.completedAt,
      receiptUrl:
        payment.status === PaymentStatus.COMPLETED
          ? `/v1/payments/${payment.id}/receipt`
          : null,
    };
  }
}
