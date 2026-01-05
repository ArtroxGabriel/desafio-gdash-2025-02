import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Data } from 'effect';

export class AuthErrorClass extends Data.TaggedError('AuthError')<{
  readonly code: AuthErrorEnum;
  readonly message?: string;
}> {
  static readonly USER_ALREADY_EXISTS = new AuthErrorClass({
    code: 'USER_ALREADY_EXISTS',
    message: 'This email is already registered',
  });

  static readonly NOT_FOUND = new AuthErrorClass({
    code: 'NOT_FOUND',
    message: 'Weather snapshot not found',
  });

  static readonly BAD_REQUEST = new AuthErrorClass({
    code: 'BAD_REQUEST',
    message: 'Invalid weather data provided',
  });

  static readonly TOKEN_SUBJECT_MISMATCH = new AuthErrorClass({
    code: 'TOKEN_SUBJECT_MISMATCH',
    message: 'Token subject mismatch',
  });

  static readonly EXPIRED_ACCESS_TOKEN = new AuthErrorClass({
    code: 'EXPIRED_ACCESS_TOKEN',
    message: 'Expired Access token',
  });

  static readonly INVALID_ACCESS_TOKEN = new AuthErrorClass({
    code: 'INVALID_ACCESS_TOKEN',
    message: 'Invalid Access token',
  });

  static readonly USER_NOT_REGISTERED = new AuthErrorClass({
    code: 'USER_NOT_REGISTERED',
    message: 'User not registered',
  });

  static readonly INVALID_CREDENTIALS = new AuthErrorClass({
    code: 'INVALID_CREDENTIALS',
    message: 'Invalid credentials',
  });
}

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

export function mapToHttpExceptionV2(error: AuthErrorClass): HttpException {
  switch (error.code) {
    case 'BAD_REQUEST':
    case 'USER_ALREADY_EXISTS':
      return new BadRequestException(error.message);
    case 'INVALID_ACCESS_TOKEN':
    case 'TOKEN_SUBJECT_MISMATCH':
    case 'INVALID_CREDENTIALS':
    case 'USER_NOT_REGISTERED':
      return new UnauthorizedException(error.message);
    case 'FORBIDDEN':
      return new ForbiddenException();
    case 'INTERNAL_SERVER_ERROR':
    default:
      return new InternalServerErrorException();
  }
}

export enum AuthError {
  USER_ALREADY_EXISTS = 'This email is already registered',
  NOT_FOUND = 'Weather snapshot not found',
  BAD_REQUEST = 'Invalid weather data provided',
  INTERNAL_SERVER_ERROR = 'Something went wrong internally',

  TOKEN_SUBJECT_MISMATCH = 'Token subject mismatch',
  EXPIRED_ACCESS_TOKEN = 'Expired Access token',
  INVALID_ACCESS_TOKEN = 'Invalid Access token',

  USER_NOT_REGISTERED = 'User not registered',
  INVALID_CREDENTIALS = 'Invalid credentials',
}

export function mapToHttpException(error: AuthError): HttpException {
  switch (error) {
    case AuthError.BAD_REQUEST:
    case AuthError.USER_ALREADY_EXISTS:
      return new BadRequestException(error);
    case AuthError.INVALID_ACCESS_TOKEN:
    case AuthError.TOKEN_SUBJECT_MISMATCH:
    case AuthError.INVALID_CREDENTIALS:
    case AuthError.USER_NOT_REGISTERED:
      return new UnauthorizedException(error);
    case AuthError.INTERNAL_SERVER_ERROR:
    default:
      return new InternalServerErrorException();
  }
}
