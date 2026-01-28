import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for Ride Status Card interactions
 */
export class RideStatusPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Status header
  get statusHeader(): Locator {
    return this.page.locator('.bg-yellow-100, .bg-blue-100, .bg-green-100, .bg-indigo-100, .bg-gray-100, .bg-red-100, .bg-orange-100').first();
  }

  // Status title
  get statusTitle(): Locator {
    return this.statusHeader.locator('h3');
  }

  // Status description
  get statusDescription(): Locator {
    return this.statusHeader.locator('p');
  }

  // Searching spinner
  get searchingSpinner(): Locator {
    return this.page.locator('.animate-spin');
  }

  // Driver info section
  get driverInfo(): Locator {
    return this.page.locator('text=★').locator('..').locator('..');
  }

  get driverName(): Locator {
    return this.driverInfo.locator('p.font-medium').first();
  }

  get driverVehicleNumber(): Locator {
    return this.driverInfo.locator('p.text-gray-600').first();
  }

  get driverRating(): Locator {
    return this.driverInfo.locator('text=★').locator('..');
  }

  get callDriverButton(): Locator {
    return this.page.locator('a[href^="tel:"]');
  }

  // Location info
  get pickupInfo(): Locator {
    return this.page.locator('text=PICKUP').locator('..');
  }

  get destinationInfo(): Locator {
    return this.page.locator('text=DESTINATION').locator('..');
  }

  // Fare info
  get estimatedFare(): Locator {
    return this.page.locator('text=Estimated Fare').locator('..');
  }

  get rideType(): Locator {
    return this.page.locator('text=Ride Type').locator('..');
  }

  // Trip summary (shown when completed)
  get tripSummary(): Locator {
    return this.page.locator('text=Trip Summary').locator('..');
  }

  get baseFare(): Locator {
    return this.page.locator('text=Base Fare').locator('..').locator('span').last();
  }

  get distanceFare(): Locator {
    return this.page.locator('text=Distance').locator('..').locator('span').last();
  }

  get timeFare(): Locator {
    return this.page.locator('text=Time').locator('..').locator('span').last();
  }

  get taxes(): Locator {
    return this.page.locator('text=Taxes').locator('..').locator('span').last();
  }

  get totalFare(): Locator {
    return this.page.locator('text=Total').locator('..').locator('span').last();
  }

  // Action buttons
  get cancelButton(): Locator {
    return this.page.locator('button:has-text("Cancel Ride")');
  }

  get bookNewRideButton(): Locator {
    return this.page.locator('button:has-text("Book New Ride")');
  }

  // Status-specific selectors
  getStatusByName(status: string): Locator {
    return this.page.locator(`h3:has-text("${status}")`);
  }

  // Actions

  async cancelRide() {
    await this.cancelButton.click();
  }

  async bookNewRide() {
    await this.bookNewRideButton.click();
  }

  async callDriver() {
    // Note: This won't actually make a call in tests
    await this.callDriverButton.click();
  }

  // Assertions

  async expectStatusCardVisible() {
    await expect(this.statusHeader).toBeVisible();
  }

  async expectStatus(status: 'Pending' | 'Finding Driver' | 'Driver Assigned' | 'Driver Arrived' | 'Trip in Progress' | 'Trip Completed' | 'Cancelled' | 'No Drivers Available') {
    await expect(this.getStatusByName(status)).toBeVisible();
  }

  async expectSearching() {
    await this.expectStatus('Finding Driver');
    await expect(this.searchingSpinner).toBeVisible();
  }

  async expectDriverAssigned() {
    await this.expectStatus('Driver Assigned');
    await expect(this.driverInfo).toBeVisible();
  }

  async expectDriverArrived() {
    await this.expectStatus('Driver Arrived');
  }

  async expectTripInProgress() {
    await this.expectStatus('Trip in Progress');
  }

  async expectTripCompleted() {
    await this.expectStatus('Trip Completed');
    await expect(this.tripSummary).toBeVisible();
  }

  async expectCancelled() {
    await this.expectStatus('Cancelled');
  }

  async expectNoDrivers() {
    await this.expectStatus('No Drivers Available');
  }

  async expectCancelButtonVisible() {
    await expect(this.cancelButton).toBeVisible();
  }

  async expectCancelButtonHidden() {
    await expect(this.cancelButton).not.toBeVisible();
  }

  async expectBookNewRideButtonVisible() {
    await expect(this.bookNewRideButton).toBeVisible();
  }

  async expectDriverInfoVisible() {
    await expect(this.driverName).toBeVisible();
    await expect(this.driverVehicleNumber).toBeVisible();
    await expect(this.driverRating).toBeVisible();
  }

  async expectFareInfoVisible() {
    await expect(this.estimatedFare).toBeVisible();
  }

  async expectLocationInfoVisible() {
    await expect(this.pickupInfo).toBeVisible();
    await expect(this.destinationInfo).toBeVisible();
  }
}
