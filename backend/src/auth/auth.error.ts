import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Data, Match } from 'effect';

export class AuthErrorClass extends Data.TaggedError('AuthError')<{
  readonly code: AuthErrorEnum;
  readonly message?: string;
}> {}

export type AuthErrorEnum =
  | 'USER_ALREADY_EXISTS'
  | 'NOT_FOUND'
  | 'BAD_REQUEST'
  | 'INTERNAL_SERVER_ERROR'
  | 'TOKEN_SUBJECT_MISMATCH'
  | 'EXPIRED_ACCESS_TOKEN'
  | 'INVALID_ACCESS_TOKEN'
  | 'USER_NOT_REGISTERED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INVALID_CREDENTIALS';

export function mapToHttpException(error: AuthErrorClass): HttpException {
  const { code, message } = error;

  return Match.value(code).pipe(
    Match.withReturnType<HttpException>(),

    Match.when('USER_ALREADY_EXISTS', () => new ConflictException(message)),

    Match.when(
      Match.is('BAD_REQUEST', 'NOT_FOUND'),
      () => new BadRequestException(message),
    ),

    Match.when(
      Match.is(
        'INVALID_ACCESS_TOKEN',
        'TOKEN_SUBJECT_MISMATCH',
        'INVALID_CREDENTIALS',
        'USER_NOT_REGISTERED',
        'EXPIRED_ACCESS_TOKEN',
        'UNAUTHORIZED',
      ),
      () => new UnauthorizedException(message),
    ),

    Match.when('FORBIDDEN', () => new ForbiddenException()),

    Match.when(
      'INTERNAL_SERVER_ERROR',
      () => new InternalServerErrorException(),
    ),

    Match.exhaustive,
  );
}
