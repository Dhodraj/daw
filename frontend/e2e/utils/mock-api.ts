import { Page, Route } from '@playwright/test';

/**
 * Mock API responses for testing
 */

// Mock ride data
export const mockRide = {
  id: 'test-ride-001',
  status: 'SEARCHING',
  rider: {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Test Rider',
  },
  pickup: {
    location: { latitude: 12.9716, longitude: 77.5946 },
    address: 'MG Road, Bangalore',
  },
  destination: {
    location: { latitude: 12.9352, longitude: 77.6245 },
    address: 'Koramangala, Bangalore',
  },
  tier: 'ECONOMY',
  estimatedFare: {
    min: 120,
    max: 150,
    currency: 'INR',
  },
  surgeMultiplier: 1.0,
  createdAt: new Date().toISOString(),
};

export const mockDriver = {
  id: 'test-driver-001',
  name: 'Rahul Sharma',
  phone: '+919876543210',
  vehicleNumber: 'KA01AB1234',
  vehicleType: 'ECONOMY',
  rating: 4.8,
};

export const mockRideWithDriver = {
  ...mockRide,
  status: 'DRIVER_ASSIGNED',
  driver: mockDriver,
};

export const mockCompletedRide = {
  ...mockRideWithDriver,
  status: 'COMPLETED',
  trip: {
    id: 'test-trip-001',
    status: 'COMPLETED',
    fare: {
      baseFare: 50,
      distanceFare: 60,
      timeFare: 20,
      taxes: 15.60,
      total: 145.60,
    },
    distance: {
      meters: 5200,
      displayText: '5.2 km',
    },
    duration: {
      seconds: 1200,
      displayText: '20 min',
    },
  },
};

export const mockCancelledRide = {
  ...mockRide,
  status: 'CANCELLED',
};

export const mockNoDriversRide = {
  ...mockRide,
  status: 'NO_DRIVERS',
};

/**
 * Set up API mocking for a page
 */
export async function setupApiMocks(page: Page) {
  // Mock create ride
  await page.route('**/v1/rides', async (route: Route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(mockRide),
      });
    } else {
      await route.continue();
    }
  });

  // Mock get ride
  await page.route('**/v1/rides/*', async (route: Route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockRide),
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * Mock ride status progression
 */
export async function mockRideProgression(page: Page, status: string) {
  let rideData;

  switch (status) {
    case 'SEARCHING':
      rideData = mockRide;
      break;
    case 'DRIVER_ASSIGNED':
      rideData = mockRideWithDriver;
      break;
    case 'COMPLETED':
      rideData = mockCompletedRide;
      break;
    case 'CANCELLED':
      rideData = mockCancelledRide;
      break;
    case 'NO_DRIVERS':
      rideData = mockNoDriversRide;
      break;
    default:
      rideData = { ...mockRide, status };
  }

  await page.route('**/v1/rides/*', async (route: Route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(rideData),
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * Mock cancel ride endpoint
 */
export async function mockCancelRide(page: Page) {
  await page.route('**/v1/rides/*/cancel', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });
}

/**
 * Mock API error
 */
export async function mockApiError(page: Page, endpoint: string, statusCode: number, message: string) {
  await page.route(`**${endpoint}`, async (route: Route) => {
    await route.fulfill({
      status: statusCode,
      contentType: 'application/json',
      body: JSON.stringify({ message, statusCode }),
    });
  });
}

/**
 * Mock WebSocket events (using page.evaluate for testing)
 */
export async function emitSocketEvent(page: Page, event: string, data: unknown) {
  await page.evaluate(
    ({ event, data }) => {
      // Dispatch custom event that can be caught by the app
      window.dispatchEvent(new CustomEvent('mock-socket-event', { detail: { event, data } }));
    },
    { event, data }
  );
}
