import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod, PaymentStatus } from '../../../shared/interfaces/common.interfaces';

// Create Payment DTO
export class CreatePaymentDto {
  @IsUUID()
  tripId: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsString()
  @IsOptional()
  cardToken?: string; // For card payments
}

// Payment Response DTO
export class PaymentResponseDto {
  id: string;
  tripId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  pspTransactionId?: string;
  createdAt: Date;
  completedAt?: Date;
  receiptUrl?: string;
}

// Refund DTO
export class RefundPaymentDto {
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  amount?: number; // Partial refund amount

  @IsString()
  @IsOptional()
  reason?: string;
}
