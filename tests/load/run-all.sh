#!/bin/bash

# Run all load tests for the Ride-Hailing System
# Usage: ./run-all.sh [BASE_URL]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS_DIR="$SCRIPT_DIR/results"
BASE_URL="${1:-http://localhost:3000}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create results directory
mkdir -p "$RESULTS_DIR"

echo "=================================================="
echo "Ride-Hailing System Load Tests"
echo "=================================================="
echo "Base URL: $BASE_URL"
echo "Results: $RESULTS_DIR"
echo "Timestamp: $TIMESTAMP"
echo "=================================================="
echo ""

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo "Error: k6 is not installed"
    echo "Install with: brew install k6 (macOS) or apt install k6 (Ubuntu)"
    exit 1
fi

# Check if API is reachable
echo "Checking API health..."
if curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health" | grep -q "200\|404"; then
    echo "API is reachable"
else
    echo "Warning: API may not be running at $BASE_URL"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""

# Test 1: Location Updates (shorter for quick validation)
echo "=================================================="
echo "Test 1: Location Updates"
echo "=================================================="
k6 run \
    -e BASE_URL="$BASE_URL" \
    --out json="$RESULTS_DIR/location-updates-$TIMESTAMP.json" \
    --vus 50 \
    --duration 30s \
    "$SCRIPT_DIR/location-updates.js" || true

echo ""

# Test 2: Ride Requests (shorter for quick validation)
echo "=================================================="
echo "Test 2: Ride Requests"
echo "=================================================="
k6 run \
    -e BASE_URL="$BASE_URL" \
    --out json="$RESULTS_DIR/ride-requests-$TIMESTAMP.json" \
    --vus 30 \
    --duration 30s \
    "$SCRIPT_DIR/ride-requests.js" || true

echo ""

# Test 3: Full Ride Flow
echo "=================================================="
echo "Test 3: Full Ride Flow"
echo "=================================================="
k6 run \
    -e BASE_URL="$BASE_URL" \
    --out json="$RESULTS_DIR/full-ride-flow-$TIMESTAMP.json" \
    --vus 10 \
    --duration 1m \
    "$SCRIPT_DIR/full-ride-flow.js" || true

echo ""
echo "=================================================="
echo "All tests completed!"
echo "=================================================="
echo "Results saved to: $RESULTS_DIR"
echo ""
echo "View results with:"
echo "  cat $RESULTS_DIR/location-updates-$TIMESTAMP.json | jq '.metrics'"
echo ""
