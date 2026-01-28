import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  Max,
  IsUUID,
  IsNotEmpty,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  RideTier,
  PaymentMethod,
  RideStatus,
} from '../../../shared/interfaces/common.interfaces';

// Location DTO
export class LocationDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  longitude: number;

  @IsString()
  @IsOptional()
  address?: string;
}

// Create Ride Request DTO
export class CreateRideDto {
  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  pickupLocation: LocationDto;

  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  destinationLocation: LocationDto;

  @IsEnum(RideTier)
  tier: RideTier;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsString()
  @IsOptional()
  scheduledAt?: string; // ISO 8601 for scheduled rides (future feature)

  @IsUUID()
  riderId: string; // For now, we'll pass rider ID directly. In production, this comes from auth token
}

// Get Ride Response DTO
export class RideResponseDto {
  id: string;
  status: RideStatus;
  rider: {
    id: string;
    name: string;
  };
  driver?: {
    id: string;
    name: string;
    phone: string;
    vehicleNumber: string;
    rating: number;
    currentLocation?: {
      latitude: number;
      longitude: number;
    };
  };
  pickup: {
    location: {
      latitude: number;
      longitude: number;
    };
    address?: string;
  };
  destination: {
    location: {
      latitude: number;
      longitude: number;
    };
    address?: string;
  };
  tier: RideTier;
  estimatedFare: {
    min: number;
    max: number;
    currency: string;
  };
  surgeMultiplier: number;
  trip?: {
    id: string;
    status: string;
    fare?: {
      baseFare: number;
      distanceFare: number;
      timeFare: number;
      surgeAmount: number;
      taxes: number;
      total: number;
      currency: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

// Create Ride Response DTO
export class CreateRideResponseDto {
  id: string;
  status: RideStatus;
  estimatedFare: {
    min: number;
    max: number;
    currency: string;
  };
  surgeMultiplier: number;
  estimatedPickupTime?: number; // seconds
  createdAt: Date;
}

// Cancel Ride DTO
export class CancelRideDto {
  @IsString()
  @IsOptional()
  reason?: string;
}

// Accept Ride Offer DTO (for drivers)
export class AcceptOfferDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(60)
  @Type(() => Number)
  estimatedArrivalMinutes?: number;
}

// Accept Offer Response
export class AcceptOfferResponseDto {
  rideId: string;
  riderId: string;
  pickup: {
    location: {
      latitude: number;
      longitude: number;
    };
    address?: string;
  };
  destination: {
    location: {
      latitude: number;
      longitude: number;
    };
    address?: string;
  };
  estimatedFare: {
    min: number;
    max: number;
  };
}
