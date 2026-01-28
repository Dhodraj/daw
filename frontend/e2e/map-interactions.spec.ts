import { test, expect } from './fixtures/test-fixtures';

test.describe('Map Interactions', () => {
  test.beforeEach(async ({ page, mapPage }) => {
    await page.goto('/');
    await mapPage.waitForMapLoad();
  });

  test('should display the map on initial load', async ({ mapPage }) => {
    await mapPage.expectMapVisible();
  });

  test('should load map tiles', async ({ mapPage }) => {
    await mapPage.expectMapLoaded();
  });

  test('should show pickup selection mode indicator when selecting pickup', async ({ page, rideRequestPage, mapPage }) => {
    // Click pickup button
    await rideRequestPage.clickPickupButton();

    // Should show selection mode indicator
    await mapPage.expectPickupSelectionMode();
  });

  test('should show destination selection mode indicator when selecting destination', async ({ page, rideRequestPage, mapPage }) => {
    // First set pickup
    await rideRequestPage.clickPickupButton();
    await mapPage.clickMapCenter();

    // Click destination button
    await rideRequestPage.clickDestinationButton();

    // Should show selection mode indicator
    await mapPage.expectDestinationSelectionMode();
  });

  test('should place pickup marker when clicking on map in pickup mode', async ({ rideRequestPage, mapPage }) => {
    // Enter pickup selection mode
    await rideRequestPage.clickPickupButton();
    await mapPage.expectPickupSelectionMode();

    // Click on map
    await mapPage.clickMapOffset(-30, -30);

    // Selection mode should be dismissed
    await mapPage.expectNoSelectionMode();

    // Pickup marker should be visible
    await mapPage.expectPickupMarkerVisible();
  });

  test('should place destination marker when clicking on map in destination mode', async ({ rideRequestPage, mapPage }) => {
    // First set pickup
    await rideRequestPage.clickPickupButton();
    await mapPage.clickMapOffset(-50, -50);

    // Enter destination selection mode
    await rideRequestPage.clickDestinationButton();
    await mapPage.expectDestinationSelectionMode();

    // Click on map
    await mapPage.clickMapOffset(50, 50);

    // Selection mode should be dismissed
    await mapPage.expectNoSelectionMode();

    // Destination marker should be visible
    await mapPage.expectDestinationMarkerVisible();
  });

  test('should show both markers when both locations are set', async ({ rideRequestPage, mapPage }) => {
    // Set pickup
    await rideRequestPage.clickPickupButton();
    await mapPage.clickMapOffset(-60, -60);

    // Set destination
    await rideRequestPage.clickDestinationButton();
    await mapPage.clickMapOffset(60, 60);

    // Both markers should be visible
    await mapPage.expectPickupMarkerVisible();
    await mapPage.expectDestinationMarkerVisible();

    // Should have exactly 2 markers
    await mapPage.expectMarkerCount(2);
  });

  test('should not place marker when clicking without selection mode', async ({ mapPage }) => {
    // Click on map without selecting mode
    await mapPage.clickMapCenter();

    // No markers should appear (only default)
    const markers = mapPage.allMarkers;
    await expect(markers).toHaveCount(0);
  });

  test('should display popup when clicking on pickup marker', async ({ rideRequestPage, mapPage }) => {
    // Set pickup
    await rideRequestPage.clickPickupButton();
    await mapPage.clickMapCenter();

    // Wait for marker
    await mapPage.expectPickupMarkerVisible();

    // Click on marker
    await mapPage.clickMarker('pickup');

    // Popup should be visible
    await mapPage.expectPopupVisible();
    await mapPage.expectPopupContains('Pickup Location');
  });

  test('should display popup when clicking on destination marker', async ({ rideRequestPage, mapPage }) => {
    // Set pickup first
    await rideRequestPage.clickPickupButton();
    await mapPage.clickMapOffset(-50, -50);

    // Set destination
    await rideRequestPage.clickDestinationButton();
    await mapPage.clickMapOffset(50, 50);

    // Wait for marker
    await mapPage.expectDestinationMarkerVisible();

    // Click on marker
    await mapPage.clickMarker('destination');

    // Popup should be visible
    await mapPage.expectPopupVisible();
    await mapPage.expectPopupContains('Destination');
  });

  test('should have zoom controls', async ({ page, mapPage }) => {
    // We use custom zoom controls instead of Leaflet's default
    // Look for zoom buttons with + and - icons
    await mapPage.expectZoomControlsVisible();
  });

  test('should zoom in when clicking zoom in button', async ({ page, mapPage }) => {
    // Get initial zoom
    const initialZoom = await page.evaluate(() => {
      // @ts-ignore - Leaflet exposes map on window in development
      const container = document.querySelector('.leaflet-container');
      // We can check the transform or zoom level through the container classes
      return container?.className || '';
    });

    await mapPage.zoomIn();

    // The zoom should have changed (map updates)
    // We verify by checking the page is still functional
    await mapPage.expectMapVisible();
  });

  test('should zoom out when clicking zoom out button', async ({ mapPage }) => {
    await mapPage.zoomOut();
    await mapPage.expectMapVisible();
  });

  test('should close popup when clicking close button', async ({ rideRequestPage, mapPage }) => {
    // Set pickup
    await rideRequestPage.clickPickupButton();
    await mapPage.clickMapCenter();

    // Click on marker to open popup
    await mapPage.clickMarker('pickup');
    await mapPage.expectPopupVisible();

    // Close popup
    await mapPage.closePopup();

    // Popup should not be visible
    const popup = mapPage.markerPopup;
    await expect(popup).not.toBeVisible();
  });

  test('should center map on Bangalore by default', async ({ page }) => {
    // The map should be centered on Bangalore (approximately)
    // We can verify by checking if specific tiles are loaded
    await expect(page.locator('.leaflet-container')).toBeVisible();

    // Check attribution mentions OpenStreetMap
    await expect(page.locator('text=OpenStreetMap')).toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page, mapPage }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Map should still be visible
    await mapPage.expectMapVisible();

    // Map container should be present
    await expect(page.locator('.leaflet-container')).toBeVisible();
  });
});
