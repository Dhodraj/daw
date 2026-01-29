/**
 * Standardized Error Codes for SwiftRide API
 * Format: DOMAIN_ERROR_TYPE (e.g., RIDE_NOT_FOUND)
 */
export enum ErrorCode {
  // General Errors (1xxx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  RATE_LIMITED = 'RATE_LIMITED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // Tenant Errors (2xxx)
  TENANT_NOT_FOUND = 'TENANT_NOT_FOUND',
  TENANT_INACTIVE = 'TENANT_INACTIVE',
  TENANT_HEADER_MISSING = 'TENANT_HEADER_MISSING',

  // Ride Errors (3xxx)
  RIDE_NOT_FOUND = 'RIDE_NOT_FOUND',
  RIDE_ALREADY_CANCELLED = 'RIDE_ALREADY_CANCELLED',
  RIDE_CANNOT_BE_CANCELLED = 'RIDE_CANNOT_BE_CANCELLED',
  RIDE_ALREADY_IN_PROGRESS = 'RIDE_ALREADY_IN_PROGRESS',
  RIDE_ALREADY_COMPLETED = 'RIDE_ALREADY_COMPLETED',
  RIDE_INVALID_STATUS_TRANSITION = 'RIDE_INVALID_STATUS_TRANSITION',
  NO_DRIVERS_AVAILABLE = 'NO_DRIVERS_AVAILABLE',

  // Driver Errors (4xxx)
  DRIVER_NOT_FOUND = 'DRIVER_NOT_FOUND',
  DRIVER_NOT_AVAILABLE = 'DRIVER_NOT_AVAILABLE',
  DRIVER_ALREADY_ASSIGNED = 'DRIVER_ALREADY_ASSIGNED',
  DRIVER_LOCATION_STALE = 'DRIVER_LOCATION_STALE',
  DRIVER_INVALID_STATUS = 'DRIVER_INVALID_STATUS',

  // Rider Errors (5xxx)
  RIDER_NOT_FOUND = 'RIDER_NOT_FOUND',
  RIDER_ALREADY_EXISTS = 'RIDER_ALREADY_EXISTS',
  RIDER_HAS_ACTIVE_RIDE = 'RIDER_HAS_ACTIVE_RIDE',

  // Trip Errors (6xxx)
  TRIP_NOT_FOUND = 'TRIP_NOT_FOUND',
  TRIP_ALREADY_STARTED = 'TRIP_ALREADY_STARTED',
  TRIP_ALREADY_ENDED = 'TRIP_ALREADY_ENDED',
  TRIP_CANNOT_START = 'TRIP_CANNOT_START',
  TRIP_CANNOT_END = 'TRIP_CANNOT_END',
  TRIP_INVALID_STATUS = 'TRIP_INVALID_STATUS',

  // Payment Errors (7xxx)
  PAYMENT_NOT_FOUND = 'PAYMENT_NOT_FOUND',
  PAYMENT_ALREADY_PROCESSED = 'PAYMENT_ALREADY_PROCESSED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_INVALID_AMOUNT = 'PAYMENT_INVALID_AMOUNT',
  PAYMENT_METHOD_NOT_SUPPORTED = 'PAYMENT_METHOD_NOT_SUPPORTED',

  // Offer Errors (8xxx)
  OFFER_NOT_FOUND = 'OFFER_NOT_FOUND',
  OFFER_EXPIRED = 'OFFER_EXPIRED',
  OFFER_ALREADY_ACCEPTED = 'OFFER_ALREADY_ACCEPTED',
  OFFER_ALREADY_DECLINED = 'OFFER_ALREADY_DECLINED',

  // Idempotency Errors (9xxx)
  IDEMPOTENCY_KEY_REUSED = 'IDEMPOTENCY_KEY_REUSED',
}

