import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Data } from 'effect';

export class WeatherError extends Data.TaggedError('WeatherError')<{
  readonly code: WeatherErrorEnum;
  readonly message?: string;
}> {
  static readonly NOT_FOUND = new WeatherError({
    code: 'NOT_FOUND',
    message: 'Weather data not found',
  });

  static readonly DATABASE_ERROR = new WeatherError({
    code: 'DATABASE_ERROR',
  });

  static readonly BAD_REQUEST = new WeatherError({
    code: 'BAD_REQUEST',
    message: 'Bad Request',
  });

  static readonly INTERNAL_SERVER_ERROR = new WeatherError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal Server Error',
  });
}

export type WeatherErrorEnum =
  | 'NOT_FOUND'
  | 'DATABASE_ERROR'
  | 'BAD_REQUEST'
  | 'INTERNAL_SERVER_ERROR';

export function mapToHttpException(error: WeatherError): HttpException {
  switch (error.code) {
    case 'NOT_FOUND':
      return new NotFoundException(error.message);
    case 'BAD_REQUEST':
      return new BadRequestException(error.message);
    case 'INTERNAL_SERVER_ERROR':
    case 'DATABASE_ERROR':
    default:
      return new InternalServerErrorException();
  }
}
