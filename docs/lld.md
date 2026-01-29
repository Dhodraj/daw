# Low-Level Design (LLD)

## Ride-Hailing System - Technical Specification

### 1. Database Schema

#### 1.1 Tenant Registry (Public Schema)

```sql
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    schema_name VARCHAR(100) NOT NULL UNIQUE,
    region VARCHAR(50) NOT NULL,
    config JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tenants_status ON public.tenants(status);
```

#### 1.2 Driver Table (Tenant Schema)

```sql
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    vehicle_number VARCHAR(50) NOT NULL,
    vehicle_type VARCHAR(20) NOT NULL,  -- ECONOMY, COMFORT, PREMIUM, XL
    status VARCHAR(20) DEFAULT 'OFFLINE', -- OFFLINE, AVAILABLE, BUSY, ON_TRIP
    rating DECIMAL(2,1) DEFAULT 5.0,
    acceptance_rate DECIMAL(3,2) DEFAULT 1.00,
    total_trips INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_vehicle_type ON drivers(vehicle_type);
CREATE INDEX idx_drivers_phone ON drivers(phone);
```

#### 1.3 Rider Table

```sql
CREATE TABLE riders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    default_payment_method VARCHAR(50) DEFAULT 'CASH',
    rating DECIMAL(2,1) DEFAULT 5.0,
    total_rides INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_riders_phone ON riders(phone);
```

#### 1.4 Ride Table

```sql
CREATE TABLE rides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rider_id UUID NOT NULL REFERENCES riders(id),
    driver_id UUID REFERENCES drivers(id),
    idempotency_key VARCHAR(255),

    -- Locations
    pickup_lat DECIMAL(10, 6) NOT NULL,
    pickup_lng DECIMAL(10, 6) NOT NULL,
    pickup_address TEXT,
    destination_lat DECIMAL(10, 6) NOT NULL,
    destination_lng DECIMAL(10, 6) NOT NULL,
    destination_address TEXT,

    -- Ride details
    tier VARCHAR(20) NOT NULL,            -- ECONOMY, COMFORT, PREMIUM, XL
    status VARCHAR(20) DEFAULT 'PENDING', -- State machine status
    payment_method VARCHAR(50) NOT NULL,

    -- Pricing
    estimated_fare_min DECIMAL(10, 2),
    estimated_fare_max DECIMAL(10, 2),
    surge_multiplier DECIMAL(3, 2) DEFAULT 1.00,

    -- Timestamps
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    driver_assigned_at TIMESTAMPTZ,
    driver_arrived_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,

    CONSTRAINT unique_idempotency UNIQUE (idempotency_key)
);

CREATE INDEX idx_rides_rider ON rides(rider_id);
CREATE INDEX idx_rides_driver ON rides(driver_id);
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_rides_idempotency ON rides(idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX idx_rides_requested_at ON rides(requested_at DESC);
```

#### 1.5 Trip Table

```sql
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL UNIQUE REFERENCES rides(id),
    driver_id UUID NOT NULL REFERENCES drivers(id),
    rider_id UUID NOT NULL REFERENCES riders(id),

    status VARCHAR(20) DEFAULT 'NOT_STARTED', -- NOT_STARTED, IN_PROGRESS, PAUSED, COMPLETED

    -- Locations
    start_lat DECIMAL(10, 6),
    start_lng DECIMAL(10, 6),
    end_lat DECIMAL(10, 6),
    end_lng DECIMAL(10, 6),

    -- Metrics
    distance_meters INTEGER,
    duration_seconds INTEGER,

    -- Fare breakdown
    base_fare DECIMAL(10, 2),
    distance_fare DECIMAL(10, 2),
    time_fare DECIMAL(10, 2),
    surge_fare DECIMAL(10, 2),
    taxes DECIMAL(10, 2),
    total_fare DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'INR',

    -- Timestamps
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trips_ride ON trips(ride_id);
CREATE INDEX idx_trips_driver ON trips(driver_id);
CREATE INDEX idx_trips_status ON trips(status);
```

#### 1.6 Payment Table

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id),
    idempotency_key VARCHAR(255),

    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PROCESSING, COMPLETED, FAILED

    psp_transaction_id VARCHAR(255),
    psp_response JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,

    CONSTRAINT unique_payment_idempotency UNIQUE (idempotency_key)
);

