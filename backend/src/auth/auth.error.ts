import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

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
