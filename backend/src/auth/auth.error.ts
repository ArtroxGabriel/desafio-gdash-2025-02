import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

export enum AuthError {
  USER_ALREADY_EXISTS = 'User already exists',
  NOT_FOUND = 'Weather snapshot not found',
  BAD_REQUEST = 'Invalid weather data provided',
  INTERNAL_SERVER_ERROR = 'Something went wrong internally',

  TOKEN_SUBJECT_MISMATCH = 'Token subject mismatch',
  EXPIRED_ACCESS_TOKEN = 'Access token has expired',
  INVALID_ACCESS_TOKEN = 'Invalid Access token',
  EXPIRED_REFRESH_TOKEN = 'Refresh token has expired',
  INVALID_REFRESH_TOKEN = 'Invalid Refresh token',

  KEYSTORE_NOT_FOUND = 'Keystore not found',
  USER_NOT_REGISTERED = 'User not registered',
  INVALID_CREDENTIALS = 'Invalid credentials',
}

export function mapToHttpException(error: AuthError): HttpException {
  switch (error) {
    case AuthError.BAD_REQUEST:
      return new BadRequestException(error);
    case AuthError.INVALID_ACCESS_TOKEN:
    case AuthError.EXPIRED_REFRESH_TOKEN:
    case AuthError.INVALID_REFRESH_TOKEN:
    case AuthError.TOKEN_SUBJECT_MISMATCH:
    case AuthError.INVALID_CREDENTIALS:
    case AuthError.USER_ALREADY_EXISTS:
    case AuthError.USER_NOT_REGISTERED:
      return new UnauthorizedException(error);
    case AuthError.INTERNAL_SERVER_ERROR:
    case AuthError.KEYSTORE_NOT_FOUND:
    default:
      return new InternalServerErrorException();
  }
}
