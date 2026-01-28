import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AppException, ApiErrorResponse } from '../errors/app.exception';
import { ErrorCode, ErrorMessages } from '../errors/error-codes';

/**
 * Global HTTP Exception Filter
 * Provides consistent error response format across all endpoints
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Generate unique request ID for tracking
    const requestId = (request.headers['x-request-id'] as string) || uuidv4();

    // Build error response
    const errorResponse = this.buildErrorResponse(exception, request.url, requestId);
    const statusCode = this.getStatusCode(exception);

    // Log the error
    this.logError(exception, request, requestId, statusCode);

    // Send response
    response.status(statusCode).json(errorResponse);
  }

  private buildErrorResponse(
    exception: unknown,
    path: string,
    requestId: string,
  ): ApiErrorResponse {
    // Handle AppException (our custom exceptions)
    if (exception instanceof AppException) {
      return exception.toResponse(path, requestId);
    }

    // Handle standard HttpException
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      let message: string;
      let details: Record<string, any> | undefined;

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as Record<string, any>;
        message = resp.message || exception.message;

        // Handle validation errors from class-validator
        if (Array.isArray(resp.message)) {
          message = 'Validation failed';
          details = { validationErrors: resp.message };
        }
      } else {
        message = exception.message;
      }

      const errorCode = this.httpStatusToErrorCode(status);

      return {
        success: false,
        error: {
          code: errorCode,
          message,
          details,
          timestamp: new Date().toISOString(),
          path,
          requestId,
        },
      };
    }

    // Handle unknown errors
    return {
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: ErrorMessages[ErrorCode.INTERNAL_ERROR],
        timestamp: new Date().toISOString(),
        path,
        requestId,
      },
    };
  }

  private getStatusCode(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private httpStatusToErrorCode(status: number): ErrorCode {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.VALIDATION_ERROR;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ErrorCode.CONFLICT;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ErrorCode.RATE_LIMITED;
      case HttpStatus.SERVICE_UNAVAILABLE:
        return ErrorCode.SERVICE_UNAVAILABLE;
      default:
        return ErrorCode.INTERNAL_ERROR;
    }
  }

  private logError(
    exception: unknown,
    request: Request,
    requestId: string,
    statusCode: number,
  ) {
    const errorLog = {
      requestId,
      method: request.method,
      url: request.url,
      statusCode,
      timestamp: new Date().toISOString(),
      tenantId: request.headers['x-tenant-id'],
      userAgent: request.headers['user-agent'],
    };

    if (statusCode >= 500) {
      // Log full error details for server errors
      this.logger.error(
        `Server Error: ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
        JSON.stringify(errorLog),
      );
    } else if (statusCode >= 400) {
      // Log client errors at warn level
      this.logger.warn(
        `Client Error: ${request.method} ${request.url}`,
        JSON.stringify({
          ...errorLog,
          message: exception instanceof Error ? exception.message : String(exception),
        }),
      );
    }
  }
}
