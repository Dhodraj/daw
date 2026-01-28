import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(private readonly configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.get<string>('redis.host'),
      port: this.configService.get<number>('redis.port'),
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) return null;
        return Math.min(times * 100, 3000);
      },
    });

    this.client.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    this.client.on('connect', () => {
      console.log('Redis connected successfully');
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  getClient(): Redis {
    return this.client;
  }

  // =====================
  // Basic Operations
  // =====================

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(
    key: string,
    value: string,
    ttlSeconds?: number,
  ): Promise<'OK' | null> {
    if (ttlSeconds) {
      return this.client.set(key, value, 'EX', ttlSeconds);
    }
    return this.client.set(key, value);
  }

  async setNX(
    key: string,
    value: string,
    ttlSeconds: number,
  ): Promise<boolean> {
    const result = await this.client.set(key, value, 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  // =====================
  // Geospatial Operations
  // =====================

  /**
   * Add a driver's location to a geospatial index
   */
  async geoAdd(
    tenantId: string,
    tier: string,
    driverId: string,
    longitude: number,
    latitude: number,
  ): Promise<number> {
    const key = `tenant:${tenantId}:geo:drivers:${tier}`;
    return this.client.geoadd(key, longitude, latitude, driverId);
  }

  /**
   * Remove a driver from all geospatial indexes
   */
  async geoRemove(tenantId: string, driverId: string): Promise<void> {
    const tiers = ['ECONOMY', 'COMFORT', 'PREMIUM', 'XL'];
    const pipeline = this.client.pipeline();

    for (const tier of tiers) {
      const key = `tenant:${tenantId}:geo:drivers:${tier}`;
      pipeline.zrem(key, driverId);
    }

    await pipeline.exec();
  }

  /**
   * Search for nearby drivers within a radius
   */
  async geoSearch(
    tenantId: string,
    tier: string,
    longitude: number,
    latitude: number,
    radiusMeters: number,
    count: number = 20,
  ): Promise<Array<{ driverId: string; distance: number }>> {
    const key = `tenant:${tenantId}:geo:drivers:${tier}`;

    // GEOSEARCH key FROMMEMBER member BYRADIUS radius unit [WITHDIST] [ASC|DESC] [COUNT count]
    const results = await this.client.call(
      'GEOSEARCH',
      key,
      'FROMLONLAT',
      longitude.toString(),
      latitude.toString(),
      'BYRADIUS',
      radiusMeters.toString(),
      'm',
      'WITHDIST',
      'ASC',
      'COUNT',
      count.toString(),
    ) as string[][];

    return results.map((result) => ({
      driverId: result[0],
      distance: parseFloat(result[1]),
    }));
  }

  // =====================
  // Driver Location Store
  // =====================

  /**
   * Store driver's detailed location
   */
  async setDriverLocation(
    tenantId: string,
    driverId: string,
    location: {
      latitude: number;
      longitude: number;
      heading?: number;
      speed?: number;
    },
    ttlSeconds: number = 120,
  ): Promise<void> {
    const key = `tenant:${tenantId}:driver:loc:${driverId}`;
    const value = JSON.stringify({
      ...location,
      timestamp: Date.now(),
    });
    await this.client.set(key, value, 'EX', ttlSeconds);
  }

  /**
   * Get driver's detailed location
   */
  async getDriverLocation(
    tenantId: string,
    driverId: string,
  ): Promise<{
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
    timestamp: number;
  } | null> {
    const key = `tenant:${tenantId}:driver:loc:${driverId}`;
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  // =====================
  // Driver Locking (for matching)
  // =====================

  /**
   * Try to acquire a lock on a driver for ride assignment
   * Returns true if lock acquired, false if driver already locked
   */
  async lockDriver(
    tenantId: string,
    driverId: string,
    rideId: string,
    ttlSeconds: number = 30,
  ): Promise<boolean> {
    const key = `tenant:${tenantId}:driver:lock:${driverId}`;
    return this.setNX(key, rideId, ttlSeconds);
  }

  /**
   * Release a driver lock (only if we own it)
   */
  async unlockDriver(
    tenantId: string,
    driverId: string,
    rideId: string,
  ): Promise<boolean> {
    const key = `tenant:${tenantId}:driver:lock:${driverId}`;

    // Use Lua script for atomic check-and-delete
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

    const result = await this.client.eval(script, 1, key, rideId);
    return result === 1;
  }

  /**
   * Check if a driver is locked
   */
  async isDriverLocked(tenantId: string, driverId: string): Promise<boolean> {
    const key = `tenant:${tenantId}:driver:lock:${driverId}`;
    return this.exists(key);
  }

  // =====================
  // Idempotency
  // =====================

  /**
   * Store idempotency response
   */
  async setIdempotencyResponse(
    tenantId: string,
    idempotencyKey: string,
    response: {
      statusCode: number;
      body: any;
      requestHash: string;
    },
    ttlSeconds: number = 86400, // 24 hours
  ): Promise<void> {
    const key = `tenant:${tenantId}:idem:${idempotencyKey}`;
    await this.client.set(key, JSON.stringify(response), 'EX', ttlSeconds);
  }

  /**
   * Get idempotency response
   */
  async getIdempotencyResponse(
    tenantId: string,
    idempotencyKey: string,
  ): Promise<{
    statusCode: number;
    body: any;
    requestHash: string;
  } | null> {
    const key = `tenant:${tenantId}:idem:${idempotencyKey}`;
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  // =====================
  // Pub/Sub for Real-time
  // =====================

  /**
   * Publish a message to a channel
   */
  async publish(channel: string, message: any): Promise<number> {
    return this.client.publish(channel, JSON.stringify(message));
  }

  /**
   * Subscribe to a channel (returns a new subscriber client)
   */
  createSubscriber(): Redis {
    return new Redis({
      host: this.configService.get<string>('redis.host'),
      port: this.configService.get<number>('redis.port'),
    });
  }
}
