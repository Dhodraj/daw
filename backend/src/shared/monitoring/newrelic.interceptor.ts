import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

/**
 * New Relic Interceptor
 *
 * Automatically tracks:
 * - API response times
 * - Request/response metadata
 * - Error rates
 * - Throughput metrics
 */
@Injectable()
export class NewRelicInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    // Extract request metadata
    const method = request.method;
    const url = request.url;
    const route = request.route?.path || url;
    const tenantId = request.headers['x-tenant-id'] || 'unknown';
    const requestId = request.headers['x-request-id'] || 'unknown';

    // Set transaction name based on route
    const transactionName = `${method} ${route}`;
    this.metricsService.setTransactionName(transactionName);

    // Add custom attributes to the transaction
    this.metricsService.addTransactionAttribute('tenantId', tenantId);
    this.metricsService.addTransactionAttribute('requestId', requestId);
    this.metricsService.addTransactionAttribute('httpMethod', method);
    this.metricsService.addTransactionAttribute('route', route);

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;

        // Record API metrics
        this.recordApiMetrics({
          method,
          route,
          statusCode,
          duration,
          tenantId,
        });

        // Track slow APIs (>500ms)
        if (duration > 500) {
          this.metricsService.recordCustomEvent('SlowAPI', {
            method,
            route,
            duration,
            statusCode,
            tenantId,
            requestId,
            timestamp: Date.now(),
          });
        }

        // Add response attributes
        this.metricsService.addTransactionAttribute('statusCode', statusCode);
        this.metricsService.addTransactionAttribute('durationMs', duration);
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode = error.status || 500;

        // Record error metrics
        this.recordApiMetrics({
          method,
          route,
          statusCode,
          duration,
          tenantId,
          error: true,
        });

        // Record the error
        this.metricsService.recordError(error, {
          method,
          route,
          tenantId,
          requestId,
          statusCode,
        });

        throw error;
      }),
    );
  }

  private recordApiMetrics(data: {
    method: string;
    route: string;
    statusCode: number;
    duration: number;
    tenantId: string;
    error?: boolean;
  }) {
    // Record latency metric
    this.metricsService.recordMetric(
      `Custom/API/${data.method}${data.route}/Duration`,
      data.duration,
    );

    // Record throughput
    this.metricsService.incrementMetric('Custom/API/Throughput');

    // Record by status code category
    const statusCategory = Math.floor(data.statusCode / 100) * 100;
    this.metricsService.incrementMetric(`Custom/API/Status/${statusCategory}`);

    // Record custom event for detailed analysis
    this.metricsService.recordCustomEvent('APIRequest', {
      method: data.method,
      route: data.route,
      statusCode: data.statusCode,
      durationMs: data.duration,
      tenantId: data.tenantId,
      isError: data.error || false,
      timestamp: Date.now(),
    });

    // Track specific API categories
    if (data.route.includes('/rides')) {
      this.metricsService.incrementMetric('Custom/API/Rides/Count');
      this.metricsService.recordMetric(
        'Custom/API/Rides/Duration',
        data.duration,
      );
    } else if (data.route.includes('/drivers')) {
      this.metricsService.incrementMetric('Custom/API/Drivers/Count');
      this.metricsService.recordMetric(
        'Custom/API/Drivers/Duration',
        data.duration,
      );
    } else if (data.route.includes('/trips')) {
      this.metricsService.incrementMetric('Custom/API/Trips/Count');
      this.metricsService.recordMetric(
        'Custom/API/Trips/Duration',
        data.duration,
      );
    } else if (data.route.includes('/payments')) {
      this.metricsService.incrementMetric('Custom/API/Payments/Count');
      this.metricsService.recordMetric(
        'Custom/API/Payments/Duration',
        data.duration,
      );
    }
  }
}
