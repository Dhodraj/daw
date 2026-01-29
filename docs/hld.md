# High-Level Design (HLD)

## Ride-Hailing System

### 1. Executive Summary

A multi-tenant, multi-region ride-hailing platform designed to handle:
- ~100,000 concurrent drivers
- ~10,000 ride requests per minute
- ~200,000 location updates per second
- Sub-1 second driver-rider matching (p95)

### 2. System Architecture

```
                                         CLIENTS
            ┌──────────────────────────────┴──────────────────────────────┐
            │                              │                              │
    ┌───────┴───────┐             ┌────────┴────────┐            ┌────────┴────────┐
    │   Rider App   │             │   Driver App    │            │  Ops Dashboard  │
    │ /rider/* (React)│           │ /driver/* (React)│           │ /ops/* (React)  │
    └───────┬───────┘             └────────┬────────┘            └────────┬────────┘
            │                              │                              │
            │              WebSocket / REST API                           │
            └──────────────────────────────┬──────────────────────────────┘
                                           │
                                    ┌──────┴──────┐
                                    │ API Gateway │
                                    │  (NestJS)   │
                                    └──────┬──────┘
                                           │
            ┌──────────────────────────────┼──────────────────────────────┐
            │                              │                              │
     ┌──────┴──────┐               ┌───────┴───────┐              ┌───────┴───────┐
     │    Ride     │               │    Driver     │              │     Trip      │
     │   Module    │               │    Module     │              │    Module     │
     └──────┬──────┘               └───────┬───────┘              └───────┬───────┘
            │                              │                              │
            └──────────────────────────────┼──────────────────────────────┘
                                           │
                          ┌────────────────┼────────────────┐
                          │                │                │
                   ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐
                   │ PostgreSQL  │  │    Redis    │  │   Bull MQ   │
                   │ (Primary)   │  │  (Cache/Geo)│  │   (Queue)   │
                   └─────────────┘  └─────────────┘  └─────────────┘
```

### 3. Key Components

#### 3.1 Frontend (React + TypeScript)
- **Technology**: React 19, Vite 7, Zustand, Leaflet, Framer Motion
- **Real-time**: Socket.io for live updates
- **Architecture**: Multi-app segmentation (Rider, Driver, Ops) from single codebase

```
                    ┌─────────────────────────────────────┐
                    │       Frontend Application          │
                    │         (Single Codebase)           │
                    └─────────────────┬───────────────────┘
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            │                         │                         │
    ┌───────┴───────┐         ┌───────┴───────┐         ┌───────┴───────┐
    │   Rider App   │         │  Driver App   │         │ Ops Dashboard │
    │   /rider/*    │         │  /driver/*    │         │    /ops/*     │
    └───────────────┘         └───────────────┘         └───────────────┘
    │               │         │               │         │               │
    ├─ Home         │         ├─ Status       │         ├─ Overview     │
    ├─ Searching    │         ├─ Requests     │         ├─ Rides        │
    ├─ RideStatus   │         ├─ Navigate     │         ├─ Drivers      │
    ├─ InProgress   │         ├─ InProgress   │         ├─ Regions      │
    ├─ Completed    │         ├─ EndTrip      │         ├─ SurgePricing │
    ├─ Payments     │         ├─ Earnings     │         ├─ Payments     │
    ├─ History      │         └─ History      │         └─ Alerts       │
    └─ Support      │
```

**App-Specific Features**:
| App    | Purpose                 | Theme         | Key Features                                 |
| ------ | ----------------------- | ------------- | -------------------------------------------- |
| Rider  | Book rides              | Blue          | Real-time tracking, fare estimates, payment  |
| Driver | Accept & complete rides | Emerald/Teal  | Status toggle, request queue, earnings       |
| Ops    | System management       | Violet/Purple | Metrics dashboard, driver management, alerts |