/**
 * Error messages corresponding to error codes
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  // General
  [ErrorCode.INTERNAL_ERROR]:
    'An unexpected error occurred. Please try again later.',
  [ErrorCode.VALIDATION_ERROR]: 'The provided data is invalid.',
  [ErrorCode.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCode.UNAUTHORIZED]:
    'Authentication is required to access this resource.',
  [ErrorCode.FORBIDDEN]: 'You do not have permission to access this resource.',
  [ErrorCode.CONFLICT]:
    'The request conflicts with the current state of the resource.',
  [ErrorCode.RATE_LIMITED]: 'Too many requests. Please slow down.',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'The service is temporarily unavailable.',

  // Tenant
  [ErrorCode.TENANT_NOT_FOUND]: 'The specified tenant does not exist.',
  [ErrorCode.TENANT_INACTIVE]: 'The specified tenant is inactive.',
  [ErrorCode.TENANT_HEADER_MISSING]: 'X-Tenant-Id header is required.',

  // Ride
  [ErrorCode.RIDE_NOT_FOUND]: 'The specified ride was not found.',
  [ErrorCode.RIDE_ALREADY_CANCELLED]: 'This ride has already been cancelled.',
  [ErrorCode.RIDE_CANNOT_BE_CANCELLED]:
    'This ride cannot be cancelled in its current state.',
  [ErrorCode.RIDE_ALREADY_IN_PROGRESS]: 'This ride is already in progress.',
  [ErrorCode.RIDE_ALREADY_COMPLETED]: 'This ride has already been completed.',
  [ErrorCode.RIDE_INVALID_STATUS_TRANSITION]:
    'Invalid status transition for this ride.',
  [ErrorCode.NO_DRIVERS_AVAILABLE]:
    'No drivers are currently available in your area.',

  // Driver
  [ErrorCode.DRIVER_NOT_FOUND]: 'The specified driver was not found.',
  [ErrorCode.DRIVER_NOT_AVAILABLE]: 'This driver is not available for rides.',
  [ErrorCode.DRIVER_ALREADY_ASSIGNED]:
    'This driver is already assigned to another ride.',
  [ErrorCode.DRIVER_LOCATION_STALE]: 'Driver location data is outdated.',
  [ErrorCode.DRIVER_INVALID_STATUS]: 'Invalid driver status.',

  // Rider
  [ErrorCode.RIDER_NOT_FOUND]: 'The specified rider was not found.',
  [ErrorCode.RIDER_ALREADY_EXISTS]:
    'A rider with this phone number already exists.',
  [ErrorCode.RIDER_HAS_ACTIVE_RIDE]:
    'You already have an active ride in progress.',

  // Trip
  [ErrorCode.TRIP_NOT_FOUND]: 'The specified trip was not found.',
  [ErrorCode.TRIP_ALREADY_STARTED]: 'This trip has already started.',
  [ErrorCode.TRIP_ALREADY_ENDED]: 'This trip has already ended.',
  [ErrorCode.TRIP_CANNOT_START]:
    'This trip cannot be started in its current state.',
  [ErrorCode.TRIP_CANNOT_END]:
    'This trip cannot be ended in its current state.',
  [ErrorCode.TRIP_INVALID_STATUS]: 'Invalid trip status.',

  // Payment
  [ErrorCode.PAYMENT_NOT_FOUND]: 'The specified payment was not found.',
  [ErrorCode.PAYMENT_ALREADY_PROCESSED]:
    'This payment has already been processed.',
  [ErrorCode.PAYMENT_FAILED]: 'Payment processing failed. Please try again.',
  [ErrorCode.PAYMENT_INVALID_AMOUNT]: 'The payment amount is invalid.',
  [ErrorCode.PAYMENT_METHOD_NOT_SUPPORTED]:
    'This payment method is not supported.',

  // Offer
  [ErrorCode.OFFER_NOT_FOUND]: 'The specified ride offer was not found.',
  [ErrorCode.OFFER_EXPIRED]: 'This ride offer has expired.',
  [ErrorCode.OFFER_ALREADY_ACCEPTED]: 'This offer has already been accepted.',
  [ErrorCode.OFFER_ALREADY_DECLINED]: 'This offer has already been declined.',

  // Idempotency
  [ErrorCode.IDEMPOTENCY_KEY_REUSED]:
    'This idempotency key has already been used.',
};

/**
 * HTTP status codes for error codes
 */
export const ErrorHttpStatus: Record<ErrorCode, number> = {
  // General
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.CONFLICT]: 409,
  [ErrorCode.RATE_LIMITED]: 429,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,

  // Tenant
  [ErrorCode.TENANT_NOT_FOUND]: 404,
  [ErrorCode.TENANT_INACTIVE]: 403,
  [ErrorCode.TENANT_HEADER_MISSING]: 400,

  // Ride
  [ErrorCode.RIDE_NOT_FOUND]: 404,
  [ErrorCode.RIDE_ALREADY_CANCELLED]: 409,
  [ErrorCode.RIDE_CANNOT_BE_CANCELLED]: 400,
  [ErrorCode.RIDE_ALREADY_IN_PROGRESS]: 409,
  [ErrorCode.RIDE_ALREADY_COMPLETED]: 409,
  [ErrorCode.RIDE_INVALID_STATUS_TRANSITION]: 400,
  [ErrorCode.NO_DRIVERS_AVAILABLE]: 503,

  // Driver
  [ErrorCode.DRIVER_NOT_FOUND]: 404,
  [ErrorCode.DRIVER_NOT_AVAILABLE]: 400,
  [ErrorCode.DRIVER_ALREADY_ASSIGNED]: 409,
  [ErrorCode.DRIVER_LOCATION_STALE]: 400,
  [ErrorCode.DRIVER_INVALID_STATUS]: 400,

  // Rider
  [ErrorCode.RIDER_NOT_FOUND]: 404,
  [ErrorCode.RIDER_ALREADY_EXISTS]: 409,
  [ErrorCode.RIDER_HAS_ACTIVE_RIDE]: 409,

  // Trip
  [ErrorCode.TRIP_NOT_FOUND]: 404,
  [ErrorCode.TRIP_ALREADY_STARTED]: 409,
  [ErrorCode.TRIP_ALREADY_ENDED]: 409,
  [ErrorCode.TRIP_CANNOT_START]: 400,
  [ErrorCode.TRIP_CANNOT_END]: 400,
  [ErrorCode.TRIP_INVALID_STATUS]: 400,

  // Payment
  [ErrorCode.PAYMENT_NOT_FOUND]: 404,
  [ErrorCode.PAYMENT_ALREADY_PROCESSED]: 409,
  [ErrorCode.PAYMENT_FAILED]: 502,
  [ErrorCode.PAYMENT_INVALID_AMOUNT]: 400,
  [ErrorCode.PAYMENT_METHOD_NOT_SUPPORTED]: 400,

  // Offer
  [ErrorCode.OFFER_NOT_FOUND]: 404,
  [ErrorCode.OFFER_EXPIRED]: 410,
  [ErrorCode.OFFER_ALREADY_ACCEPTED]: 409,
  [ErrorCode.OFFER_ALREADY_DECLINED]: 409,

  // Idempotency
  [ErrorCode.IDEMPOTENCY_KEY_REUSED]: 409,
};
