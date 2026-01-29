import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Shared module
import { SharedModule } from './shared/shared.module';

// Infrastructure
import { pinoLoggerConfig } from './infrastructure/logging/pino.config';

// Feature modules
import { DriverModule } from './modules/driver/driver.module';
import { RiderModule } from './modules/rider/rider.module';
import { RideModule } from './modules/ride/ride.module';
import { TripModule } from './modules/trip/trip.module';
import { PaymentModule } from './modules/payment/payment.module';
import { NotificationModule } from './modules/notification/notification.module';

// Middleware
import { TenantMiddleware } from './shared/middleware/tenant.middleware';
import { IdempotencyMiddleware } from './shared/middleware/idempotency.middleware';

@Module({
  imports: [
    LoggerModule.forRoot(pinoLoggerConfig),
    // Rate limiting: 10 req/sec short, 100 req/min medium, 1000 req/hour long
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'medium', ttl: 60000, limit: 100 },
      { name: 'long', ttl: 3600000, limit: 1000 },
    ]),
    SharedModule,
    DriverModule,
    RiderModule,
    RideModule,
    TripModule,
    PaymentModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global rate limiting guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply tenant middleware to all API routes
    consumer
      .apply(TenantMiddleware)
      .exclude(
        { path: '/', method: RequestMethod.GET },
        { path: 'health', method: RequestMethod.GET },
      )
      .forRoutes('*');

    // Apply idempotency middleware to all mutating routes
    consumer
      .apply(IdempotencyMiddleware)
      .forRoutes(
        { path: 'v1/*', method: RequestMethod.POST },
        { path: 'v1/*', method: RequestMethod.PUT },
        { path: 'v1/*', method: RequestMethod.PATCH },
      );
  }
}
