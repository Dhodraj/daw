/**
 * Shared configuration for k6 load tests
 */

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
export const TENANT_ID = __ENV.TENANT_ID || '00000000-0000-0000-0000-000000000001';

// Bangalore area coordinates for realistic testing
export const BANGALORE_CENTER = { lat: 12.9716, lng: 77.5946 };
export const LOCATION_RADIUS_KM = 15;

// Test data pools
export const VEHICLE_TIERS = ['ECONOMY', 'COMFORT', 'PREMIUM', 'XL'];
export const PAYMENT_METHODS = ['CASH', 'CARD', 'WALLET'];

/**
 * Generate random location within radius of center point
 */
export function randomLocation(center, radiusKm) {
  const radiusInDegrees = radiusKm / 111;
  const lat = center.lat + (Math.random() - 0.5) * 2 * radiusInDegrees;
  const lng = center.lng + (Math.random() - 0.5) * 2 * radiusInDegrees;
  return {
    latitude: parseFloat(lat.toFixed(6)),
    longitude: parseFloat(lng.toFixed(6)),
  };
}

/**
 * Generate random element from array
 */
export function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate UUID v4
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Common request headers
 */
export function getHeaders(idempotencyKey = null) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Tenant-Id': TENANT_ID,
  };
  if (idempotencyKey) {
    headers['X-Idempotency-Key'] = idempotencyKey;
  }
  return headers;
}

/**
 * Thresholds for different test scenarios
 */
export const THRESHOLDS = {
  locationUpdates: {
    http_req_duration: ['p(95)<100', 'p(99)<200'],
    http_req_failed: ['rate<0.01'],
  },
  rideRequests: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
  },
  matching: {
    http_req_duration: ['p(95)<1000', 'p(99)<1500'],
    http_req_failed: ['rate<0.01'],
  },
};