CREATE INDEX idx_payments_trip ON payments(trip_id);
CREATE INDEX idx_payments_status ON payments(status);
```

### 2. Redis Data Structures

#### 2.1 Driver Geospatial Index

```
Key:     geo:drivers:{tenantId}:{tier}
Type:    Sorted Set (GEOADD)
Example: geo:drivers:tenant1:ECONOMY
Value:   GEOADD <key> <longitude> <latitude> <driverId>

Commands:
- Add/Update:  GEOADD geo:drivers:tenant1:ECONOMY 77.5946 12.9716 driver123
- Search:      GEOSEARCH geo:drivers:tenant1:ECONOMY FROMLONLAT 77.5946 12.9716 BYRADIUS 5000 m ASC COUNT 20
- Remove:      ZREM geo:drivers:tenant1:ECONOMY driver123
```

#### 2.2 Driver Location Cache

```
Key:     driver:loc:{driverId}
Type:    String (JSON)
TTL:     120 seconds
Example: driver:loc:driver123

Value: {
  "latitude": 12.9716,
  "longitude": 77.5946,
  "heading": 90,
  "speed": 45,
  "timestamp": "2024-01-15T10:30:00Z"
}

Commands:
- Set:  SET driver:loc:driver123 '{"latitude":12.97,...}' EX 120
- Get:  GET driver:loc:driver123
```

#### 2.3 Driver Lock (Prevent Double-Booking)

```
Key:     driver:lock:{driverId}
Type:    String
TTL:     30 seconds
Value:   rideId

Commands:
- Lock:    SET driver:lock:driver456 ride789 NX EX 30
- Unlock:  DEL driver:lock:driver456
- Check:   EXISTS driver:lock:driver456
```

#### 2.4 Idempotency Cache

```
Key:     idem:{tenantId}:{idempotencyKey}
Type:    String (JSON)
TTL:     86400 seconds (24 hours)

Value: {
  "statusCode": 201,
  "body": { "id": "ride123", "status": "SEARCHING" }
}

Commands:
- Set:  SET idem:tenant1:abc123 '{"statusCode":201,...}' NX EX 86400
- Get:  GET idem:tenant1:abc123
```

#### 2.5 Ride Status Cache

```
Key:     ride:status:{rideId}
Type:    String (JSON)
TTL:     30 seconds

