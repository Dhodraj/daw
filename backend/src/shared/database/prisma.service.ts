import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private tenantClients: Map<string, PrismaClient> = new Map();

  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    // Disconnect all tenant clients
    for (const client of this.tenantClients.values()) {
      await client.$disconnect();
    }
  }

  /**
   * Get a Prisma client configured for a specific tenant schema
   */
  async forTenant(tenantId: string): Promise<PrismaClient> {
    const schemaName = `tenant_${tenantId}`;

    // Check if we already have a client for this tenant
    if (this.tenantClients.has(schemaName)) {
      return this.tenantClients.get(schemaName);
    }

    // Create a new client with the tenant's schema
    const baseUrl = process.env.DATABASE_URL.split('?')[0];
    const tenantUrl = `${baseUrl}?schema=${schemaName}`;

    const tenantClient = new PrismaClient({
      datasources: {
        db: {
          url: tenantUrl,
        },
      },
      log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
    });

    await tenantClient.$connect();
    this.tenantClients.set(schemaName, tenantClient);

    return tenantClient;
  }

  /**
   * Execute raw SQL for operations not supported by Prisma (e.g., PostGIS)
   */
  async executeRaw(sql: string, params: any[] = []): Promise<any> {
    return this.$queryRawUnsafe(sql, ...params);
  }

  /**
   * Execute raw SQL within a tenant schema
   */
  async executeRawForTenant(
    tenantId: string,
    sql: string,
    params: any[] = [],
  ): Promise<any> {
    const client = await this.forTenant(tenantId);
    return client.$queryRawUnsafe(sql, ...params);
  }
}
