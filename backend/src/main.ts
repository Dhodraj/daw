// New Relic must be loaded first, before any other imports
if (process.env.NEW_RELIC_LICENSE_KEY) {
  require('newrelic');
}

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './shared/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: [
      'http://localhost:5173', // Vite dev server
      'http://localhost:3001', // Alternative frontend port
      'http://127.0.0.1:5173',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Tenant-Id',
      'X-Idempotency-Key',
      'X-Driver-Id',
      'X-Request-Id',
    ],
    credentials: true,
  });

  // Global exception filter for standardized error responses
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error for unknown properties
      transform: true, // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global prefix for API versioning
  app.setGlobalPrefix('', {
    exclude: ['/', 'health'],
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Ride-hailing API running on http://localhost:${port}`);
  console.log(`📡 WebSocket server running on ws://localhost:${port}/rides`);

  if (process.env.NEW_RELIC_LICENSE_KEY) {
    console.log(`📊 New Relic monitoring enabled`);
  }
}
bootstrap();
