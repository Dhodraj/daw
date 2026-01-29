# SwiftRide Frontend

Multi-tenant ride-hailing frontend with three logical applications (Rider, Driver, Ops) deployed from a single React codebase.

## Tech Stack

- **React** 19.2 with TypeScript
- **Vite** 7.3 (build tool)
- **React Router** 6.30 (routing)
- **Zustand** 5.0 (state management)
- **Tailwind CSS** 4.1 (styling)
- **Framer Motion** 12.0 (animations)
- **Socket.io** (real-time updates)
- **Leaflet** (maps)

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run E2E tests
npm run test:e2e
```

## Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   SwiftRide Frontend                        │
│                   (Single Codebase)                         │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────┴───────┐   ┌───────┴───────┐   ┌───────┴───────┐
│   Rider App   │   │  Driver App   │   │ Ops Dashboard │
│   /rider/*    │   │  /driver/*    │   │    /ops/*     │
│  (Blue theme) │   │(Emerald theme)│   │(Violet theme) │
└───────────────┘   └───────────────┘   └───────────────┘
```

### Route Structure

| Path | Application | Layout | Target User |
|------|-------------|--------|-------------|
| `/` | App Selector | None | All users |
| `/rider/*` | Rider App | RiderLayout | Passengers |
| `/driver/*` | Driver App | DriverLayout | Drivers |
| `/ops/*` | Ops Dashboard | OpsLayout | Operations/Admin |

## Project Structure

```
src/
├── components/
│   ├── atoms/                    # Basic UI components
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Input/
│   │   └── Skeleton/
│   ├── molecules/                # Composite components
│   │   ├── AddressAutocomplete/
│   │   ├── LocationPicker/
│   │   └── RideMap/
│   ├── templates/                # Layout templates
│   │   ├── RiderLayout.tsx       # Rider app layout (bottom nav)
│   │   ├── DriverLayout.tsx      # Driver app layout (emerald theme)
│   │   └── OpsLayout.tsx         # Ops dashboard layout (sidebar)
│   └── guards/                   # Route protection
│       ├── AuthGuard.tsx         # Authentication required
│       └── RoleGuard.tsx         # Role-based access
├── pages/
│   ├── AppSelectorPage.tsx       # Root landing page
│   ├── rider/                    # Rider app pages
│   │   ├── HomePage.tsx          # Ride booking
│   │   ├── SearchingPage.tsx     # Driver matching
│   │   ├── RideStatusPage.tsx    # Driver ETA
│   │   ├── RideInProgressPage.tsx
│   │   ├── RideCompletedPage.tsx
│   │   ├── PaymentsPage.tsx
│   │   ├── HistoryPage.tsx
│   │   ├── SupportPage.tsx
│   │   └── LoginPage.tsx
│   ├── driver/                   # Driver app pages
│   │   ├── StatusPage.tsx        # Online/offline toggle
│   │   ├── RequestsPage.tsx      # Incoming ride offers
│   │   ├── NavigatePage.tsx      # Navigate to pickup
│   │   ├── RideInProgressPage.tsx
│   │   ├── EndTripPage.tsx
│   │   ├── EarningsPage.tsx
│   │   ├── HistoryPage.tsx
│   │   └── LoginPage.tsx
│   └── ops/                      # Ops dashboard pages
│       ├── OverviewPage.tsx      # System metrics
│       ├── RidesPage.tsx         # All rides
│       ├── DriversPage.tsx       # Driver management
│       ├── RegionsPage.tsx       # Region config
│       ├── SurgePricingPage.tsx  # Pricing rules
│       ├── PaymentsPage.tsx
│       └── AlertsPage.tsx
├── router/
│   ├── index.tsx                 # Main router
│   ├── rider.routes.tsx          # Rider route config
│   ├── driver.routes.tsx         # Driver route config
│   ├── ops.routes.tsx            # Ops route config
│   └── root.routes.tsx           # Root routes
├── stores/
│   ├── themeStore.ts             # Theme (dark/light) - shared
│   ├── authStore.ts              # Authentication - shared
│   ├── rideStore.ts              # Ride state - rider app
│   ├── driverStore.ts            # Driver state - driver app
│   └── opsStore.ts               # Ops state - ops dashboard
├── hooks/
│   └── useAuth.ts                # Auth utilities
├── services/
│   ├── api.ts                    # REST API client
│   └── socket.ts                 # WebSocket client
├── utils/
│   └── cn.ts                     # Tailwind class merge
├── App.tsx
└── main.tsx
```

## Applications

### Rider App (`/rider/*`)

For passengers to book and track rides.

