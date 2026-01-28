import { HttpException } from '@nestjs/common';
import { ErrorCode, ErrorMessages, ErrorHttpStatus } from './error-codes';

/**
 * Standardized API error response format
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    path?: string;
    requestId?: string;
  };
}

/**
 * Application-specific exception with standardized error codes
 */
export class AppException extends HttpException {
  public readonly errorCode: ErrorCode;
  public readonly details?: Record<string, any>;

  constructor(
    errorCode: ErrorCode,
    message?: string,
    details?: Record<string, any>,
  ) {
    const statusCode = ErrorHttpStatus[errorCode] || 500;
    const errorMessage = message || ErrorMessages[errorCode];

    super(
      {
        code: errorCode,
        message: errorMessage,
        details,
      },
      statusCode,
    );

    this.errorCode = errorCode;
    this.details = details;
  }

  /**
   * Create a formatted error response
   */
  toResponse(path?: string, requestId?: string): ApiErrorResponse {
    return {
      success: false,
      error: {
        code: this.errorCode,
        message: this.message,
        details: this.details,
        timestamp: new Date().toISOString(),
        path,
        requestId,
      },
    };
  }
}

// Convenience factory methods for common errors
export const AppErrors = {
  // General
  internal: (details?: Record<string, any>) =>
    new AppException(ErrorCode.INTERNAL_ERROR, undefined, details),

  validation: (message: string, details?: Record<string, any>) =>
    new AppException(ErrorCode.VALIDATION_ERROR, message, details),

  notFound: (resource: string) =>
    new AppException(ErrorCode.NOT_FOUND, `${resource} not found`),

  unauthorized: (message?: string) =>
    new AppException(ErrorCode.UNAUTHORIZED, message),

  forbidden: (message?: string) =>
    new AppException(ErrorCode.FORBIDDEN, message),

  conflict: (message: string) =>
    new AppException(ErrorCode.CONFLICT, message),

  // Tenant
  tenantNotFound: () => new AppException(ErrorCode.TENANT_NOT_FOUND),
  tenantInactive: () => new AppException(ErrorCode.TENANT_INACTIVE),
  tenantHeaderMissing: () => new AppException(ErrorCode.TENANT_HEADER_MISSING),

  // Ride
  rideNotFound: (rideId?: string) =>
    new AppException(ErrorCode.RIDE_NOT_FOUND, undefined, rideId ? { rideId } : undefined),

  rideAlreadyCancelled: (rideId?: string) =>
    new AppException(ErrorCode.RIDE_ALREADY_CANCELLED, undefined, rideId ? { rideId } : undefined),

  rideCannotBeCancelled: (currentStatus: string) =>
    new AppException(ErrorCode.RIDE_CANNOT_BE_CANCELLED, `Ride cannot be cancelled when status is ${currentStatus}`, { currentStatus }),

  rideInvalidStatusTransition: (from: string, to: string) =>
    new AppException(ErrorCode.RIDE_INVALID_STATUS_TRANSITION, `Cannot transition from ${from} to ${to}`, { from, to }),

  noDriversAvailable: () => new AppException(ErrorCode.NO_DRIVERS_AVAILABLE),

  // Driver
  driverNotFound: (driverId?: string) =>
    new AppException(ErrorCode.DRIVER_NOT_FOUND, undefined, driverId ? { driverId } : undefined),

  driverNotAvailable: (driverId?: string) =>
    new AppException(ErrorCode.DRIVER_NOT_AVAILABLE, undefined, driverId ? { driverId } : undefined),

  driverAlreadyAssigned: (driverId?: string) =>
    new AppException(ErrorCode.DRIVER_ALREADY_ASSIGNED, undefined, driverId ? { driverId } : undefined),

  // Rider
  riderNotFound: (riderId?: string) =>
    new AppException(ErrorCode.RIDER_NOT_FOUND, undefined, riderId ? { riderId } : undefined),

  riderAlreadyExists: (phone?: string) =>
    new AppException(ErrorCode.RIDER_ALREADY_EXISTS, undefined, phone ? { phone } : undefined),

  riderHasActiveRide: (riderId?: string, rideId?: string) =>
    new AppException(ErrorCode.RIDER_HAS_ACTIVE_RIDE, undefined, { riderId, rideId }),

  // Trip
  tripNotFound: (tripId?: string) =>
    new AppException(ErrorCode.TRIP_NOT_FOUND, undefined, tripId ? { tripId } : undefined),

  tripAlreadyStarted: () => new AppException(ErrorCode.TRIP_ALREADY_STARTED),
  tripAlreadyEnded: () => new AppException(ErrorCode.TRIP_ALREADY_ENDED),
  tripCannotStart: (status: string) =>
    new AppException(ErrorCode.TRIP_CANNOT_START, `Cannot start trip with status ${status}`, { status }),

  tripCannotEnd: (status: string) =>
    new AppException(ErrorCode.TRIP_CANNOT_END, `Cannot end trip with status ${status}`, { status }),

  // Payment
  paymentNotFound: (paymentId?: string) =>
    new AppException(ErrorCode.PAYMENT_NOT_FOUND, undefined, paymentId ? { paymentId } : undefined),

  paymentAlreadyProcessed: () => new AppException(ErrorCode.PAYMENT_ALREADY_PROCESSED),
  paymentFailed: (reason?: string) =>
    new AppException(ErrorCode.PAYMENT_FAILED, reason),

  // Offer
  offerNotFound: (offerId?: string) =>
    new AppException(ErrorCode.OFFER_NOT_FOUND, undefined, offerId ? { offerId } : undefined),

  offerExpired: () => new AppException(ErrorCode.OFFER_EXPIRED),
  offerAlreadyAccepted: () => new AppException(ErrorCode.OFFER_ALREADY_ACCEPTED),
  offerAlreadyDeclined: () => new AppException(ErrorCode.OFFER_ALREADY_DECLINED),

  // Idempotency
  idempotencyKeyReused: (key: string) =>
    new AppException(ErrorCode.IDEMPOTENCY_KEY_REUSED, undefined, { idempotencyKey: key }),
};
