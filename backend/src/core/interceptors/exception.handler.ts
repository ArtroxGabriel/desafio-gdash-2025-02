import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenExpiredError } from '@nestjs/jwt';
import { isArray } from 'class-validator';
import { Request, Response } from 'express';
import { ServerConfig, ServerConfigName } from '../../config/server.config';
import { StatusCode } from '../http/response';

type ErrorResponse = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
  errors?: unknown[];
};

@Catch()
export class ExceptionHandler implements ExceptionFilter {
  private readonly logger = new Logger(ExceptionHandler.name);

  constructor(private readonly configService: ConfigService) {}
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      return this.handleHttpException(exception, request, response);
    }

    if (exception instanceof TokenExpiredError) {
      return this.handleTokenExpiredError(request, response);
    }

    return this.handleGenericError(exception, request, response);
  }

  private handleHttpException(
    exception: HttpException,
    request: Request,
    response: Response,
  ) {
    const status = exception.getStatus();
    const body = exception.getResponse();
    let statusCode = StatusCode.FAILURE;

    const { message, errors } = this.extractMessageAndErrors(body);

    if (exception instanceof InternalServerErrorException) {
      this.logger.error(message, exception.stack);
    }

    if (exception instanceof UnauthorizedException) {
      if (message.toLowerCase().includes('invalid access token')) {
        statusCode = StatusCode.INVALID_ACCESS_TOKEN;
        response.appendHeader('instruction', 'logout');
      }
    }

    return response.status(status).json({
      statusCode,
      message,
      errors,
      url: request.url,
    });
  }

  private handleTokenExpiredError(request: Request, response: Response) {
    response.appendHeader('instruction', 'refresh_token');

    return response.status(HttpStatus.UNAUTHORIZED).json({
      statusCode: StatusCode.INVALID_ACCESS_TOKEN,
      message: 'Token Expired',
      errors: undefined,
      url: request.url,
    });
  }

  private handleGenericError(
    exception: unknown,
    request: Request,
    response: Response,
  ) {
    const isError = exception instanceof Error;
    const errorMessage = isError ? exception.message : String(exception);
    const errorStack = isError ? exception.stack : undefined;

    this.logger.error(errorMessage, errorStack);

    const serverConfig =
      this.configService.getOrThrow<ServerConfig>(ServerConfigName);
    const clientMessage =
      serverConfig.nodeEnv === 'development'
        ? errorMessage
        : 'Something went wrong';

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: StatusCode.FAILURE,
      message: clientMessage,
      errors: undefined,
      url: request.url,
    });
  }

  private extractMessageAndErrors(body: string | object): {
    message: string;
    errors?: unknown[];
  } {
    if (typeof body === 'string') {
      return { message: body };
    }

    if (typeof body === 'object' && body !== null) {
      const errorBody = body as ErrorResponse;

      if (errorBody.errors) {
        return {
          message:
            typeof errorBody.message === 'string'
              ? errorBody.message
              : 'Validation failed',
          errors: errorBody.errors,
        };
      }

      if (isArray(errorBody.message) && errorBody.message.length > 0) {
        return {
          message: errorBody.message[0],
          errors: errorBody.message,
        };
      }

      if (typeof errorBody.message === 'string') {
        return { message: errorBody.message };
      }
    }

    return { message: 'Something went wrong' };
  }
}
