import {
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  IsEmail,
  Matches,
} from 'class-validator';
import { PaymentMethod } from '../../../shared/interfaces/common.interfaces';

// Create Rider DTO
export class CreateRiderDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' })
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(PaymentMethod)
  @IsOptional()
  defaultPaymentMethod?: PaymentMethod;
}

// Update Rider DTO
export class UpdateRiderDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(PaymentMethod)
  @IsOptional()
  defaultPaymentMethod?: PaymentMethod;
}

// Rider Response DTO
export class RiderResponseDto {
  id: string;
  name: string;
  phone: string;
  email?: string;
  defaultPaymentMethod: PaymentMethod;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}
