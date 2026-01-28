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
                    ┌────────────────┴────────────────┐
                    │                                 │
              ┌─────┴─────┐                    ┌──────┴──────┐
              │ Rider App │                    │ Driver App  │
              │  (React)  │                    │   (React)   │
              └─────┬─────┘                    └──────┬──────┘
                    │                                 │
                    │         WebSocket / REST        │
                    └────────────────┬────────────────┘
                                     │
                              ┌──────┴──────┐
                              │ API Gateway │
                              │  (NestJS)   │
                              └──────┬──────┘
                                     │
            ┌────────────────────────┼────────────────────────┐
            │                        │                        │
     ┌──────┴──────┐          ┌──────┴──────┐          ┌──────┴──────┐
     │    Ride     │          │   Driver    │          │    Trip     │
     │   Module    │          │   Module    │          │   Module    │
     └──────┬──────┘          └──────┬──────┘          └──────┬──────┘
            │                        │                        │
            └────────────────────────┼────────────────────────┘
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
- **Technology**: React 18, Vite, Zustand, Leaflet
- **Real-time**: Socket.io for live updates
- **Purpose**: Rider booking interface with real-time map

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

| Layer            | Technology                                   |
| ---------------- | -------------------------------------------- |
| Frontend         | React 18, TypeScript, Vite, Leaflet, Zustand |
| Backend          | NestJS, TypeScript, Prisma                   |
| Database         | PostgreSQL 15+                               |
| Cache            | Redis 7+                                     |
| Queue            | Bull (Redis-based)                           |
| Real-time        | Socket.io                                    |
| Monitoring       | New Relic APM                                |
| Testing          | Jest, Playwright, k6                         |
| Containerization | Docker, Docker Compose                       |
