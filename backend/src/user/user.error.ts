import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

export enum UserError {
  NOT_FOUND = 'User not found',
  BAD_REQUEST = 'Bad request',
  INTERNAL_SERVER_ERROR = 'Something went wrong internally',
}

export function mapToHttpException(error: UserError): HttpException {
  switch (error) {
    case UserError.NOT_FOUND:
      return new NotFoundException(error);
    case UserError.BAD_REQUEST:
      return new BadRequestException(error);
    default:
      return new InternalServerErrorException(UserError.INTERNAL_SERVER_ERROR);
  }
}
