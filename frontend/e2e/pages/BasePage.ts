import { Page, Locator } from '@playwright/test';

/**
 * Base page object with common utilities
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string = '/') {
    await this.page.goto(path);
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async waitForElement(selector: string, timeout: number = 10000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }

  // Get header element
  get header(): Locator {
    return this.page.locator('header');
  }

  // Get app title
  get appTitle(): Locator {
    return this.page.locator('header h1');
  }

  // Get connection status indicator
  get connectionStatus(): Locator {
    return this.page.locator('text=Connected');
  }
}
