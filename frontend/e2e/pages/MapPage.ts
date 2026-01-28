import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for Map interactions
 */
export class MapPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Map container
  get mapContainer(): Locator {
    return this.page.locator('.leaflet-container');
  }

  // Map tiles
  get mapTiles(): Locator {
    return this.page.locator('.leaflet-tile-container');
  }

  // Selection mode indicator - updated for new UI
  get selectionModeIndicator(): Locator {
    return this.page.locator('text=Tap on the map to select');
  }

  get pickupSelectionMode(): Locator {
    return this.page.locator('text=Tap on the map to select your pickup location');
  }

  get destinationSelectionMode(): Locator {
    return this.page.locator('text=Tap on the map to select your drop-off location');
  }

  // Markers - updated for custom SVG markers
  get pickupMarker(): Locator {
    return this.page.locator('.custom-marker').first();
  }

  get destinationMarker(): Locator {
    return this.page.locator('.custom-marker').nth(1);
  }

  get driverMarker(): Locator {
    return this.page.locator('.custom-marker').last();
  }

  // All markers
  get allMarkers(): Locator {
    return this.page.locator('.custom-marker, .leaflet-marker-icon');
  }

  // Popup
  get markerPopup(): Locator {
    return this.page.locator('.leaflet-popup');
  }

  get popupContent(): Locator {
    return this.page.locator('.leaflet-popup-content');
  }

  // Zoom controls - custom zoom buttons
  get zoomInButton(): Locator {
    return this.page.locator('button svg path[d*="M12 6v6m0 0v6"]').locator('..');
  }

  get zoomOutButton(): Locator {
    return this.page.locator('button svg path[d*="M20 12H4"]').locator('..');
  }

  // Actions

  async waitForMapLoad() {
    // Wait for Leaflet container to be visible
    await this.mapContainer.waitFor({ state: 'visible', timeout: 10000 });
    // Wait for tiles to load
    await this.page.waitForFunction(() => {
      const tiles = document.querySelectorAll('.leaflet-tile-loaded');
      return tiles.length > 0;
    }, { timeout: 15000 });
  }

  async clickOnMap(x: number, y: number) {
    // Click at specific coordinates relative to map center
    const mapBox = await this.mapContainer.boundingBox();
    if (!mapBox) throw new Error('Map container not found');

    const clickX = mapBox.x + mapBox.width / 2 + x;
    const clickY = mapBox.y + mapBox.height / 2 + y;

    await this.page.mouse.click(clickX, clickY);
  }

  async clickMapCenter() {
    await this.clickOnMap(0, 0);
  }

  async clickMapOffset(offsetX: number, offsetY: number) {
    await this.clickOnMap(offsetX, offsetY);
  }

  async zoomIn() {
    // Try custom zoom button first, fall back to Leaflet control
    const customZoomIn = this.page.locator('button').filter({ has: this.page.locator('svg path[d*="M12 6v6"]') });
    const leafletZoomIn = this.page.locator('.leaflet-control-zoom-in');

    if (await customZoomIn.isVisible()) {
      await customZoomIn.click();
    } else {
      await leafletZoomIn.click();
    }
    await this.page.waitForTimeout(300); // Wait for zoom animation
  }

  async zoomOut() {
    // Try custom zoom button first, fall back to Leaflet control
    const customZoomOut = this.page.locator('button').filter({ has: this.page.locator('svg path[d*="M20 12H4"]') });
    const leafletZoomOut = this.page.locator('.leaflet-control-zoom-out');

    if (await customZoomOut.isVisible()) {
      await customZoomOut.click();
    } else {
      await leafletZoomOut.click();
    }
    await this.page.waitForTimeout(300);
  }

  async clickMarker(type: 'pickup' | 'destination' | 'driver') {
    const markers = this.page.locator('.custom-marker, .leaflet-marker-icon');
    switch (type) {
      case 'pickup':
        await markers.first().click();
        break;
      case 'destination':
        await markers.nth(1).click();
        break;
      case 'driver':
        await markers.last().click();
        break;
    }
  }

  async closePopup() {
    const closeButton = this.page.locator('.leaflet-popup-close-button');
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  }

  // Assertions

  async expectMapVisible() {
    await expect(this.mapContainer).toBeVisible();
  }

  async expectMapLoaded() {
    await this.waitForMapLoad();
  }

  async expectPickupSelectionMode() {
    await expect(this.pickupSelectionMode).toBeVisible();
  }

  async expectDestinationSelectionMode() {
    await expect(this.destinationSelectionMode).toBeVisible();
  }

  async expectNoSelectionMode() {
    await expect(this.selectionModeIndicator).not.toBeVisible();
  }

  async expectPickupMarkerVisible() {
    const markers = this.page.locator('.custom-marker, .leaflet-marker-icon');
    await expect(markers.first()).toBeVisible();
  }

  async expectDestinationMarkerVisible() {
    const markers = this.page.locator('.custom-marker, .leaflet-marker-icon');
    await expect(markers).toHaveCount(2, { timeout: 5000 });
  }

  async expectDriverMarkerVisible() {
    const markers = this.page.locator('.custom-marker, .leaflet-marker-icon');
    const count = await markers.count();
    expect(count).toBeGreaterThan(0);
  }

  async expectMarkerCount(count: number) {
    await expect(this.allMarkers).toHaveCount(count);
  }

  async expectPopupVisible() {
    await expect(this.markerPopup).toBeVisible();
  }

  async expectPopupContains(text: string) {
    await expect(this.popupContent).toContainText(text);
  }

  async expectZoomControlsVisible() {
    // Check for custom zoom controls
    const zoomButtons = this.page.locator('button svg path[d*="M12 6v6"], button svg path[d*="M20 12H4"]');
    await expect(zoomButtons.first()).toBeVisible();
  }
}
