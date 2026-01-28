import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// New Relic types
interface NewRelicApi {
  recordMetric(name: string, value: number): void;
  recordCustomEvent(eventType: string, attributes: Record<string, any>): void;
  incrementMetric(name: string, amount?: number): void;
  noticeError(error: Error, customAttributes?: Record<string, any>): void;
  addCustomAttribute(key: string, value: string | number | boolean): void;
  startSegment<T>(
    name: string,
    record: boolean,
    handler: () => T | Promise<T>,
    callback?: (err: Error | null, result?: T) => void,
  ): T | Promise<T>;
  startWebTransaction<T>(url: string, handle: () => T | Promise<T>): T | Promise<T>;
  getTransaction(): any;
  setTransactionName(name: string): void;
}

let newrelic: NewRelicApi | null = null;

// Try to load New Relic - it may not be available in all environments
try {
  // Only load if license key is configured
  if (process.env.NEW_RELIC_LICENSE_KEY) {
    newrelic = require('newrelic');
    console.log('New Relic agent loaded successfully');
  } else {
    console.log('New Relic license key not configured - metrics will be logged only');
  }
} catch (error) {
  console.warn('New Relic not available:', error.message);
}

@Injectable()
export class MetricsService implements OnModuleInit {
  private enabled: boolean = false;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.enabled = !!newrelic;
    if (this.enabled) {
      console.log('MetricsService initialized with New Relic');
    } else {
      console.log('MetricsService initialized in logging-only mode');
    }
  }

  // =====================
  // Ride Metrics
  // =====================

  /**
   * Record ride creation
   */
  recordRideCreated(data: {
    rideId: string;
    tenantId: string;
    tier: string;
    durationMs: number;
  }) {
    this.recordMetric('Custom/Ride/Created', data.durationMs);
    this.recordCustomEvent('RideCreated', {
      rideId: data.rideId,
      tenantId: data.tenantId,
      tier: data.tier,
      durationMs: data.durationMs,
      timestamp: Date.now(),
    });
    this.incrementMetric('Custom/Ride/Count');
  }

  /**
   * Record ride completion
   */
  recordRideCompleted(data: {
    rideId: string;
    tenantId: string;
    tier: string;
    fareAmount: number;
    distanceMeters: number;
    durationSeconds: number;
  }) {
    this.recordCustomEvent('RideCompleted', {
      ...data,
      timestamp: Date.now(),
    });
    this.incrementMetric('Custom/Ride/Completed');
    this.recordMetric('Custom/Ride/Fare', data.fareAmount);
    this.recordMetric('Custom/Ride/Distance', data.distanceMeters);
  }

  /**
   * Record ride cancellation
   */
  recordRideCancelled(data: {
    rideId: string;
    tenantId: string;
    reason?: string;
    stage: string;
  }) {
    this.recordCustomEvent('RideCancelled', {
      ...data,
      timestamp: Date.now(),
    });
    this.incrementMetric('Custom/Ride/Cancelled');
  }

  // =====================
  // Matching Metrics
  // =====================

  /**
   * Record matching attempt
   */
  recordMatchingAttempt(data: {
    rideId: string;
    tenantId: string;
    durationMs: number;
    driversFound: number;
    success: boolean;
  }) {
    this.recordMetric('Custom/Matching/Duration', data.durationMs);
    this.recordMetric('Custom/Matching/DriversFound', data.driversFound);
    this.recordCustomEvent('MatchingAttempt', {
      ...data,
      timestamp: Date.now(),
    });

    if (data.success) {
      this.incrementMetric('Custom/Matching/Success');
    } else {
      this.incrementMetric('Custom/Matching/Failed');
    }
  }

  /**
   * Record driver offer
   */
  recordDriverOffer(data: {
    offerId: string;
    rideId: string;
    driverId: string;
    tenantId: string;
    distance: number;
  }) {
    this.recordCustomEvent('DriverOffer', {
      ...data,
      timestamp: Date.now(),
    });
    this.incrementMetric('Custom/Offer/Sent');
  }

  /**
   * Record offer response
   */
  recordOfferResponse(data: {
    offerId: string;
    driverId: string;
    response: 'ACCEPTED' | 'DECLINED' | 'TIMEOUT';
    responseTimeMs: number;
  }) {
    this.recordMetric('Custom/Offer/ResponseTime', data.responseTimeMs);
    this.recordCustomEvent('OfferResponse', {
      ...data,
      timestamp: Date.now(),
    });
    this.incrementMetric(`Custom/Offer/${data.response}`);
  }

  // =====================
  // Driver Location Metrics
  // =====================

  /**
   * Record location update
   */
  recordLocationUpdate(data: {
    driverId: string;
    tenantId: string;
    durationMs: number;
  }) {
    this.recordMetric('Custom/Location/UpdateDuration', data.durationMs);
    this.incrementMetric('Custom/Location/Updates');
  }

  /**
   * Record batch location updates (for high throughput tracking)
   */
  recordLocationUpdateBatch(count: number, totalDurationMs: number) {
    this.recordMetric('Custom/Location/BatchSize', count);
    this.recordMetric('Custom/Location/BatchDuration', totalDurationMs);
  }

  // =====================
  // Payment Metrics
  // =====================

  /**
   * Record payment attempt
   */
  recordPaymentAttempt(data: {
    paymentId: string;
    tripId: string;
    amount: number;
    method: string;
    durationMs: number;
    success: boolean;
  }) {
    this.recordMetric('Custom/Payment/Duration', data.durationMs);
    this.recordCustomEvent('PaymentAttempt', {
      ...data,
      timestamp: Date.now(),
    });

    if (data.success) {
      this.incrementMetric('Custom/Payment/Success');
      this.recordMetric('Custom/Payment/Amount', data.amount);
    } else {
      this.incrementMetric('Custom/Payment/Failed');
    }
  }

  // =====================
  // Database Metrics
  // =====================

  /**
   * Record database query duration
   */
  recordDbQuery(data: {
    operation: string;
    table: string;
    durationMs: number;
  }) {
    this.recordMetric(`Custom/Database/${data.operation}`, data.durationMs);
    if (data.durationMs > 100) {
      this.recordCustomEvent('SlowQuery', {
        ...data,
        timestamp: Date.now(),
      });
    }
  }

  // =====================
  // Redis Metrics
  // =====================

  /**
   * Record Redis operation
   */
  recordRedisOperation(data: {
    operation: string;
    durationMs: number;
  }) {
    this.recordMetric(`Custom/Redis/${data.operation}`, data.durationMs);
    if (data.durationMs > 20) {
      this.recordCustomEvent('SlowRedisOperation', {
        ...data,
        timestamp: Date.now(),
      });
    }
  }

  // =====================
  // Error Tracking
  // =====================

  /**
   * Record an error
   */
  recordError(error: Error, context?: Record<string, any>) {
    if (newrelic) {
      newrelic.noticeError(error, context);
    }
    console.error('Error recorded:', error.message, context);
  }

  // =====================
  // Core Methods
  // =====================

  /**
   * Record a custom metric
   */
  recordMetric(name: string, value: number) {
    if (newrelic) {
      newrelic.recordMetric(name, value);
    }
    // Also log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.debug(`Metric: ${name} = ${value}`);
    }
  }

  /**
   * Record a custom event
   */
  recordCustomEvent(eventType: string, attributes: Record<string, any>) {
    if (newrelic) {
      newrelic.recordCustomEvent(eventType, attributes);
    }
    // Also log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.debug(`Event: ${eventType}`, attributes);
    }
  }

  /**
   * Increment a counter metric
   */
  incrementMetric(name: string, amount: number = 1) {
    if (newrelic) {
      newrelic.incrementMetric(name, amount);
    }
  }

  /**
   * Add a custom attribute to the current transaction
   */
  addTransactionAttribute(key: string, value: string | number | boolean) {
    if (newrelic) {
      newrelic.addCustomAttribute(key, value);
    }
  }

  /**
   * Wrap a function with a custom segment for tracing
   */
  async traceSegment<T>(
    name: string,
    handler: () => Promise<T>,
  ): Promise<T> {
    const startTime = Date.now();

    if (newrelic) {
      return newrelic.startSegment(name, true, handler);
    }

    try {
      return await handler();
    } finally {
      const duration = Date.now() - startTime;
      if (process.env.NODE_ENV === 'development') {
        console.debug(`Segment ${name} completed in ${duration}ms`);
      }
    }
  }

  /**
   * Set the transaction name
   */
  setTransactionName(name: string) {
    if (newrelic) {
      newrelic.setTransactionName(name);
    }
  }
}
