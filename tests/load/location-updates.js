/**
 * Load test for driver location updates
 *
 * Target: 200,000 updates/second
 *
 * Run with:
 *   k6 run --vus 500 --duration 60s location-updates.js
 *   k6 run --vus 1000 --iterations 200000 location-updates.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import {
  BASE_URL,
  BANGALORE_CENTER,
  LOCATION_RADIUS_KM,
  randomLocation,
  getHeaders,
  generateUUID,
  THRESHOLDS,
} from './config.js';

// Custom metrics
const locationUpdateDuration = new Trend('location_update_duration');
const locationUpdateSuccess = new Rate('location_update_success');
const locationUpdatesTotal = new Counter('location_updates_total');

// Test configuration
export const options = {
  scenarios: {
    // Ramping load test
    ramp_up: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '30s', target: 100 },   // Warm up
        { duration: '1m', target: 500 },    // Ramp to moderate load
        { duration: '2m', target: 1000 },   // Ramp to high load
        { duration: '1m', target: 1000 },   // Sustained high load
        { duration: '30s', target: 0 },     // Cool down
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: THRESHOLDS.locationUpdates,
};

// Pre-generate driver IDs for this VU
const driverIds = [];
for (let i = 0; i < 100; i++) {
  driverIds.push(generateUUID());
}

export default function () {
  // Simulate driver sending location update
  const driverId = driverIds[Math.floor(Math.random() * driverIds.length)];
  const location = randomLocation(BANGALORE_CENTER, LOCATION_RADIUS_KM);

  const payload = JSON.stringify({
    latitude: location.latitude,
    longitude: location.longitude,
    heading: Math.floor(Math.random() * 360),
    speed: Math.floor(Math.random() * 60),
    timestamp: new Date().toISOString(),
  });

  const startTime = Date.now();

  const response = http.post(
    `${BASE_URL}/v1/drivers/${driverId}/location`,
    payload,
    { headers: getHeaders() }
  );

  const duration = Date.now() - startTime;

  // Record metrics
  locationUpdateDuration.add(duration);
  locationUpdatesTotal.add(1);

  const success = check(response, {
    'status is 202': (r) => r.status === 202,
    'response time < 100ms': (r) => r.timings.duration < 100,
    'response has acknowledged': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.acknowledged === true;
      } catch {
        return false;
      }
    },
  });

  locationUpdateSuccess.add(success);

  // Simulate 1-2 updates per second per driver
  sleep(Math.random() * 0.5 + 0.5);
}

export function handleSummary(data) {
  const summary = {
    'Location Updates Load Test Results': {
      'Total Requests': data.metrics.iterations.values.count,
      'Success Rate': `${(data.metrics.location_update_success?.values?.rate * 100 || 0).toFixed(2)}%`,
      'p95 Latency': `${data.metrics.http_req_duration?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms`,
      'p99 Latency': `${data.metrics.http_req_duration?.values?.['p(99)']?.toFixed(2) || 'N/A'}ms`,
      'Requests/sec': `${data.metrics.iterations?.values?.rate?.toFixed(2) || 'N/A'}`,
    },
  };

  console.log('\n' + '='.repeat(60));
  console.log('LOCATION UPDATES LOAD TEST SUMMARY');
  console.log('='.repeat(60));
  Object.entries(summary['Location Updates Load Test Results']).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
  console.log('='.repeat(60) + '\n');

  return {
    'stdout': JSON.stringify(summary, null, 2),
    'results/location-updates-summary.json': JSON.stringify(data, null, 2),
  };
}
