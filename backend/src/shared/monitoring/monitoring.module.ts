import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MetricsService } from './metrics.service';
import { NewRelicInterceptor } from './newrelic.interceptor';

@Global()
@Module({
  providers: [
    MetricsService,
    // Register the interceptor globally
    {
      provide: APP_INTERCEPTOR,
      useClass: NewRelicInterceptor,
    },
  ],
  exports: [MetricsService],
})
export class MonitoringModule {}
