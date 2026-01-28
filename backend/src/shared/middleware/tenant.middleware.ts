import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../database/prisma.service';

export interface TenantInfo {
  id: string;
  name: string;
  schemaName: string;
  region: string;
  config: Record<string, any>;
}

// Extend Express Request to include tenant info
declare global {
  namespace Express {
    interface Request {
      tenant?: TenantInfo;
      tenantId?: string;
    }
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  // Cache tenant info to avoid repeated DB lookups
  private tenantCache: Map<string, { tenant: TenantInfo; expiresAt: number }> =
    new Map();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Skip tenant check for health endpoints
    if (req.path === '/health' || req.path === '/') {
      return next();
    }

    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      throw new BadRequestException(
        'X-Tenant-Id header is required for all API requests',
      );
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tenantId)) {
      throw new BadRequestException('Invalid tenant ID format');
    }

    try {
      const tenant = await this.getTenant(tenantId);
      req.tenant = tenant;
      req.tenantId = tenant.id;
      next();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or inactive tenant');
    }
  }

  private async getTenant(tenantId: string): Promise<TenantInfo> {
    // Check cache first
    const cached = this.tenantCache.get(tenantId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.tenant;
    }

    // Fetch from database
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new UnauthorizedException('Tenant not found');
    }

    if (tenant.status !== 'ACTIVE') {
      throw new UnauthorizedException('Tenant is not active');
    }

    const tenantInfo: TenantInfo = {
      id: tenant.id,
      name: tenant.name,
      schemaName: tenant.schemaName,
      region: tenant.region,
      config: tenant.config as Record<string, any>,
    };

    // Update cache
    this.tenantCache.set(tenantId, {
      tenant: tenantInfo,
      expiresAt: Date.now() + this.CACHE_TTL_MS,
    });

    return tenantInfo;
  }
}
