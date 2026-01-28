# E2E Tests with Playwright

Comprehensive end-to-end tests for the Ride-Hailing Frontend application.

## Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests with UI mode (interactive)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Debug tests step by step
npm run test:debug

# View test report
npm run test:report
```

## Test Structure

```
e2e/
├── fixtures/
│   └── test-fixtures.ts      # Custom test fixtures with page objects
├── pages/
│   ├── BasePage.ts           # Base page object
│   ├── MapPage.ts            # Map interaction page object
│   ├── RideRequestPage.ts    # Ride booking form page object
│   └── RideStatusPage.ts     # Ride status card page object
├── utils/
│   └── mock-api.ts           # API mocking utilities
├── ride-request-form.spec.ts # Form tests
├── map-interactions.spec.ts  # Map tests
├── ride-status-card.spec.ts  # Status card tests
└── full-ride-flow.spec.ts    # E2E flow tests
```

## Test Suites

### 1. Ride Request Form (`ride-request-form.spec.ts`)

Tests the ride booking form functionality:
- Form visibility and structure
- Payment method selection
- Ride tier selection
- Form validation
- Error handling

### 2. Map Interactions (`map-interactions.spec.ts`)

Tests map functionality:
- Map loading and display
- Location selection modes
- Marker placement
- Marker popups
- Zoom controls
- Responsive behavior

### 3. Ride Status Card (`ride-status-card.spec.ts`)

Tests ride status display:
- Different status states (Searching, Driver Assigned, etc.)
- Driver information display
- Fare information
- Trip summary
- Action buttons (Cancel, Book New Ride)

### 4. Full Ride Flow (`full-ride-flow.spec.ts`)

End-to-end tests:
- Complete booking flow
- Ride cancellation
- Booking new ride after completion
- Responsive design on different viewports
- Error handling
- Accessibility checks
- Performance benchmarks

## Page Objects

### MapPage
- `clickMapCenter()` - Click center of map
- `clickMapOffset(x, y)` - Click at offset from center
- `expectPickupMarkerVisible()` - Assert pickup marker
- `expectDestinationMarkerVisible()` - Assert destination marker

### RideRequestPage
- `clickPickupButton()` - Start pickup selection
- `clickDestinationButton()` - Start destination selection
- `selectTier(tier)` - Select ride tier
- `selectPaymentMethod(method)` - Select payment
- `submitRideRequest()` - Submit form

### RideStatusPage
- `expectStatus(status)` - Assert ride status
- `cancelRide()` - Cancel current ride
- `bookNewRide()` - Start new booking

## Mocking

The tests use API mocking to simulate different scenarios:

```typescript
import { mockRide, mockRideWithDriver, mockCompletedRide } from './utils/mock-api';

// In test
await page.route('**/v1/rides/*', async (route) => {
  await route.fulfill({
    status: 200,
    body: JSON.stringify(mockCompletedRide),
  });
});
```

## Configuration

`playwright.config.ts` includes:
- Multiple browser support (Chromium, Firefox, WebKit)
- Mobile viewport testing
- Screenshot on failure
- Video recording on retry
- HTML report generation
- Auto dev server startup

## Running in CI

```bash
# Install and run
npm ci
npx playwright install --with-deps
npm test

# Generate report
npm run test:report
```

## Debugging Failed Tests

1. **Run in headed mode:**
   ```bash
   npm run test:headed
   ```

2. **Use debug mode:**
   ```bash
   npm run test:debug
   ```

3. **Check trace viewer:**
   ```bash
   npx playwright show-trace trace.zip
   ```

4. **View screenshots:**
   - Screenshots saved to `test-results/` on failure

5. **View HTML report:**
   ```bash
   npm run test:report
   ```

## Best Practices

1. **Use page objects** for maintainability
2. **Mock API responses** for reliability
3. **Test critical user flows** thoroughly
4. **Include accessibility tests**
5. **Test responsive behavior**
6. **Keep tests independent** (no shared state)