#### 3.2 Backend API (NestJS)
- **Framework**: NestJS with TypeScript
- **Architecture**: Domain-Driven Design (DDD)
- **Modules**: Ride, Driver, Trip, Payment, Notification

#### 3.3 Data Layer
| Component  | Technology     | Purpose                              |
| ---------- | -------------- | ------------------------------------ |
| Primary DB | PostgreSQL 15+ | Transactional data, ACID compliance  |
| Cache/Geo  | Redis 7+       | Geospatial queries, caching, pub/sub |
| Queue      | Bull (Redis)   | Async job processing                 |

### 4. Multi-Tenancy Strategy

**Approach**: Schema-per-Tenant (Full Isolation)

```
┌─────────────────────────────────────────────────────┐
│                   PostgreSQL                        │
├─────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │  tenant_a   │  │  tenant_b   │  │  tenant_c   │  │
│  │   schema    │  │   schema    │  │   schema    │  │
│  │─────────────│  │─────────────│  │─────────────│  │
│  │ - drivers   │  │ - drivers   │  │ - drivers   │  │
│  │ - riders    │  │ - riders    │  │ - riders    │  │
│  │ - rides     │  │ - rides     │  │ - rides     │  │
│  │ - trips     │  │ - trips     │  │ - trips     │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐    │
│  │              public schema                   │    │
│  │  - tenants (registry)                        │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

**Benefits**:
- Complete data isolation between tenants
- Per-tenant backup/restore
- Independent scaling per tenant
- Compliance-friendly

### 5. Core Flows

#### 5.1 Ride Request Flow

```
┌────────┐    ┌─────────┐    ┌─────────┐    ┌───────┐    ┌────────┐
│ Rider  │───▶│  API    │───▶│ Matching│───▶│ Redis │───▶│ Driver │
│  App   │    │ Gateway │    │ Service │    │ (Geo) │    │  App   │
└────────┘    └─────────┘    └─────────┘    └───────┘    └────────┘
    │              │              │              │            │
    │   1. POST    │              │              │            │
    │   /rides     │              │              │            │
    │─────────────▶│              │              │            │
    │              │  2. Find     │              │            │
    │              │  Drivers     │              │            │
    │              │─────────────▶│              │            │
    │              │              │  3. GEOSEARCH│            │
    │              │              │─────────────▶│            │
    │              │              │              │            │
    │              │              │◀─────────────│            │
    │              │              │  4. Lock     │            │
    │              │              │  Driver      │            │
    │              │              │─────────────▶│            │
    │              │              │              │ 5. Push    │
    │              │              │              │ Offer      │
    │              │              │              │───────────▶│
    │              │              │              │            │
```

#### 5.2 Location Update Flow

```
Driver App ──▶ POST /drivers/{id}/location ──▶ Redis GEOADD ──▶ Pub/Sub
                                                    │
                                                    ▼
                                            WebSocket Gateway
                                                    │
                                                    ▼
                                               Rider App
```

### 6. State Machines

#### 6.1 Ride States

```
                    ┌─────────────────────────────────────────────┐
                    │                                             │
                    ▼                                             │
┌─────────┐    ┌──────────┐    ┌────────────────┐    ┌──────────────┐
│ PENDING │───▶│SEARCHING │───▶│DRIVER_ASSIGNED │───▶│DRIVER_ARRIVED│
└─────────┘    └──────────┘    └────────────────┘    └──────────────┘
     │              │                   │                    │
     │              │                   │                    │
     │              ▼                   │                    ▼
     │         ┌──────────┐            │             ┌─────────────┐
     │         │NO_DRIVERS│            │             │ IN_PROGRESS │
     │         └──────────┘            │             └─────────────┘
     │                                 │                    │
     │                                 ▼                    ▼
     │                          ┌───────────┐        ┌───────────┐
     └─────────────────────────▶│ CANCELLED │        │ COMPLETED │
                                └───────────┘        └───────────┘
