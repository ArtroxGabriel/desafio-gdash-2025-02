import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Data } from 'effect';

export class UserError extends Data.TaggedError('UserError')<{
  readonly code: UserErrorEnum;
  readonly message?: string;
}> {
  static readonly NOT_FOUND = new UserError({
    code: 'NOT_FOUND',
    message: 'User not found',
  });
  static readonly BAD_REQUEST = new UserError({
    code: 'BAD_REQUEST',
    message: 'Bad request',
  });
  static readonly INTERNAL_SERVER_ERROR = new UserError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Something went wrong internally',
  });
}

export type UserErrorEnum =
  | 'NOT_FOUND'
  | 'DATABASE_ERROR'
  | 'BAD_REQUEST'
  | 'INTERNAL_SERVER_ERROR';

export function mapToHttpException(error: UserError): HttpException {
  switch (error.code) {
    case 'NOT_FOUND':
      return new NotFoundException(error.message);
    case 'BAD_REQUEST':
      return new BadRequestException(error.message);
    case 'DATABASE_ERROR':
    case 'INTERNAL_SERVER_ERROR':
    default:
      return new InternalServerErrorException(error.message);
  }
}
