import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for Ride Request Form and related interactions
 */
export class RideRequestPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Form container
  get formContainer(): Locator {
    return this.page.locator('text=Book Your Ride').locator('..');
  }

  // Pickup location button
  get pickupButton(): Locator {
    return this.page.locator('button:has-text("Tap to select on map")').first();
  }

  get pickupButtonSet(): Locator {
    return this.page.locator('[data-testid="pickup-set"]').or(
      this.page.locator('button').filter({ hasText: /Pickup Location/i }).filter({ has: this.page.locator('svg') })
    );
  }

  // Destination location button
  get destinationButton(): Locator {
    return this.page.locator('button:has-text("Tap to select on map")').last();
  }

  get destinationButtonSet(): Locator {
    return this.page.locator('[data-testid="destination-set"]').or(
      this.page.locator('button').filter({ hasText: /Drop-off Location/i }).filter({ has: this.page.locator('svg') })
    );
  }

  // Ride type selector
  get rideTypeButton(): Locator {
    return this.page.locator('button:has-text("Economy")').first();
  }

  // Ride tier options
  getTierOption(tier: 'Economy' | 'Comfort' | 'Premium' | 'XL'): Locator {
    return this.page.locator(`button:has-text("${tier}")`).last();
  }

  // Payment method buttons
  getPaymentButton(method: 'Cash' | 'Card' | 'Wallet'): Locator {
    return this.page.locator(`button:has-text("${method}")`);
  }

  // Submit button
  get requestRideButton(): Locator {
    return this.page.locator('button[type="submit"]');
  }

  // Loading state
  get loadingIndicator(): Locator {
    return this.page.locator('text=Finding Driver...');
  }

  // Error message
  get errorMessage(): Locator {
    return this.page.locator('.bg-rose-50');
  }

  // Error dismiss button
  get errorDismissButton(): Locator {
    return this.page.locator('.bg-rose-50 button');
  }

  // Help section
  get helpSection(): Locator {
    return this.page.locator('text=Quick Guide').locator('..');
  }

  // Actions

  async clickPickupButton() {
    // Click the pickup location button which contains "Tap to select on map"
    const pickupBtn = this.page.locator('button').filter({ hasText: /Pickup Location/i }).filter({ hasText: /Tap to select/i });
    await pickupBtn.click();
  }

  async clickDestinationButton() {
    // Click the destination location button which contains "Tap to select on map"
    const destBtn = this.page.locator('button').filter({ hasText: /Drop-off Location/i }).filter({ hasText: /Tap to select/i });
    await destBtn.click();
  }

  async selectTier(tier: 'Economy' | 'Comfort' | 'Premium' | 'XL') {
    // Open tier dropdown - find the Choose Your Ride section button
    const tierSelector = this.page.locator('button').filter({ hasText: /Choose Your Ride|Economy|Comfort|Premium|XL/ }).first();
    await tierSelector.click();
    // Select tier
    await this.page.locator(`button:has-text("${tier}")`).last().click();
  }

  async selectPaymentMethod(method: 'Cash' | 'Card' | 'Wallet') {
    await this.getPaymentButton(method).click();
  }

  async submitRideRequest() {
    await this.requestRideButton.click();
  }

  async dismissError() {
    await this.errorDismissButton.click();
  }

  // Assertions

  async expectFormVisible() {
    await expect(this.page.locator('text=Book Your Ride')).toBeVisible();
  }

  async expectPickupSet() {
    // Check that pickup button shows coordinates (not "Tap to select on map")
    const pickupBtn = this.page.locator('button').filter({ hasText: /Pickup Location/i });
    await expect(pickupBtn).not.toContainText('Tap to select on map');
  }

  async expectDestinationSet() {
    // Check that destination button shows coordinates (not "Tap to select on map")
    const destBtn = this.page.locator('button').filter({ hasText: /Drop-off Location/i });
    await expect(destBtn).not.toContainText('Tap to select on map');
  }

  async expectSubmitEnabled() {
    await expect(this.requestRideButton).toBeEnabled();
  }

  async expectSubmitDisabled() {
    await expect(this.requestRideButton).toBeDisabled();
  }

  async expectLoading() {
    await expect(this.loadingIndicator).toBeVisible();
  }

  async expectError(message?: string) {
    await expect(this.errorMessage).toBeVisible();
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
  }

  async expectPaymentSelected(method: 'Cash' | 'Card' | 'Wallet') {
    await expect(this.getPaymentButton(method)).toHaveClass(/border-primary-500/);
  }
}
