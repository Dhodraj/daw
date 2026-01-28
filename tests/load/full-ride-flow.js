/**
 * End-to-end load test for complete ride lifecycle
 *
 * Tests the full flow:
 * 1. Create ride request
 * 2. Driver accepts ride
 * 3. Trip starts
 * 4. Trip ends
 * 5. Payment processed
 *
 * Run with:
 *   k6 run --vus 20 --duration 2m full-ride-flow.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
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
} from './config.js';

// Custom metrics
const rideFlowDuration = new Trend('ride_flow_duration');
const rideFlowSuccess = new Rate('ride_flow_success');
const completedRides = new Counter('completed_rides');
const stepDurations = {
  createRide: new Trend('step_create_ride_duration'),
  driverAccept: new Trend('step_driver_accept_duration'),
  tripStart: new Trend('step_trip_start_duration'),
  tripEnd: new Trend('step_trip_end_duration'),
  payment: new Trend('step_payment_duration'),
};

// Test configuration
export const options = {
  scenarios: {
    full_flow: {
      executor: 'constant-vus',
      vus: 20,
      duration: '3m',
    },
  },
  thresholds: {
    ride_flow_success: ['rate>0.90'],
    'step_create_ride_duration': ['p(95)<500'],
    'step_driver_accept_duration': ['p(95)<300'],
    'step_trip_end_duration': ['p(95)<500'],
    'step_payment_duration': ['p(95)<1000'],
  },
};

// Pre-generate IDs
const riderIds = Array.from({ length: 10 }, () => generateUUID());
const driverIds = Array.from({ length: 20 }, () => generateUUID());

export default function () {
  const flowStartTime = Date.now();
  let flowSuccess = true;
  let rideId = null;
  let tripId = null;

  const riderId = randomElement(riderIds);
  const driverId = randomElement(driverIds);
  const pickup = randomLocation(BANGALORE_CENTER, LOCATION_RADIUS_KM);
  const destination = randomLocation(BANGALORE_CENTER, LOCATION_RADIUS_KM);

  // Step 1: Create ride request
  group('Create Ride', function () {
    const startTime = Date.now();
    const idempotencyKey = generateUUID();

    const payload = JSON.stringify({
      riderId: riderId,
      pickupLocation: {
        latitude: pickup.latitude,
        longitude: pickup.longitude,
      },
      destinationLocation: {
        latitude: destination.latitude,
        longitude: destination.longitude,
      },
      tier: randomElement(VEHICLE_TIERS),
      paymentMethod: randomElement(PAYMENT_METHODS),
    });

    const response = http.post(
      `${BASE_URL}/v1/rides`,
      payload,
      { headers: getHeaders(idempotencyKey) }
    );

    stepDurations.createRide.add(Date.now() - startTime);

    const success = check(response, {
      'ride created': (r) => r.status === 201 || r.status === 202,
    });

    if (success) {
      try {
        rideId = JSON.parse(response.body).id;
      } catch (e) {
        flowSuccess = false;
      }
    } else {
      flowSuccess = false;
    }
  });

  if (!rideId) {
    rideFlowSuccess.add(false);
    return;
  }

  // Wait for matching
  sleep(1);

  // Step 2: Driver accepts ride
  group('Driver Accept', function () {
    const startTime = Date.now();

    // First, simulate driver location update
    const driverLocation = randomLocation(pickup, 2); // Within 2km of pickup
    http.post(
      `${BASE_URL}/v1/drivers/${driverId}/location`,
      JSON.stringify({
        latitude: driverLocation.latitude,
        longitude: driverLocation.longitude,
      }),
      { headers: getHeaders() }
    );

    // Driver accepts the ride
    const response = http.post(
      `${BASE_URL}/v1/drivers/${driverId}/accept`,
      JSON.stringify({ rideId: rideId }),
      { headers: getHeaders(generateUUID()) }
    );

    stepDurations.driverAccept.add(Date.now() - startTime);

    const success = check(response, {
      'driver accepted': (r) => r.status === 200 || r.status === 201,
    });

    if (!success) {
      flowSuccess = false;
    }
  });

  if (!flowSuccess) {
    rideFlowSuccess.add(false);
    return;
  }

  // Simulate driver arriving and trip starting
  sleep(2);

  // Step 3: Start trip
  group('Trip Start', function () {
    const startTime = Date.now();

    // Driver arrives
    http.post(
      `${BASE_URL}/v1/rides/${rideId}/driver-arrived`,
      JSON.stringify({}),
      { headers: getHeaders() }
    );

    sleep(0.5);

    // Start the trip
    const response = http.post(
      `${BASE_URL}/v1/rides/${rideId}/start`,
      JSON.stringify({
        startLocation: {
          latitude: pickup.latitude,
          longitude: pickup.longitude,
        },
      }),
      { headers: getHeaders(generateUUID()) }
    );

    stepDurations.tripStart.add(Date.now() - startTime);

    const success = check(response, {
      'trip started': (r) => r.status === 200 || r.status === 201,
    });

    if (success) {
      try {
        const body = JSON.parse(response.body);
        tripId = body.tripId || body.id;
      } catch (e) {
        // Try to get trip ID from ride
      }
    }
  });

  // Simulate trip duration
  sleep(3);

  // Step 4: End trip
  group('Trip End', function () {
    const startTime = Date.now();

    // Get current ride to find trip ID
    const rideResponse = http.get(
      `${BASE_URL}/v1/rides/${rideId}`,
      { headers: getHeaders() }
    );

    if (rideResponse.status === 200) {
      try {
        const rideData = JSON.parse(rideResponse.body);
        tripId = tripId || rideData.trip?.id;
      } catch (e) {}
    }

    if (tripId) {
      const response = http.post(
        `${BASE_URL}/v1/trips/${tripId}/end`,
        JSON.stringify({
          endLocation: {
            latitude: destination.latitude,
            longitude: destination.longitude,
          },
        }),
        { headers: getHeaders(generateUUID()) }
      );

      stepDurations.tripEnd.add(Date.now() - startTime);

      const success = check(response, {
        'trip ended': (r) => r.status === 200,
      });

      if (!success) {
        flowSuccess = false;
      }
    } else {
      // Fallback: end via ride endpoint
      const response = http.post(
        `${BASE_URL}/v1/rides/${rideId}/complete`,
        JSON.stringify({
          endLocation: {
            latitude: destination.latitude,
            longitude: destination.longitude,
          },
        }),
        { headers: getHeaders(generateUUID()) }
      );

      stepDurations.tripEnd.add(Date.now() - startTime);

      const success = check(response, {
        'ride completed': (r) => r.status === 200,
      });

      if (!success) {
        flowSuccess = false;
      }
    }
  });

  // Step 5: Process payment
  group('Payment', function () {
    const startTime = Date.now();

    // Get fare from ride
    const rideResponse = http.get(
      `${BASE_URL}/v1/rides/${rideId}`,
      { headers: getHeaders() }
    );

    let amount = 150.00; // Default amount
    if (rideResponse.status === 200) {
      try {
        const rideData = JSON.parse(rideResponse.body);
        amount = rideData.trip?.fare?.total || rideData.estimatedFare?.max || 150.00;
      } catch (e) {}
    }

    const response = http.post(
      `${BASE_URL}/v1/payments`,
      JSON.stringify({
        tripId: tripId || rideId,
        amount: amount,
        currency: 'INR',
        paymentMethod: 'CARD',
      }),
      { headers: getHeaders(generateUUID()) }
    );

    stepDurations.payment.add(Date.now() - startTime);

    check(response, {
      'payment processed': (r) => r.status === 200 || r.status === 201 || r.status === 202,
    });
  });

  // Record flow metrics
  const flowDuration = Date.now() - flowStartTime;
  rideFlowDuration.add(flowDuration);
  rideFlowSuccess.add(flowSuccess);

  if (flowSuccess) {
    completedRides.add(1);
  }

  // Cooldown between flows
  sleep(2);
}

export function handleSummary(data) {
  const summary = {
    'Full Ride Flow Load Test Results': {
      'Completed Rides': data.metrics.completed_rides?.values?.count || 0,
      'Flow Success Rate': `${(data.metrics.ride_flow_success?.values?.rate * 100 || 0).toFixed(2)}%`,
      'Total Flow p95': `${data.metrics.ride_flow_duration?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms`,
      'Create Ride p95': `${data.metrics.step_create_ride_duration?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms`,
      'Driver Accept p95': `${data.metrics.step_driver_accept_duration?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms`,
      'Trip Start p95': `${data.metrics.step_trip_start_duration?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms`,
      'Trip End p95': `${data.metrics.step_trip_end_duration?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms`,
      'Payment p95': `${data.metrics.step_payment_duration?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms`,
    },
  };

  console.log('\n' + '='.repeat(60));
  console.log('FULL RIDE FLOW LOAD TEST SUMMARY');
  console.log('='.repeat(60));
  Object.entries(summary['Full Ride Flow Load Test Results']).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
  console.log('='.repeat(60) + '\n');

  return {
    'stdout': JSON.stringify(summary, null, 2),
    'results/full-ride-flow-summary.json': JSON.stringify(data, null, 2),
  };
}
