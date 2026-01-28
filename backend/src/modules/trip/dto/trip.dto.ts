import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TripStatus } from '../../../shared/interfaces/common.interfaces';

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
}

// Start Trip DTO
export class StartTripDto {
  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  startLocation: LocationDto;
}

// End Trip DTO
export class EndTripDto {
  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  endLocation: LocationDto;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  actualDistanceMeters?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

// Trip Response DTO
export class TripResponseDto {
  id: string;
  rideId: string;
  status: TripStatus;
  fare?: {
    baseFare: number;
    distanceFare: number;
    timeFare: number;
    surgeAmount: number;
    taxes: number;
    total: number;
    currency: string;
  };
  distance?: {
    meters: number;
    displayText: string;
  };
  duration?: {
    seconds: number;
    displayText: string;
  };
  startedAt?: Date;
  endedAt?: Date;
  receiptUrl?: string;
}