```

#### 6.2 Driver States

```
┌─────────┐    ┌───────────┐    ┌──────┐    ┌─────────┐
│ OFFLINE │◀──▶│ AVAILABLE │───▶│ BUSY │───▶│ ON_TRIP │
└─────────┘    └───────────┘    └──────┘    └─────────┘
                     ▲                            │
                     └────────────────────────────┘
```

### 7. API Overview

| Endpoint                    | Method | Purpose             | Latency Target |
| --------------------------- | ------ | ------------------- | -------------- |
| `/v1/rides`                 | POST   | Create ride request | <500ms p95     |
| `/v1/rides/{id}`            | GET    | Get ride status     | <100ms p95     |
| `/v1/drivers/{id}/location` | POST   | Update location     | <50ms p95      |
| `/v1/drivers/{id}/accept`   | POST   | Accept ride         | <300ms p95     |
| `/v1/trips/{id}/end`        | POST   | End trip            | <500ms p95     |
| `/v1/payments`              | POST   | Process payment     | <1000ms p95    |

### 8. Scalability Approach

| Challenge                 | Solution                                |
| ------------------------- | --------------------------------------- |
| 200k location updates/sec | Redis GEOADD, async processing          |
| 10k ride requests/min     | Connection pooling, read replicas       |
| Sub-1s matching           | Redis geospatial index, pre-filtering   |
| Real-time updates         | WebSocket with Redis pub/sub            |
| Multi-region              | Schema-per-tenant, regional deployments |

### 9. Monitoring & Observability

- **APM**: New Relic for distributed tracing
- **Metrics**: Custom metrics for matching latency, ride completion
- **Logging**: Structured JSON logs with correlation IDs
- **Alerting**: p95 latency thresholds, error rate monitoring

### 10. Security Considerations

- Tenant isolation via schema separation
- Idempotency keys for write operations
- Rate limiting per tenant/user
- Input validation at API gateway
- Encrypted connections (TLS)

### 11. Technology Stack Summary

| Layer            | Technology                                                    |
| ---------------- | ------------------------------------------------------------- |
| Frontend         | React 19, TypeScript, Vite 7, Leaflet, Zustand, Framer Motion |
| Backend          | NestJS, TypeScript, Prisma                                    |
| Database         | PostgreSQL 15+                                                |
| Cache            | Redis 7+                                                      |
| Queue            | Bull (Redis-based)                                            |
| Real-time        | Socket.io                                                     |
| Monitoring       | New Relic APM, Pino Logging                                   |
| Testing          | Jest, Playwright, k6                                          |
| Containerization | Docker, Docker Compose                                        |

### 12. Frontend Application Architecture

#### 12.1 Route Structure

| Path Prefix | Application   | Layout       | Target User      |
| ----------- | ------------- | ------------ | ---------------- |
| `/`         | App Selector  | None         | All users        |
| `/rider/*`  | Rider App     | RiderLayout  | Passengers       |
| `/driver/*` | Driver App    | DriverLayout | Drivers          |
| `/ops/*`    | Ops Dashboard | OpsLayout    | Operations/Admin |

#### 12.2 State Management

```
┌─────────────────────────────────────────────────────────────┐
│                    Zustand Stores                           │
├─────────────────┬─────────────────┬─────────────────────────┤
│   themeStore    │   authStore     │      App-Specific       │
│   (Shared)      │   (Shared)      │       Stores            │
├─────────────────┼─────────────────┼─────────────────────────┤
│ - isDark        │ - user          │ rideStore (Rider)       │
│ - toggleTheme   │ - token         │ driverStore (Driver)    │
│                 │ - isAuth        │ opsStore (Ops)          │
│                 │ - hasRole()     │                         │
└─────────────────┴─────────────────┴─────────────────────────┘
```

#### 12.3 Auth & Route Guards

- **AuthGuard**: Protects routes requiring authentication
- **RoleGuard**: Role-based access control (rider, driver, ops, admin)
- **Demo Mode**: Pre-configured demo users for each role
