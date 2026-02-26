import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Data, Match } from 'effect';

export type InsightsErrorCode =
  | 'NOT_FOUND'
  | 'DATABASE_ERROR'
  | 'AI_GENERATION_FAILED'
  | 'WEATHER_NOT_FOUND'
  | 'RATE_LIMITED';

export class InsightsError extends Data.TaggedError('InsightsError')<{
  readonly code: InsightsErrorCode;
  readonly message?: string;
}> {}

export function mapToHttpException(error: InsightsError): HttpException {
  const { code, message } = error;

  return Match.value(code).pipe(
    Match.withReturnType<HttpException>(),

    Match.when(
      Match.is('NOT_FOUND', 'WEATHER_NOT_FOUND'),
      () => new NotFoundException(message),
    ),

    Match.when(
      'RATE_LIMITED',
      () =>
        new HttpException(
          message ?? 'Rate limit exceeded',
          HttpStatus.TOO_MANY_REQUESTS,
        ),
    ),

    Match.when(
      'AI_GENERATION_FAILED',
      () =>
        new ServiceUnavailableException(
          message ?? 'Failed to generate AI insight',
        ),
    ),

    Match.when(
      'DATABASE_ERROR',
      () => new InternalServerErrorException(message),
    ),

    Match.exhaustive,
  );
}
