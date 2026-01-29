import { test as base } from '@playwright/test';
import { RideRequestPage } from '../pages/RideRequestPage';
import { MapPage } from '../pages/MapPage';
import { RideStatusPage } from '../pages/RideStatusPage';

/**
 * Extended test fixtures with page objects
 */
type TestFixtures = {
  rideRequestPage: RideRequestPage;
  mapPage: MapPage;
  rideStatusPage: RideStatusPage;
};

/* eslint-disable react-hooks/rules-of-hooks -- Playwright's `use` is not a React hook */
export const test = base.extend<TestFixtures>({
  rideRequestPage: async ({ page }, use) => {
    const pageObj = new RideRequestPage(page);
    await use(pageObj);
  },

  mapPage: async ({ page }, use) => {
    const pageObj = new MapPage(page);
    await use(pageObj);
  },

  rideStatusPage: async ({ page }, use) => {
    const pageObj = new RideStatusPage(page);
    await use(pageObj);
  },
});
/* eslint-enable react-hooks/rules-of-hooks */

export { expect } from '@playwright/test';
