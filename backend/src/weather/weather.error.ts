import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

export enum WeatherError {
  NOT_FOUND = 'Weather snapshot not found',
  BAD_REQUEST = 'Invalid weather data provided',
  INTERNAL_SERVER_ERROR = 'Something went wrong internally',
}

export function mapToHttpException(error: WeatherError): HttpException {
  switch (error) {
    case WeatherError.NOT_FOUND:
      return new NotFoundException();
    case WeatherError.BAD_REQUEST:
      return new BadRequestException(error);
    case WeatherError.INTERNAL_SERVER_ERROR:
    default:
      return new InternalServerErrorException();
  }
}