Value: {
  "status": "DRIVER_ASSIGNED",
  "driverId": "driver123",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### 3. API Specifications

#### 3.1 POST /v1/rides - Create Ride

**Request:**
```typescript
// Headers
X-Tenant-Id: string (required)
X-Idempotency-Key: string (required)
Authorization: Bearer <token>

// Body
{
  "riderId": "uuid",
  "pickupLocation": {
    "latitude": number,    // -90 to 90
    "longitude": number,   // -180 to 180
    "address": string?     // optional
  },
  "destinationLocation": {
    "latitude": number,
    "longitude": number,
    "address": string?
  },
  "tier": "ECONOMY" | "COMFORT" | "PREMIUM" | "XL",
  "paymentMethod": "CASH" | "CARD" | "WALLET"
}
```

**Response (201/202):**
```typescript
{
  "id": "uuid",
  "status": "SEARCHING",
  "estimatedFare": {
    "min": number,
    "max": number,
    "currency": "INR"
  },
  "surgeMultiplier": number,
  "createdAt": "ISO8601"
}
```

#### 3.2 GET /v1/rides/{id} - Get Ride Status

**Response (200):**
```typescript
{
  "id": "uuid",
  "status": "DRIVER_ASSIGNED",
  "rider": {
    "id": "uuid",
    "name": string,
    "phone": string
  },
  "driver": {
    "id": "uuid",
    "name": string,
    "phone": string,
    "vehicleNumber": string,
    "vehicleType": string,
    "rating": number,
    "currentLocation": {
      "latitude": number,
      "longitude": number
    }
  },
  "pickup": {
    "location": { "latitude": number, "longitude": number },
    "address": string
  },
  "destination": {
    "location": { "latitude": number, "longitude": number },
    "address": string
  },
  "tier": string,
  "estimatedFare": {
    "min": number,
    "max": number,
    "currency": string
  },
  "trip": {
    "id": "uuid",
    "status": string,
    "fare": {
      "baseFare": number,
      "distanceFare": number,
      "timeFare": number,
      "taxes": number,
      "total": number
    }
  }
}
```

#### 3.3 POST /v1/drivers/{id}/location - Update Location

**Request:**
```typescript
{
  "latitude": number,
  "longitude": number,
  "heading": number?,    // 0-360 degrees
  "speed": number?,      // km/h
  "timestamp": "ISO8601"?
}
```

**Response (202):**
```typescript
{
  "acknowledged": true
}
```

#### 3.4 POST /v1/drivers/{id}/accept - Accept Ride

**Request:**
```typescript
// Headers
X-Idempotency-Key: string

// Body
{
  "rideId": "uuid"
}
```

**Response (200):**
```typescript
{
  "rideId": "uuid",
  "riderId": "uuid",
  "pickup": {
    "location": { "latitude": number, "longitude": number },
    "address": string
  },
  "destination": {
    "location": { "latitude": number, "longitude": number },
    "address": string
  },
  "estimatedFare": {
    "min": number,
    "max": number,
    "currency": string
  }
}
```

#### 3.5 POST /v1/trips/{id}/end - End Trip

**Request:**
```typescript
// Headers
X-Idempotency-Key: string

// Body
{
  "endLocation": {
    "latitude": number,
    "longitude": number
  }
}
```

**Response (200):**
```typescript
{
  "id": "uuid",
  "rideId": "uuid",
  "status": "COMPLETED",
  "fare": {
    "baseFare": number,
    "distanceFare": number,
    "timeFare": number,
    "surgeFare": number,
    "taxes": number,
    "total": number,
    "currency": "INR"
  },
  "distance": {
    "meters": number,
    "displayText": "5.2 km"
  },
  "duration": {
    "seconds": number,
    "displayText": "20 min"
  },
  "endedAt": "ISO8601"
}
```

#### 3.6 POST /v1/payments - Process Payment

**Request:**
```typescript
// Headers
X-Idempotency-Key: string

// Body
{
  "tripId": "uuid",
  "amount": number,
  "currency": "INR",
  "paymentMethod": "CASH" | "CARD" | "WALLET",
  "cardToken": string?  // Required if paymentMethod is CARD
}
```

**Response (202):**
```typescript
{
  "id": "uuid",
  "status": "PROCESSING",
  "amount": number,
  "currency": "INR"
}
```

### 4. Matching Algorithm

```typescript
interface MatchResult {
  status: 'OFFER_SENT' | 'NO_DRIVERS';
  driverId?: string;
  estimatedArrival?: number;
}

async function findAndAssignDriver(ride: Ride): Promise<MatchResult> {
  // Step 1: Geo search for nearby drivers (~50ms)
  const nearbyDrivers = await redis.geosearch(
    `geo:drivers:${ride.tenantId}:${ride.tier}`,
    'FROMLONLAT', ride.pickupLng, ride.pickupLat,
    'BYRADIUS', 5000, 'm',      // 5km radius
    'WITHDIST',                  // Include distance
    'ASC',                       // Sort by distance
    'COUNT', 20                  // Limit results
  );

  // Step 2: Filter locked drivers and calculate scores (~20ms)
  const availableDrivers = [];
  for (const driver of nearbyDrivers) {
    const isLocked = await redis.exists(`driver:lock:${driver.id}`);
    if (!isLocked) {
      availableDrivers.push({
        ...driver,
        score: calculateScore(driver)
      });
    }
  }

  // Sort by score descending
  availableDrivers.sort((a, b) => b.score - a.score);

  // Step 3: Try to lock best driver (~10ms)
  for (const driver of availableDrivers.slice(0, 5)) {
    const locked = await redis.set(
      `driver:lock:${driver.id}`,
      ride.id,
      'NX',           // Only set if not exists
      'EX', 30        // 30 second expiry
    );

    if (locked === 'OK') {
      // Send offer to driver via WebSocket
      await notificationGateway.sendRideOffer(driver.id, ride);
      return { status: 'OFFER_SENT', driverId: driver.id };
    }
  }

  return { status: 'NO_DRIVERS' };
}

function calculateScore(driver: DriverWithDistance): number {
  // Distance score: 0-100 (closer = higher)
  const distanceScore = Math.max(0, 100 - (driver.distance / 50));

  // Rating score: 0-50 (higher rating = higher)
  const ratingScore = driver.rating * 10;

  // Acceptance score: 0-20 (higher acceptance = higher)
  const acceptanceScore = driver.acceptanceRate * 20;

  // Weighted combination
  return (distanceScore * 0.5) + (ratingScore * 0.3) + (acceptanceScore * 0.2);
}
```

### 5. Fare Calculation

```typescript
interface FareConfig {
  baseFare: number;           // Base fare in INR
  perKmRate: number;          // Rate per km
  perMinRate: number;         // Rate per minute
  minimumFare: number;        // Minimum fare
  taxRate: number;            // Tax percentage (0.18 = 18%)
}

const FARE_CONFIG: Record<string, FareConfig> = {
  ECONOMY: {
    baseFare: 50,
    perKmRate: 12,
    perMinRate: 1.5,
    minimumFare: 80,
    taxRate: 0.18
  },
  COMFORT: {
    baseFare: 80,
    perKmRate: 15,
    perMinRate: 2,
    minimumFare: 120,
    taxRate: 0.18
  },
  PREMIUM: {
    baseFare: 120,
    perKmRate: 20,
    perMinRate: 3,
    minimumFare: 180,
    taxRate: 0.18
  },
  XL: {
    baseFare: 100,
    perKmRate: 18,
    perMinRate: 2.5,
    minimumFare: 150,
    taxRate: 0.18
  }
};

function calculateFare(
  tier: string,
  distanceMeters: number,
  durationSeconds: number,
  surgeMultiplier: number = 1.0
): FareBreakdown {
  const config = FARE_CONFIG[tier];
  const distanceKm = distanceMeters / 1000;
  const durationMin = durationSeconds / 60;

  const baseFare = config.baseFare;
  const distanceFare = distanceKm * config.perKmRate;
  const timeFare = durationMin * config.perMinRate;

  let subtotal = baseFare + distanceFare + timeFare;

  // Apply surge
  const surgeFare = subtotal * (surgeMultiplier - 1);
  subtotal += surgeFare;

  // Apply minimum
  subtotal = Math.max(subtotal, config.minimumFare);

  // Calculate taxes
  const taxes = subtotal * config.taxRate;
  const total = subtotal + taxes;

  return {
    baseFare: round(baseFare),
    distanceFare: round(distanceFare),
    timeFare: round(timeFare),
    surgeFare: round(surgeFare),
    taxes: round(taxes),
    total: round(total),
    currency: 'INR'
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
```

### 6. WebSocket Events

#### 6.1 Client → Server

| Event              | Payload                | Description                  |
| ------------------ | ---------------------- | ---------------------------- |
| `subscribe:ride`   | `{ rideId: string }`   | Subscribe to ride updates    |
| `subscribe:driver` | `{ driverId: string }` | Subscribe to driver location |
| `unsubscribe:ride` | `{ rideId: string }`   | Unsubscribe from ride        |

#### 6.2 Server → Client

| Event                  | Payload                         | Description               |
| ---------------------- | ------------------------------- | ------------------------- |
| `ride:status`          | `{ rideId, status, driverId? }` | Ride status changed       |
| `ride:driver_assigned` | `{ rideId, driver }`            | Driver assigned to ride   |
| `ride:driver_location` | `{ rideId, location }`          | Driver location update    |
| `ride:completed`       | `{ rideId, trip }`              | Trip completed with fare  |
| `driver:offer`         | `{ ride }`                      | New ride offer for driver |

### 7. Error Handling

```typescript
// Error codes
enum ErrorCode {
  INVALID_REQUEST = 'INVALID_REQUEST',
  TENANT_NOT_FOUND = 'TENANT_NOT_FOUND',
  RIDE_NOT_FOUND = 'RIDE_NOT_FOUND',
  DRIVER_NOT_FOUND = 'DRIVER_NOT_FOUND',
  DRIVER_NOT_AVAILABLE = 'DRIVER_NOT_AVAILABLE',
  INVALID_STATE_TRANSITION = 'INVALID_STATE_TRANSITION',
  DUPLICATE_REQUEST = 'DUPLICATE_REQUEST',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

// Error response format
interface ErrorResponse {
  statusCode: number;
  message: string;
  code: ErrorCode;
  details?: Record<string, any>;
  timestamp: string;
  path: string;
}
```

### 8. Performance Targets

| Operation       | Target p95 | Max p99 |
| --------------- | ---------- | ------- |
| Location update | 50ms       | 100ms   |
| Create ride     | 500ms      | 1000ms  |
| Driver matching | 1000ms     | 1500ms  |
| Get ride status | 100ms      | 200ms   |
| Accept ride     | 300ms      | 500ms   |
| End trip        | 500ms      | 1000ms  |
| Payment         | 1000ms     | 2000ms  |

### 9. Project Structure

```
daw/
├── backend/
│   ├── src/
│   │   ├── domain/                    # Domain layer (DDD)
│   │   │   └── ride/
│   │   ├── infrastructure/            # Infrastructure layer
│   │   │   └── logging/
│   │   ├── modules/
│   │   │   ├── driver/
│   │   │   │   ├── controllers/
│   │   │   │   ├── services/
│   │   │   │   ├── dto/
│   │   │   │   └── driver.module.ts
│   │   │   ├── rider/
│   │   │   ├── ride/
│   │   │   ├── trip/
│   │   │   ├── payment/
│   │   │   └── notification/
│   │   ├── shared/
│   │   │   ├── database/
│   │   │   ├── redis/
│   │   │   ├── middleware/
│   │   │   └── monitoring/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── newrelic.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── atoms/                 # Basic UI components
│   │   │   │   ├── Button/
│   │   │   │   ├── Card/
│   │   │   │   ├── Input/
│   │   │   │   └── Skeleton/
│   │   │   ├── molecules/             # Composite components
│   │   │   │   ├── AddressAutocomplete/
│   │   │   │   ├── LocationPicker/
│   │   │   │   └── RideMap/
│   │   │   ├── templates/             # Layout templates
│   │   │   │   ├── RiderLayout.tsx
│   │   │   │   ├── DriverLayout.tsx
│   │   │   │   └── OpsLayout.tsx
│   │   │   ├── guards/                # Route guards
│   │   │   │   ├── AuthGuard.tsx
│   │   │   │   └── RoleGuard.tsx
│   │   │   └── Ride/                  # Legacy ride components
│   │   ├── pages/
│   │   │   ├── AppSelectorPage.tsx    # Root app selector
│   │   │   ├── rider/                 # Rider app pages
│   │   │   │   ├── HomePage.tsx
│   │   │   │   ├── SearchingPage.tsx
│   │   │   │   ├── RideStatusPage.tsx
│   │   │   │   ├── RideInProgressPage.tsx
│   │   │   │   ├── RideCompletedPage.tsx
│   │   │   │   ├── PaymentsPage.tsx
│   │   │   │   ├── HistoryPage.tsx
│   │   │   │   ├── SupportPage.tsx
│   │   │   │   └── LoginPage.tsx
│   │   │   ├── driver/                # Driver app pages
│   │   │   │   ├── StatusPage.tsx
│   │   │   │   ├── RequestsPage.tsx
│   │   │   │   ├── NavigatePage.tsx
│   │   │   │   ├── RideInProgressPage.tsx
│   │   │   │   ├── EndTripPage.tsx
│   │   │   │   ├── EarningsPage.tsx
│   │   │   │   ├── HistoryPage.tsx
│   │   │   │   └── LoginPage.tsx
│   │   │   └── ops/                   # Ops dashboard pages
│   │   │       ├── OverviewPage.tsx
│   │   │       ├── RidesPage.tsx
│   │   │       ├── DriversPage.tsx
│   │   │       ├── RegionsPage.tsx
│   │   │       ├── SurgePricingPage.tsx
│   │   │       ├── PaymentsPage.tsx
│   │   │       └── AlertsPage.tsx
│   │   ├── router/
│   │   │   ├── index.tsx              # Main router
│   │   │   ├── rider.routes.tsx       # Rider routes
│   │   │   ├── driver.routes.tsx      # Driver routes
│   │   │   ├── ops.routes.tsx         # Ops routes
│   │   │   └── root.routes.tsx        # Root routes
│   │   ├── stores/
│   │   │   ├── themeStore.ts          # Theme state (shared)
│   │   │   ├── authStore.ts           # Auth state (shared)
│   │   │   ├── rideStore.ts           # Ride state (rider)
│   │   │   ├── driverStore.ts         # Driver state (driver)
│   │   │   └── opsStore.ts            # Ops state (ops)
│   │   ├── hooks/
│   │   │   └── useAuth.ts             # Auth hook
│   │   ├── services/
│   │   │   ├── api.ts                 # REST API client
│   │   │   └── socket.ts              # WebSocket client
│   │   ├── utils/
│   │   │   └── cn.ts                  # Tailwind class merge
│   │   ├── design-system/             # Design tokens
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── e2e/                           # Playwright tests
│   └── public/
├── tests/
│   └── load/                          # k6 load tests
├── docs/
│   ├── HLD.md
│   └── LLD.md
└── docker-compose.yml
```

### 10. Frontend Route Specifications

#### 10.1 Rider App Routes

| Route                             | Component          | Description           |
| --------------------------------- | ------------------ | --------------------- |
| `/rider`                          | HomePage           | Ride booking with map |
| `/rider/login`                    | LoginPage          | Auth placeholder      |
| `/rider/searching`                | SearchingPage      | Driver matching       |
| `/rider/ride/:rideId/status`      | RideStatusPage     | Driver ETA & location |
| `/rider/ride/:rideId/in-progress` | RideInProgressPage | Active ride tracking  |
| `/rider/ride/:rideId/completed`   | RideCompletedPage  | Trip summary & rating |
| `/rider/payments`                 | PaymentsPage       | Payment methods       |
| `/rider/history`                  | HistoryPage        | Past rides            |
| `/rider/support`                  | SupportPage        | Help center           |

#### 10.2 Driver App Routes

| Route                              | Component          | Description            |
| ---------------------------------- | ------------------ | ---------------------- |
| `/driver`                          | StatusPage         | Online/offline toggle  |
| `/driver/login`                    | LoginPage          | Auth placeholder       |
| `/driver/status`                   | StatusPage         | Driver status control  |
| `/driver/requests`                 | RequestsPage       | Incoming ride offers   |
| `/driver/ride/:rideId/navigate`    | NavigatePage       | Navigation to pickup   |
| `/driver/ride/:rideId/in-progress` | RideInProgressPage | Active trip navigation |
| `/driver/ride/:rideId/end-trip`    | EndTripPage        | Complete ride & rate   |
| `/driver/earnings`                 | EarningsPage       | Income dashboard       |
| `/driver/history`                  | HistoryPage        | Trip history           |

#### 10.3 Ops Dashboard Routes

| Route                | Component        | Description           |
| -------------------- | ---------------- | --------------------- |
| `/ops`               | OverviewPage     | System metrics        |
| `/ops/overview`      | OverviewPage     | Dashboard home        |
| `/ops/rides`         | RidesPage        | All rides management  |
| `/ops/drivers`       | DriversPage      | Driver management     |
| `/ops/regions`       | RegionsPage      | Region configuration  |
| `/ops/surge-pricing` | SurgePricingPage | Dynamic pricing rules |
| `/ops/payments`      | PaymentsPage     | Payment oversight     |
| `/ops/alerts`        | AlertsPage       | System alerts         |

### 11. Frontend State Specifications

#### 11.1 Auth Store

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

type UserRole = 'rider' | 'driver' | 'ops' | 'admin';
```

#### 11.2 Driver Store

```typescript
interface DriverState {
  status: 'offline' | 'online' | 'busy' | 'on_trip';
  currentTrip: Trip | null;
  todayStats: { trips: number; earnings: number; hours: number };
  pendingRequest: RideRequest | null;
  setStatus: (status: DriverStatus) => void;
  acceptRequest: (requestId: string) => void;
  declineRequest: () => void;
}
```

#### 11.3 Ops Store

```typescript
interface OpsState {
  metrics: SystemMetrics;
  alerts: Alert[];
  selectedRegion: string | null;
  refreshMetrics: () => Promise<void>;
  acknowledgeAlert: (alertId: string) => void;
}
```
