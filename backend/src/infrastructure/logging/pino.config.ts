import { Params } from 'nestjs-pino';

/**
 * Pino logger configuration
 * Provides structured JSON logging with request correlation
 */
export const pinoLoggerConfig: Params = {
  pinoHttp: {
    // Use pino-pretty for development
    transport:
      process.env.NODE_ENV !== 'production'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              levelFirst: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          }
        : undefined,

    // Log level
    level: process.env.LOG_LEVEL || 'info',

    // Generate unique request ID
    genReqId: (req) => {
      const existingId = req.headers['x-request-id'] as string | undefined;
      return (
        existingId ||
        `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      );
    },

    // Customize log message
    customLogLevel: (req, res, err) => {
      if (res.statusCode >= 500 || err) {
        return 'error';
      }
      if (res.statusCode >= 400) {
        return 'warn';
      }
      return 'info';
    },

    // Customize success message
    customSuccessMessage: (req, res) => {
      return `${req.method} ${req.url} completed`;
    },

    // Customize error message
    customErrorMessage: (req, res, err) => {
      return `${req.method} ${req.url} failed: ${err.message}`;
    },

    // Redact sensitive information
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.body.password',
        'req.body.creditCard',
        'req.body.cardNumber',
        'req.body.cvv',
        'req.body.token',
      ],
      censor: '[REDACTED]',
    },

    // Customize serializers
    serializers: {
      req: (req) => ({
        id: req.id,
        method: req.method,
        url: req.url,
        query: req.query,
        params: req.params,
        // Include tenant ID if present
        tenantId: req.headers['x-tenant-id'],
        userAgent: req.headers['user-agent'],
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),
      err: (err) => ({
        type: err.constructor?.name,
        message: err.message,
        code: err.code,
        stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
      }),
    },

    // Auto-logging
    autoLogging: {
      ignore: (req) => {
        // Don't log health check endpoints
        return req.url?.includes('/health') || req.url?.includes('/metrics');
      },
    },

    // Quiet on request errors (we handle them in our exception filters)
    quietReqLogger: true,
  },
};
