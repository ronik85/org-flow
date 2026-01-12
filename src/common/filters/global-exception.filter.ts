import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    // region DB error handling
    if (exception instanceof QueryFailedError) {
      const err = exception as any;

      switch (err.code) {
        case '23505': // unique violation
          statusCode = HttpStatus.CONFLICT;
          message = err.detail ?? 'Already exists';
          break;

        case '23503': // foreign key violation
          statusCode = HttpStatus.BAD_REQUEST;
          message = err.detail ?? 'Invalid reference (foreign key violation)';
          break;

        case '23502': // not null violation
          statusCode = HttpStatus.BAD_REQUEST;
          message = err.detail ?? 'Missing required field';
          break;

        case '22P02': // invalid input syntax (uuid/int)
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'Invalid input format';
          break;

        default:
          statusCode = HttpStatus.BAD_REQUEST;
          message = err.message;
      }

      return response.status(statusCode).json({
        statusCode,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      message =
        typeof res === 'string'
          ? res
          : ((res as any).message ?? exception.message);

      return response.status(statusCode).json({
        statusCode,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    console.error('Unhandled exception:', exception);

    return response.status(statusCode).json({
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
