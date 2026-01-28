# Load Testing Suite

k6 load tests for the Ride-Hailing System.

## Prerequisites

Install k6:

```bash
# macOS
brew install k6

# Ubuntu/Debian
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Docker
docker pull grafana/k6
```

## Test Scripts

### 1. Location Updates (`location-updates.js`)

Tests driver location update throughput.

**Target:** 200,000 updates/second

```bash
# Quick test
k6 run --vus 100 --duration 30s location-updates.js

# Full load test
k6 run location-updates.js

# Custom configuration
k6 run --vus 500 --duration 2m location-updates.js
```

**Metrics:**
- `location_update_duration`: Time to process location update
- `location_update_success`: Success rate
- Target p95 latency: <100ms

### 2. Ride Requests (`ride-requests.js`)

Tests ride creation and matching throughput.

**Target:** 10,000 requests/minute (~167/second)

```bash
# Quick test
k6 run --vus 50 --duration 30s ride-requests.js

# Full load test with scenarios
k6 run ride-requests.js
```

**Metrics:**
- `ride_creation_duration`: Time to create ride
- `matching_duration`: Time for driver matching
- Target p95 latency: <500ms for creation, <1000ms for matching

### 3. Full Ride Flow (`full-ride-flow.js`)

End-to-end test covering complete ride lifecycle:
1. Create ride
2. Driver accepts
3. Trip starts
4. Trip ends
5. Payment processed

```bash
# Test full flow
k6 run --vus 20 --duration 2m full-ride-flow.js
```

**Metrics:**
- `ride_flow_duration`: Total flow time
- `ride_flow_success`: End-to-end success rate
- Per-step durations for each lifecycle stage

## Configuration

Set environment variables to customize:

```bash
# Custom API endpoint
k6 run -e BASE_URL=http://api.example.com location-updates.js

# Custom tenant
k6 run -e TENANT_ID=custom-tenant-id ride-requests.js
```

## Running with Docker

```bash
# Location updates
docker run -i grafana/k6 run - <location-updates.js

# With environment variables
docker run -i -e BASE_URL=http://host.docker.internal:3000 grafana/k6 run - <location-updates.js
```

## Output Formats

### JSON output
```bash
k6 run --out json=results.json location-updates.js
```

### InfluxDB (for Grafana dashboards)
```bash
k6 run --out influxdb=http://localhost:8086/k6 location-updates.js
```

### Cloud (k6 Cloud)
```bash
k6 cloud location-updates.js
```

## Expected Results

### Location Updates
| Metric | Target | Acceptable |
|--------|--------|------------|
| p95 Latency | <50ms | <100ms |
| p99 Latency | <100ms | <200ms |
| Error Rate | <0.1% | <1% |
| Throughput | 200k/sec | 100k/sec |

### Ride Requests
| Metric | Target | Acceptable |
|--------|--------|------------|
| p95 Latency | <500ms | <1000ms |
| p99 Latency | <1000ms | <2000ms |
| Matching p95 | <1000ms | <1500ms |
| Error Rate | <0.1% | <1% |
| Throughput | 167/sec | 100/sec |

### Full Flow
| Metric | Target | Acceptable |
|--------|--------|------------|
| Success Rate | >95% | >90% |
| Create Ride p95 | <500ms | <1000ms |
| Driver Accept p95 | <300ms | <500ms |
| Trip End p95 | <500ms | <1000ms |
| Payment p95 | <1000ms | <2000ms |

## Troubleshooting

### High Error Rates
1. Check if backend is running: `curl http://localhost:3000/health`
2. Check Redis connection: `redis-cli ping`
3. Check PostgreSQL: `psql -c "SELECT 1"`

### Slow Responses
1. Check database indexes are created
2. Verify Redis is responsive
3. Check for connection pool exhaustion

### Connection Refused
1. Ensure services are running via Docker Compose
2. Check firewall rules
3. Verify correct BASE_URL

## Sample Commands for CI/CD

```bash
#!/bin/bash

# Run all tests sequentially
echo "Running location updates test..."
k6 run --out json=results/location.json location-updates.js

echo "Running ride requests test..."
k6 run --out json=results/rides.json ride-requests.js

echo "Running full flow test..."
k6 run --out json=results/flow.json full-ride-flow.js

# Check thresholds
if [ $? -eq 0 ]; then
  echo "All tests passed!"
else
  echo "Some tests failed thresholds"
  exit 1
fi
```
