import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantInfo } from '../middleware/tenant.middleware';

/**
 * Decorator to extract tenant information from the request
 * Usage: @Tenant() tenant: TenantInfo
 */
export const Tenant = createParamDecorator(
  (data: keyof TenantInfo | undefined, ctx: ExecutionContext): any => {
    const request = ctx.switchToHttp().getRequest();
    const tenant = request.tenant as TenantInfo;

    if (data) {
      return tenant?.[data];
    }

    return tenant;
  },
);

/**
 * Decorator to extract just the tenant ID from the request
 * Usage: @TenantId() tenantId: string
 */
export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantId;
  },
);
