import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface DomainException extends Error {
  statusCode: number;
}

function isDomainException(exception: unknown): exception is DomainException {
  return (
    exception instanceof Error &&
    'statusCode' in exception &&
    typeof (exception as DomainException).statusCode === 'number'
  );
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, message, errorName } = this.resolveException(exception);

    response.status(statusCode).json({
      statusCode,
      message,
      error: errorName,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private resolveException(exception: unknown): {
    statusCode: number;
    message: string;
    errorName: string;
  } {
    if (exception instanceof HttpException) {
      return {
        statusCode: exception.getStatus(),
        message: exception.message,
        errorName: exception.constructor.name,
      };
    }

    if (isDomainException(exception)) {
      return {
        statusCode: exception.statusCode,
        message: exception.message,
        errorName: exception.constructor.name,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error interno del servidor.',
      errorName: 'InternalServerErrorException',
    };
  }
}
