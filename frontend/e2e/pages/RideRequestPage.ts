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

  // Pickup location input
  get pickupButton(): Locator {
    return this.page.locator('[data-type="pickup"]').or(
      this.page.locator('button').filter({ hasText: /Pickup Point/i })
    );
  }

  get pickupButtonSet(): Locator {
    return this.page.locator('[data-testid="pickup-set"]').or(
      this.page.locator('button').filter({ hasText: /Pickup Point/i }).filter({ has: this.page.locator('svg') })
    );
  }

  // Destination location input
  get destinationButton(): Locator {
    return this.page.locator('[data-type="destination"]').or(
      this.page.locator('button').filter({ hasText: /Drop-off Point/i })
    );
  }

  get destinationButtonSet(): Locator {
    return this.page.locator('[data-testid="destination-set"]').or(
      this.page.locator('button').filter({ hasText: /Drop-off Point/i }).filter({ has: this.page.locator('svg') })
    );
  }

  // Ride type selector (TierSelector component)
  get rideTypeButton(): Locator {
    return this.page.locator('[data-testid="tier-selector"]').or(
      this.page.locator('button').filter({ hasText: /Economy|Comfort|Premium|XL/ }).first()
    );
  }

  // Ride tier options
  getTierOption(tier: 'Economy' | 'Comfort' | 'Premium' | 'XL'): Locator {
    return this.page.locator(`button:has-text("${tier}")`).last();
  }

  // Payment method buttons (PaymentMethodSelector component)
  getPaymentButton(method: 'Cash' | 'Card' | 'Wallet'): Locator {
    return this.page.locator(`button:has-text("${method}")`);
  }

  // Submit button
  get requestRideButton(): Locator {
    return this.page.locator('button[type="submit"]').or(
      this.page.locator('button:has-text("Request Ride")')
    );
  }

  // Loading state
  get loadingIndicator(): Locator {
    return this.page.locator('text=Finding Driver...');
  }

  // Error message (updated for new error styling)
  get errorMessage(): Locator {
    return this.page.locator('.bg-error-50').or(this.page.locator('.bg-rose-50'));
  }

  // Error dismiss button
  get errorDismissButton(): Locator {
    return this.page.locator('.bg-error-50 button').or(this.page.locator('.bg-rose-50 button'));
  }

  // Help section
  get helpSection(): Locator {
    return this.page.locator('text=Quick Guide').locator('..');
  }

  // Actions

  async clickPickupButton() {
    // Click the pickup location input
    const pickupBtn = this.page.locator('button').filter({ hasText: /Pickup Point/i });
    await pickupBtn.click();
  }

  async clickDestinationButton() {
    // Click the destination location input
    const destBtn = this.page.locator('button').filter({ hasText: /Drop-off Point/i });
    await destBtn.click();
  }

  async selectTier(tier: 'Economy' | 'Comfort' | 'Premium' | 'XL') {
    // Open tier dropdown
    await this.rideTypeButton.click();
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
    // Check that pickup shows coordinates (not "Tap to select on map")
    const pickupBtn = this.page.locator('button').filter({ hasText: /Pickup Point/i });
    await expect(pickupBtn).not.toContainText('Tap to select on map');
  }

  async expectDestinationSet() {
    // Check that destination shows coordinates (not "Tap to select on map")
    const destBtn = this.page.locator('button').filter({ hasText: /Drop-off Point/i });
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
    // Check for the selected state via ring/border classes
    await expect(this.getPaymentButton(method)).toHaveClass(/ring-2|border-primary/);
  }
}
