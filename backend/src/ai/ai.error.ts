import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Data, Match } from 'effect';

export type AiErrorCode =
  | 'API_ERROR'
  | 'RATE_LIMITED'
  | 'INVALID_RESPONSE'
  | 'TIMEOUT';

export class AiError extends Data.TaggedError('AiError')<{
  readonly code: AiErrorCode;
  readonly message?: string;
}> {}

export function mapToHttpException(error: AiError): HttpException {
  const { code, message } = error;

  return Match.value(code).pipe(
    Match.withReturnType<HttpException>(),

    Match.when(
      'RATE_LIMITED',
      () =>
        new HttpException(
          message ?? 'AI rate limit exceeded',
          HttpStatus.TOO_MANY_REQUESTS,
        ),
    ),

    Match.when(
      'TIMEOUT',
      () => new ServiceUnavailableException(message ?? 'AI service timed out'),
    ),

    Match.when(
      Match.is('API_ERROR', 'INVALID_RESPONSE'),
      () => new InternalServerErrorException(message ?? 'AI service error'),
    ),

    Match.exhaustive,
  );
}
