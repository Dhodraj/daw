import {
  Injectable,
  NestMiddleware,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class IdempotencyMiddleware implements NestMiddleware {
  constructor(private readonly redis: RedisService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Only apply to mutating methods
    if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
      return next();
    }

    // Skip if no idempotency key provided (some endpoints may not require it)
    const idempotencyKey = req.headers['x-idempotency-key'] as string;
    if (!idempotencyKey) {
      return next();
    }

    const tenantId = req.tenantId;
    if (!tenantId) {
      // If no tenant context, use 'global' namespace
      return next();
    }

    // Check if we have a cached response for this idempotency key
    const cached = await this.redis.getIdempotencyResponse(
      tenantId,
      idempotencyKey,
    );

    if (cached) {
      // Verify the request hash matches (same request body)
      const currentHash = this.hashRequest(req);

      if (cached.requestHash !== currentHash) {
        throw new ConflictException(
          'Idempotency key has been used with a different request payload',
        );
      }

      // Return the cached response
      return res.status(cached.statusCode).json(cached.body);
    }

    // Store the request hash to mark this key as "in progress"
    const requestHash = this.hashRequest(req);

    // Intercept the response to cache it
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      // Store the response for future idempotent requests
      this.redis
        .setIdempotencyResponse(tenantId, idempotencyKey, {
          statusCode: res.statusCode,
          body,
          requestHash,
        })
        .catch((err) => {
          console.error('Failed to cache idempotency response:', err);
        });

      return originalJson(body);
    };

    next();
  }

  private hashRequest(req: Request): string {
    const data = JSON.stringify({
      path: req.path,
      method: req.method,
      body: req.body,
    });
    return createHash('sha256').update(data).digest('hex');
  }
}
