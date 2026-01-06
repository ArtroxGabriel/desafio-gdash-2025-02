import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Data, Match } from 'effect';

export class WeatherError extends Data.TaggedError('WeatherError')<{
  readonly code: WeatherErrorEnum;
  readonly message?: string;
}> {}

export type WeatherErrorEnum =
  | 'NOT_FOUND'
  | 'DATABASE_ERROR'
  | 'BAD_REQUEST'
  | 'INTERNAL_SERVER_ERROR';

export function mapToHttpException(error: WeatherError): HttpException {
  const { code, message } = error;

  return Match.value(code).pipe(
    Match.withReturnType<HttpException>(),

    Match.when('NOT_FOUND', () => new NotFoundException(message)),

    Match.when('BAD_REQUEST', () => new BadRequestException(message)),

    Match.when(
      Match.is('DATABASE_ERROR', 'INTERNAL_SERVER_ERROR'),
      () => new InternalServerErrorException(message),
    ),

    Match.exhaustive,
  );
}