| Route | Page | Description |
|-------|------|-------------|
| `/rider` | HomePage | Book a ride with map |
| `/rider/login` | LoginPage | Authentication |
| `/rider/searching` | SearchingPage | Driver matching animation |
| `/rider/ride/:id/status` | RideStatusPage | Driver ETA & location |
| `/rider/ride/:id/in-progress` | RideInProgressPage | Live ride tracking |
| `/rider/ride/:id/completed` | RideCompletedPage | Trip summary & rating |
| `/rider/payments` | PaymentsPage | Manage payment methods |
| `/rider/history` | HistoryPage | Past rides |
| `/rider/support` | SupportPage | Help center |

### Driver App (`/driver/*`)

For drivers to accept and complete rides.

| Route | Page | Description |
|-------|------|-------------|
| `/driver` | StatusPage | Online/offline toggle |
| `/driver/login` | LoginPage | Authentication |
| `/driver/status` | StatusPage | Status control |
| `/driver/requests` | RequestsPage | Incoming ride offers |
| `/driver/ride/:id/navigate` | NavigatePage | Turn-by-turn to pickup |
| `/driver/ride/:id/in-progress` | RideInProgressPage | Active trip navigation |
| `/driver/ride/:id/end-trip` | EndTripPage | Complete ride & rate rider |
| `/driver/earnings` | EarningsPage | Income dashboard |
| `/driver/history` | HistoryPage | Trip history |

### Ops Dashboard (`/ops/*`)

For operations and admin staff to manage the platform.

| Route | Page | Description |
|-------|------|-------------|
| `/ops` | OverviewPage | System health dashboard |
| `/ops/overview` | OverviewPage | Metrics & KPIs |
| `/ops/rides` | RidesPage | All rides management |
| `/ops/drivers` | DriversPage | Driver management |
| `/ops/regions` | RegionsPage | Region configuration |
| `/ops/surge-pricing` | SurgePricingPage | Dynamic pricing rules |
| `/ops/payments` | PaymentsPage | Payment oversight |
| `/ops/alerts` | AlertsPage | System alerts |

## State Management

### Shared Stores

**Theme Store** (`themeStore.ts`):
```typescript
{
  isDark: boolean;
  toggleTheme: () => void;
}
```

**Auth Store** (`authStore.ts`):
```typescript
{
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user, token) => void;
  logout: () => void;
  hasRole: (roles) => boolean;
}
```

### App-Specific Stores

**Ride Store** (Rider):
- Current ride state
- Fare estimates
- Pickup/destination locations

**Driver Store** (Driver):
- Online/offline status
- Current trip
- Pending requests
- Today's stats

**Ops Store** (Ops):
- System metrics
- Alert queue
- Selected filters

## Authentication

### Demo Users

The app includes demo users for testing:

```typescript
const demoUsers = {
  rider: { role: 'rider', name: 'Demo Rider' },
  driver: { role: 'driver', name: 'Demo Driver' },
  ops: { role: 'ops', name: 'Demo Ops' },
  admin: { role: 'admin', name: 'Demo Admin' },
};
```

### Route Guards

**AuthGuard**: Requires authentication
```tsx
<AuthGuard>
  <ProtectedPage />
</AuthGuard>
```

**RoleGuard**: Requires specific role(s)
```tsx
<RoleGuard allowedRoles={['ops', 'admin']}>
  <AdminPage />
</RoleGuard>
```

## Styling

### Theme Colors

| App | Primary Color | Accent |
|-----|---------------|--------|
| Rider | Blue (`primary-500`) | Blue gradient |
| Driver | Emerald (`emerald-500`) | Teal gradient |
| Ops | Violet (`violet-500`) | Purple accent |

### Dark Mode

All apps support dark mode via `themeStore`. Toggle with the theme button in each layout's header.

## Development

### Environment Variables

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
VITE_TENANT_ID=default
```

### Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test:e2e     # Run Playwright tests
```

### Adding a New Page

1. Create page component in `src/pages/{app}/`
2. Add route in `src/router/{app}.routes.tsx`
3. Update layout navigation if needed

### Adding a New Store

1. Create store in `src/stores/`
2. Export from store file
3. Use with `useStore()` hook in components

## Testing

### E2E Tests (Playwright)

```bash
# Run all tests
npm run test:e2e

# Run specific app tests
npx playwright test rider
npx playwright test driver
npx playwright test ops
```

### Test Structure

```
e2e/
├── pages/                    # Page objects
│   └── RideRequestPage.ts
├── ride-request-form.spec.ts
├── ride-status-card.spec.ts
└── README.md
```

## Build & Deployment

```bash
# Build for production
npm run build

# Output in dist/
dist/
├── index.html
├── assets/
│   ├── index-[hash].css
│   └── index-[hash].js
```

The build produces a single SPA that handles all three applications via client-side routing.

## License

MIT
