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

export const test = base.extend<TestFixtures>({
  rideRequestPage: async ({ page }, use) => {
    const rideRequestPage = new RideRequestPage(page);
    await use(rideRequestPage);
  },

  mapPage: async ({ page }, use) => {
    const mapPage = new MapPage(page);
    await use(mapPage);
  },

  rideStatusPage: async ({ page }, use) => {
    const rideStatusPage = new RideStatusPage(page);
    await use(rideStatusPage);
  },
});

export { expect } from '@playwright/test';
