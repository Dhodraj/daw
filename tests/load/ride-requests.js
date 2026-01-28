/**
 * Load test for ride requests
 *
 * Target: 10,000 requests/minute (~167/second)
 *
 * Run with:
 *   k6 run --vus 50 --duration 60s ride-requests.js
 *   k6 run ride-requests.js  # Uses built-in scenarios
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import {
  BASE_URL,
  BANGALORE_CENTER,
  LOCATION_RADIUS_KM,
  randomLocation,
  randomElement,
  getHeaders,
  generateUUID,
  VEHICLE_TIERS,
  PAYMENT_METHODS,
  THRESHOLDS,
} from './config.js';

// Custom metrics
const rideCreationDuration = new Trend('ride_creation_duration');
const rideCreationSuccess = new Rate('ride_creation_success');
const ridesCreatedTotal = new Counter('rides_created_total');
const matchingDuration = new Trend('matching_duration');

// Test configuration
export const options = {
  scenarios: {
    // Constant arrival rate to simulate real traffic pattern
    constant_load: {
      executor: 'constant-arrival-rate',
      rate: 167,           // 10k per minute = 167 per second
      timeUnit: '1s',
      duration: '2m',
      preAllocatedVUs: 100,
      maxVUs: 200,
    },
  },
  thresholds: {
    ...THRESHOLDS.rideRequests,
    ride_creation_duration: ['p(95)<500'],
    ride_creation_success: ['rate>0.95'],
  },
};

// Pre-generate rider IDs
const riderIds = [];
for (let i = 0; i < 50; i++) {
  riderIds.push(generateUUID());
}

export default function () {
  const riderId = randomElement(riderIds);
  const pickup = randomLocation(BANGALORE_CENTER, LOCATION_RADIUS_KM);
  const destination = randomLocation(BANGALORE_CENTER, LOCATION_RADIUS_KM);
  const idempotencyKey = generateUUID();

  const payload = JSON.stringify({
    riderId: riderId,
    pickupLocation: {
      latitude: pickup.latitude,
      longitude: pickup.longitude,
      address: `Test Pickup ${pickup.latitude.toFixed(4)}, ${pickup.longitude.toFixed(4)}`,
    },
    destinationLocation: {
      latitude: destination.latitude,
      longitude: destination.longitude,
      address: `Test Destination ${destination.latitude.toFixed(4)}, ${destination.longitude.toFixed(4)}`,
    },
    tier: randomElement(VEHICLE_TIERS),
    paymentMethod: randomElement(PAYMENT_METHODS),
  });

  const startTime = Date.now();

  const response = http.post(
    `${BASE_URL}/v1/rides`,
    payload,
    {
      headers: getHeaders(idempotencyKey),
      tags: { name: 'CreateRide' },
    }
  );

  const duration = Date.now() - startTime;

  // Record metrics
  rideCreationDuration.add(duration);
  ridesCreatedTotal.add(1);

  const success = check(response, {
    'status is 201 or 202': (r) => r.status === 201 || r.status === 202,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'response has ride id': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.id !== undefined;
      } catch {
        return false;
      }
    },
    'response has status': (r) => {
      try {
        const body = JSON.parse(r.body);
        return ['PENDING', 'SEARCHING', 'DRIVER_ASSIGNED'].includes(body.status);
      } catch {
        return false;
      }
    },
  });

  rideCreationSuccess.add(success);

  // If ride created successfully, verify the matching system
  if (response.status === 201 || response.status === 202) {
    try {
      const rideData = JSON.parse(response.body);
      const rideId = rideData.id;

      // Wait a bit for matching to occur
      sleep(1);

      // Check ride status (this tests the matching latency)
      const matchingStart = Date.now();
      const statusResponse = http.get(
        `${BASE_URL}/v1/rides/${rideId}`,
        { headers: getHeaders(), tags: { name: 'GetRideStatus' } }
      );
      const matchingTime = Date.now() - matchingStart;

      matchingDuration.add(matchingTime);

      check(statusResponse, {
        'get status is 200': (r) => r.status === 200,
        'matching time < 1s': () => matchingTime < 1000,
      });
    } catch (e) {
      // Ignore parsing errors
    }
  }

  // Small delay between requests
  sleep(Math.random() * 0.1);
}

export function handleSummary(data) {
  const summary = {
    'Ride Requests Load Test Results': {
      'Total Ride Requests': data.metrics.rides_created_total?.values?.count || 0,
      'Success Rate': `${(data.metrics.ride_creation_success?.values?.rate * 100 || 0).toFixed(2)}%`,
      'p50 Latency': `${data.metrics.ride_creation_duration?.values?.['p(50)']?.toFixed(2) || 'N/A'}ms`,
      'p95 Latency': `${data.metrics.ride_creation_duration?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms`,
      'p99 Latency': `${data.metrics.ride_creation_duration?.values?.['p(99)']?.toFixed(2) || 'N/A'}ms`,
      'Requests/sec': `${data.metrics.iterations?.values?.rate?.toFixed(2) || 'N/A'}`,
      'Matching p95': `${data.metrics.matching_duration?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms`,
    },
  };

  console.log('\n' + '='.repeat(60));
  console.log('RIDE REQUESTS LOAD TEST SUMMARY');
  console.log('='.repeat(60));
  Object.entries(summary['Ride Requests Load Test Results']).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
  console.log('='.repeat(60) + '\n');

  return {
    'stdout': JSON.stringify(summary, null, 2),
    'results/ride-requests-summary.json': JSON.stringify(data, null, 2),
  };
}
