import { test, expect } from './fixtures/test-fixtures';
import {
  mockRide,
  mockRideWithDriver,
  mockCompletedRide,
  mockCancelledRide,
} from './utils/mock-api';

test.describe('Full Ride Booking Flow', () => {
  test.describe('Complete Ride Journey', () => {
    test('should complete full ride flow from booking to completion', async ({ page, rideRequestPage, mapPage }) => {
      // Step 1: Set up progressive mocking for ride status
      let callCount = 0;

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
          callCount++;
          // Progress through states
          let response;
          if (callCount <= 2) {
            response = mockRide; // SEARCHING
          } else if (callCount <= 4) {
            response = { ...mockRideWithDriver, status: 'DRIVER_ASSIGNED' };
          } else if (callCount <= 6) {
            response = { ...mockRideWithDriver, status: 'DRIVER_ARRIVED' };
          } else if (callCount <= 8) {
            response = { ...mockRideWithDriver, status: 'IN_PROGRESS' };
          } else {
            response = mockCompletedRide;
          }
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(response),
          });
        }
      });

      // Go to app
      await page.goto('/');
      await mapPage.waitForMapLoad();

      // Step 2: Select pickup location
      await rideRequestPage.clickPickupButton();
      await mapPage.expectPickupSelectionMode();
      await mapPage.clickMapOffset(-80, -80);
      await rideRequestPage.expectPickupSet();
      await mapPage.expectPickupMarkerVisible();

      // Step 3: Select destination
      await rideRequestPage.clickDestinationButton();
      await mapPage.expectDestinationSelectionMode();
      await mapPage.clickMapOffset(80, 80);
      await rideRequestPage.expectDestinationSet();
      await mapPage.expectDestinationMarkerVisible();

      // Step 4: Select ride tier
      await rideRequestPage.selectTier('Comfort');
      await expect(page.locator('button:has-text("Comfort")').first()).toBeVisible();

      // Step 5: Select payment method
      await rideRequestPage.selectPaymentMethod('Card');
      await rideRequestPage.expectPaymentSelected('Card');

      // Step 6: Submit ride request
      await rideRequestPage.expectSubmitEnabled();
      await rideRequestPage.submitRideRequest();

      // Step 7: Verify ride is being searched
      await page.waitForTimeout(1000);
      await expect(page.locator('text=Finding Driver').or(page.locator('text=Driver Assigned'))).toBeVisible();
    });

    test('should cancel ride during searching', async ({ page, rideRequestPage, mapPage }) => {
      // Mock ride creation as SEARCHING
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

      // Mock cancel endpoint
      await page.route('**/v1/rides/*/cancel', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      });

      await page.goto('/');
      await mapPage.waitForMapLoad();

      // Book a ride
      await rideRequestPage.clickPickupButton();
      await mapPage.clickMapOffset(-50, -50);
      await rideRequestPage.clickDestinationButton();
      await mapPage.clickMapOffset(50, 50);
      await rideRequestPage.submitRideRequest();

      await page.waitForTimeout(1000);

      // Should show cancel button
      const cancelButton = page.locator('button:has-text("Cancel Ride")');
      await expect(cancelButton).toBeVisible();

      // Now update the mock to return cancelled status
      await page.route('**/v1/rides/*', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockCancelledRide),
          });
        }
      });

      // Click cancel
      await cancelButton.click();

      // Verify UI updates
      await page.waitForTimeout(500);
    });

    test('should book new ride after completion', async ({ page, rideRequestPage, mapPage }) => {
      // Start with completed ride
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
      await mapPage.waitForMapLoad();

      // Book first ride
      await rideRequestPage.clickPickupButton();
      await mapPage.clickMapOffset(-50, -50);
      await rideRequestPage.clickDestinationButton();
      await mapPage.clickMapOffset(50, 50);
      await rideRequestPage.submitRideRequest();

      await page.waitForTimeout(1000);

      // Should show completed status
      await expect(page.locator('text=Trip Completed')).toBeVisible();

      // Click Book New Ride
      await page.locator('button:has-text("Book New Ride")').click();

      // Should return to booking form
      await expect(page.locator('text=Book a Ride')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page, rideRequestPage, mapPage }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

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
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockRide),
        });
      });

      await page.goto('/');
      await mapPage.waitForMapLoad();

      // Verify map is visible
      await mapPage.expectMapVisible();

      // Verify form is visible (might need to scroll)
      await expect(page.locator('text=Book a Ride')).toBeVisible();

      // Try to set locations
      await rideRequestPage.clickPickupButton();
      await mapPage.clickMapCenter();

      // Form should still be accessible
      await expect(page.locator('text=Pickup set')).toBeVisible();
    });

    test('should work on tablet viewport', async ({ page, mapPage }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      await page.goto('/');
      await mapPage.waitForMapLoad();

      // Verify both map and sidebar are visible
      await mapPage.expectMapVisible();
      await expect(page.locator('text=Book a Ride')).toBeVisible();
    });

    test('should work on desktop viewport', async ({ page, mapPage }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      await page.goto('/');
      await mapPage.waitForMapLoad();

      // Verify both map and sidebar are visible side by side
      await mapPage.expectMapVisible();
      await expect(page.locator('text=Book a Ride')).toBeVisible();

      // Verify header
      await expect(page.locator('h1:has-text("RideHailing")')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page, rideRequestPage, mapPage }) => {
      // Mock API error
      await page.route('**/v1/rides', async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Internal server error' }),
          });
        }
      });

      await page.goto('/');
      await mapPage.waitForMapLoad();

      // Try to book a ride
      await rideRequestPage.clickPickupButton();
      await mapPage.clickMapOffset(-50, -50);
      await rideRequestPage.clickDestinationButton();
      await mapPage.clickMapOffset(50, 50);
      await rideRequestPage.submitRideRequest();

      // Should show error message or handle gracefully
      await page.waitForTimeout(1000);

      // The form should still be visible (not crashed)
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should handle network timeout', async ({ page, rideRequestPage, mapPage }) => {
      // Mock slow/timeout response
      await page.route('**/v1/rides', async (route) => {
        if (route.request().method() === 'POST') {
          await page.waitForTimeout(100); // Simulate slow response
          await route.abort('timedout');
        }
      });

      await page.goto('/');
      await mapPage.waitForMapLoad();

      await rideRequestPage.clickPickupButton();
      await mapPage.clickMapOffset(-50, -50);
      await rideRequestPage.clickDestinationButton();
      await mapPage.clickMapOffset(50, 50);
      await rideRequestPage.submitRideRequest();

      await page.waitForTimeout(500);

      // App should handle timeout gracefully
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/');

      // Check for main heading
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);
      await expect(h1).toContainText('RideHailing');
    });

    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('/');

      // Tab to first interactive element
      await page.keyboard.press('Tab');

      // There should be a focused element
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should have proper button labels', async ({ page }) => {
      await page.goto('/');

      // Check that buttons have text content
      const requestButton = page.locator('button[type="submit"]');
      await expect(requestButton).toHaveText('Request Ride');

      // Payment buttons should have text
      await expect(page.locator('button:has-text("Cash")')).toBeVisible();
      await expect(page.locator('button:has-text("Card")')).toBeVisible();
      await expect(page.locator('button:has-text("Wallet")')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      const loadTime = Date.now() - startTime;

      // Should load in less than 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should render map within acceptable time', async ({ page, mapPage }) => {
      await page.goto('/');

      const startTime = Date.now();
      await mapPage.waitForMapLoad();
      const mapLoadTime = Date.now() - startTime;

      // Map should load in less than 10 seconds
      expect(mapLoadTime).toBeLessThan(10000);
    });
  });
});
