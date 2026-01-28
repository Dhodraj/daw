import { test, expect } from './fixtures/test-fixtures';
import {
  mockRide,
  mockRideWithDriver,
  mockCompletedRide,
  mockCancelledRide,
  mockNoDriversRide,
} from './utils/mock-api';

test.describe('Ride Status Card', () => {
  test.describe('Searching Status', () => {
    test.beforeEach(async ({ page }) => {
      // Mock the ride creation and get ride endpoints
      await page.route('**/v1/rides', async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify(mockRide),
          });
        }
      });

      await page.route('**/v1/rides/*', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockRide),
          });
        }
      });

      await page.goto('/');
    });

    test('should show searching status after ride creation', async ({ page, rideRequestPage, mapPage, rideStatusPage }) => {
      // Set locations
      await mapPage.waitForMapLoad();
      await rideRequestPage.clickPickupButton();
      await mapPage.clickMapOffset(-50, -50);
      await rideRequestPage.clickDestinationButton();
      await mapPage.clickMapOffset(50, 50);

      // Submit ride
      await rideRequestPage.submitRideRequest();

      // Wait for status card
      await page.waitForTimeout(1000);

      // Should show searching status with spinner
      await expect(page.locator('text=Finding Driver')).toBeVisible();
    });

    test('should show cancel button during searching', async ({ page, rideRequestPage, mapPage, rideStatusPage }) => {
      await mapPage.waitForMapLoad();
      await rideRequestPage.clickPickupButton();
      await mapPage.clickMapOffset(-50, -50);
      await rideRequestPage.clickDestinationButton();
      await mapPage.clickMapOffset(50, 50);
      await rideRequestPage.submitRideRequest();

      await page.waitForTimeout(1000);

      await expect(page.locator('button:has-text("Cancel Ride")')).toBeVisible();
    });
  });

  test.describe('Driver Assigned Status', () => {
    test.beforeEach(async ({ page }) => {
      await page.route('**/v1/rides', async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify(mockRideWithDriver),
          });
        }
      });

      await page.route('**/v1/rides/*', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockRideWithDriver),
          });
        }
      });

      await page.goto('/');
    });

    test('should show driver information when assigned', async ({ page, rideRequestPage, mapPage }) => {
      await mapPage.waitForMapLoad();
      await rideRequestPage.clickPickupButton();
      await mapPage.clickMapOffset(-50, -50);
      await rideRequestPage.clickDestinationButton();
      await mapPage.clickMapOffset(50, 50);
      await rideRequestPage.submitRideRequest();

      await page.waitForTimeout(1000);

      // Should show driver assigned status
      await expect(page.locator('text=Driver Assigned')).toBeVisible();

      // Should show driver name
      await expect(page.locator('text=Rahul Sharma')).toBeVisible();

      // Should show vehicle number
      await expect(page.locator('text=KA01AB1234')).toBeVisible();

      // Should show rating
      await expect(page.locator('text=4.8')).toBeVisible();
    });

    test('should show call button for driver', async ({ page, rideRequestPage, mapPage }) => {
      await mapPage.waitForMapLoad();
      await rideRequestPage.clickPickupButton();
      await mapPage.clickMapOffset(-50, -50);
      await rideRequestPage.clickDestinationButton();
      await mapPage.clickMapOffset(50, 50);
      await rideRequestPage.submitRideRequest();

      await page.waitForTimeout(1000);

      // Should have call button
      await expect(page.locator('a[href^="tel:"]')).toBeVisible();
    });

    test('should show location information', async ({ page, rideRequestPage, mapPage }) => {
      await mapPage.waitForMapLoad();
      await rideRequestPage.clickPickupButton();
      await mapPage.clickMapOffset(-50, -50);
      await rideRequestPage.clickDestinationButton();
      await mapPage.clickMapOffset(50, 50);
      await rideRequestPage.submitRideRequest();

      await page.waitForTimeout(1000);

      // Should show pickup label
      await expect(page.locator('text=PICKUP')).toBeVisible();

      // Should show destination label
      await expect(page.locator('text=DESTINATION')).toBeVisible();
    });

    test('should show fare information', async ({ page, rideRequestPage, mapPage }) => {
      await mapPage.waitForMapLoad();
      await rideRequestPage.clickPickupButton();
      await mapPage.clickMapOffset(-50, -50);
      await rideRequestPage.clickDestinationButton();
      await mapPage.clickMapOffset(50, 50);
      await rideRequestPage.submitRideRequest();

      await page.waitForTimeout(1000);

      // Should show estimated fare
      await expect(page.locator('text=Estimated Fare')).toBeVisible();

      // Should show fare range
      await expect(page.locator('text=120 - 150')).toBeVisible();
    });
  });

  test.describe('Completed Status', () => {
    test.beforeEach(async ({ page }) => {
      await page.route('**/v1/rides', async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify(mockCompletedRide),
          });
        }
      });

      await page.route('**/v1/rides/*', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockCompletedRide),
          });
        }
      });

      await page.goto('/');
    });

    test('should show trip completed status', async ({ page, rideRequestPage, mapPage }) => {
      await mapPage.waitForMapLoad();
      await rideRequestPage.clickPickupButton();
      await mapPage.clickMapOffset(-50, -50);
      await rideRequestPage.clickDestinationButton();
      await mapPage.clickMapOffset(50, 50);
      await rideRequestPage.submitRideRequest();

      await page.waitForTimeout(1000);

      await expect(page.locator('text=Trip Completed')).toBeVisible();
    });

    test('should show trip summary with fare breakdown', async ({ page, rideRequestPage, mapPage }) => {
      await mapPage.waitForMapLoad();
      await rideRequestPage.clickPickupButton();
      await mapPage.clickMapOffset(-50, -50);
      await rideRequestPage.clickDestinationButton();
      await mapPage.clickMapOffset(50, 50);
      await rideRequestPage.submitRideRequest();

      await page.waitForTimeout(1000);

      // Should show trip summary
      await expect(page.locator('text=Trip Summary')).toBeVisible();

      // Should show fare breakdown
      await expect(page.locator('text=Base Fare')).toBeVisible();
      await expect(page.locator('text=Distance')).toBeVisible();
      await expect(page.locator('text=Time')).toBeVisible();
      await expect(page.locator('text=Taxes')).toBeVisible();
      await expect(page.locator('text=Total')).toBeVisible();
    });

    test('should show Book New Ride button when completed', async ({ page, rideRequestPage, mapPage }) => {
      await mapPage.waitForMapLoad();
      await rideRequestPage.clickPickupButton();
      await mapPage.clickMapOffset(-50, -50);
      await rideRequestPage.clickDestinationButton();
      await mapPage.clickMapOffset(50, 50);
      await rideRequestPage.submitRideRequest();

      await page.waitForTimeout(1000);

      await expect(page.locator('button:has-text("Book New Ride")')).toBeVisible();
    });

    test('should not show Cancel button when completed', async ({ page, rideRequestPage, mapPage }) => {
      await mapPage.waitForMapLoad();
      await rideRequestPage.clickPickupButton();
      await mapPage.clickMapOffset(-50, -50);
      await rideRequestPage.clickDestinationButton();
      await mapPage.clickMapOffset(50, 50);
      await rideRequestPage.submitRideRequest();

      await page.waitForTimeout(1000);

      await expect(page.locator('button:has-text("Cancel Ride")')).not.toBeVisible();
    });
  });

  test.describe('Cancelled Status', () => {
    test.beforeEach(async ({ page }) => {
      await page.route('**/v1/rides', async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify(mockCancelledRide),
          });
        }
      });

      await page.route('**/v1/rides/*', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockCancelledRide),
          });
        }
      });

      await page.goto('/');
    });

    test('should show cancelled status', async ({ page, rideRequestPage, mapPage }) => {
      await mapPage.waitForMapLoad();
      await rideRequestPage.clickPickupButton();
      await mapPage.clickMapOffset(-50, -50);
      await rideRequestPage.clickDestinationButton();
      await mapPage.clickMapOffset(50, 50);
      await rideRequestPage.submitRideRequest();

      await page.waitForTimeout(1000);

      await expect(page.locator('text=Cancelled')).toBeVisible();
    });

    test('should show Book New Ride button when cancelled', async ({ page, rideRequestPage, mapPage }) => {
      await mapPage.waitForMapLoad();
      await rideRequestPage.clickPickupButton();
      await mapPage.clickMapOffset(-50, -50);
      await rideRequestPage.clickDestinationButton();
      await mapPage.clickMapOffset(50, 50);
      await rideRequestPage.submitRideRequest();

      await page.waitForTimeout(1000);

      await expect(page.locator('button:has-text("Book New Ride")')).toBeVisible();
    });
  });

  test.describe('No Drivers Available Status', () => {
    test.beforeEach(async ({ page }) => {
      await page.route('**/v1/rides', async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify(mockNoDriversRide),
          });
        }
      });

      await page.route('**/v1/rides/*', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockNoDriversRide),
          });
        }
      });

      await page.goto('/');
    });

    test('should show no drivers available status', async ({ page, rideRequestPage, mapPage }) => {
      await mapPage.waitForMapLoad();
      await rideRequestPage.clickPickupButton();
      await mapPage.clickMapOffset(-50, -50);
      await rideRequestPage.clickDestinationButton();
      await mapPage.clickMapOffset(50, 50);
      await rideRequestPage.submitRideRequest();

      await page.waitForTimeout(1000);

      await expect(page.locator('text=No Drivers Available')).toBeVisible();
    });
  });
});
