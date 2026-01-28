# Ride-Hailing System - GoComet DAW

A multi-tenant, scalable ride-hailing system built with NestJS, PostgreSQL, Redis, and React.

## Architecture Overview

```
                              CLIENTS
                  +-------------+-------------+
                  |             |             |
            [Rider App]   [Driver App]   [Admin]
                  |             |             |
                  +------+------+------+------+
                         |
                         v
                  +-------------+
                  | API GATEWAY |
                  | (NestJS)    |
                  +------+------+
                         |
        +----------------+----------------+----------------+
        |                |                |                |
        v                v                v                v
  +-----------+   +-----------+   +-----------+   +-----------+
  |   RIDE    |   |  DRIVER   |   |   TRIP    |   |  PAYMENT  |
  |  MODULE   |   |  MODULE   |   |  MODULE   |   |  MODULE   |
  +-----------+   +-----------+   +-----------+   +-----------+
        |                |                |                |
        +----------------+----------------+----------------+
                         |
          +--------------+--------------+
          |                             |
          v                             v
  +----------------+           +----------------+
  |   POSTGRESQL   |           |  REDIS CLUSTER |
  +----------------+           +----------------+
```

## Tech Stack

### Backend
- **Framework**: NestJS (TypeScript)
- **ORM**: Prisma
- **Database**: PostgreSQL with PostGIS
- **Cache/Geo**: Redis (GEOADD for spatial queries)
- **Real-time**: Socket.io WebSocket

### Frontend
- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **State**: Zustand
- **Maps**: Leaflet
- **Styling**: Tailwind CSS

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm or yarn

## Quick Start

### 1. Start Infrastructure

```bash
# Start PostgreSQL and Redis
docker compose up -d postgres redis
```

### 2. Start Backend

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Start development server
npm run start:dev
```

The API will be available at `http://localhost:3000`

### 3. Start Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Documentation

### Core APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/rides` | Create a ride request |
| GET | `/v1/rides/{id}` | Get ride status |
| POST | `/v1/drivers/{id}/location` | Update driver location |
| POST | `/v1/rides/offers/{offerId}/accept` | Accept ride offer |
| POST | `/v1/trips/{id}/end` | End trip and calculate fare |
| POST | `/v1/payments` | Process payment |

### Required Headers

- `X-Tenant-Id`: UUID of the tenant (required for all requests)
- `X-Idempotency-Key`: Unique key for idempotent operations (POST/PUT/PATCH)

### Example: Create a Ride

```bash
curl -X POST http://localhost:3000/v1/rides \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: 00000000-0000-0000-0000-000000000001" \
  -H "X-Idempotency-Key: unique-key-123" \
  -d '{
    "pickupLocation": {
      "latitude": 12.9716,
      "longitude": 77.5946,
      "address": "MG Road, Bangalore"
    },
    "destinationLocation": {
      "latitude": 12.9352,
      "longitude": 77.6245,
      "address": "Koramangala, Bangalore"
    },
    "tier": "ECONOMY",
    "paymentMethod": "CASH",
    "riderId": "rider-uuid-here"
  }'
```

### Example: Update Driver Location

```bash
curl -X POST http://localhost:3000/v1/drivers/{driverId}/location \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: 00000000-0000-0000-0000-000000000001" \
  -d '{
    "latitude": 12.9716,
    "longitude": 77.5946,
    "heading": 90,
    "speed": 30
  }'
```

## WebSocket Events

Connect to `ws://localhost:3000/rides` for real-time updates.

### Subscribe to Ride Updates

```javascript
socket.emit('subscribe:ride', {
  tenantId: 'tenant-uuid',
  rideId: 'ride-uuid'
});

// Listen for events
socket.on('driver_assigned', (data) => { /* driver assigned */ });
socket.on('driver_arrived', (data) => { /* driver arrived */ });
socket.on('trip_started', (data) => { /* trip started */ });
socket.on('completed', (data) => { /* ride completed */ });
```

## Database Schema

### Key Tables

- **tenants**: Multi-tenant registry
- **riders**: Rider profiles
- **drivers**: Driver profiles with location
- **rides**: Ride requests
- **trips**: Trip records with fare
- **payments**: Payment transactions
- **ride_offers**: Driver offer tracking

## Matching Algorithm

The driver matching algorithm achieves <1s p95 latency:

1. **Geo Search** (~50ms): Redis GEOSEARCH for nearby drivers
2. **Ranking** (~20ms): Score by distance, rating, acceptance rate
3. **Locking** (~10ms): Redis SETNX to prevent double-booking
4. **Offer** (~20ms): Send offer via WebSocket

```typescript
// Scoring formula
score = (distanceScore * 0.5) + (ratingScore * 0.3) + (acceptanceScore * 0.2)
```

## Fare Calculation

```
Total = Base Fare + (Distance × Rate/km) + (Time × Rate/min) + Surge + Taxes

Base Fare:
- ECONOMY: ₹50
- COMFORT: ₹80
- PREMIUM: ₹120
- XL: ₹100

Rates:
- Per KM: ₹12
- Per Minute: ₹2
- Tax Rate: 18%
```

## Multi-Tenancy

Schema-per-tenant isolation:

```
PostgreSQL
├── public (tenant registry)
├── tenant_default (default tenant)
├── tenant_abc123 (tenant A)
└── tenant_xyz789 (tenant B)
```

## Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://ridehailing:ridehailing_pass@localhost:5432/ridehailing?schema=tenant_default
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3000
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
```

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── driver/         # Driver APIs
│   │   │   ├── ride/           # Ride APIs & matching
│   │   │   ├── trip/           # Trip & fare APIs
│   │   │   ├── payment/        # Payment APIs
│   │   │   └── notification/   # WebSocket gateway
│   │   └── shared/
│   │       ├── database/       # Prisma service
│   │       ├── redis/          # Redis service
│   │       └── middleware/     # Tenant, idempotency
│   └── prisma/
│       └── schema.prisma
├── frontend/
│   └── src/
│       ├── components/         # React components
│       ├── stores/            # Zustand stores
│       ├── services/          # API & socket services
│       └── types/             # TypeScript types
├── scripts/
│   └── init-db.sql            # DB initialization
└── docker-compose.yml
```

## Testing

```bash
# Backend tests
cd backend
npm run test

# Load testing with k6
k6 run tests/load/location-updates.js
```

## Scaling Considerations

- **Horizontal**: Stateless API servers behind load balancer
- **Location Updates**: Redis cluster for 200k updates/sec
- **Database**: Read replicas, connection pooling (PgBouncer)
- **WebSocket**: Redis pub/sub for cross-instance communication

## License

MIT
