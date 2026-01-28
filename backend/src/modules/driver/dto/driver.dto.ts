import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  Max,
  IsUUID,
  IsNotEmpty,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DriverStatus, RideTier } from '../../../shared/interfaces/common.interfaces';

// DTO for creating a driver
export class CreateDriverDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' })
  phone: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  vehicleNumber: string;

  @IsEnum(RideTier)
  vehicleType: RideTier;
}

// DTO for updating driver location
export class UpdateLocationDto {
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

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(360)
  @Type(() => Number)
  heading?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  speed?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  accuracy?: number;

  @IsString()
  @IsOptional()
  timestamp?: string;
}

// DTO for updating driver status
export class UpdateDriverStatusDto {
  @IsEnum(DriverStatus)
  status: DriverStatus;
}

// DTO for accepting a ride offer
export class AcceptRideDto {
  @IsUUID()
  offerId: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(60)
  @Type(() => Number)
  estimatedArrivalMinutes?: number;
}

// Response DTOs
export class LocationUpdateResponseDto {
  acknowledged: boolean;
}

export class DriverResponseDto {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vehicleNumber: string;
  vehicleType: RideTier;
  status: DriverStatus;
  rating: number;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
}

export class AcceptRideResponseDto {
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
