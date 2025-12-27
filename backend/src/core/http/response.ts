import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsString } from 'class-validator';

export enum StatusCode {
  SUCCESS = 10000,
  FAILURE = 10001,
  RETRY = 10002,
  INVALID_ACCESS_TOKEN = 10003,
}

export class MessageResponseDTO {
  @IsEnum(StatusCode)
  @ApiProperty({ description: 'Status code of the response', enum: StatusCode })
  readonly statusCode: StatusCode;

  @IsString()
  @ApiProperty({ description: 'Message describing the response' })
  readonly message: string;

  constructor(statusCode: StatusCode, message: string) {
    this.statusCode = statusCode;
    this.message = message;
  }
}

export class DataResponseDTO<T> extends MessageResponseDTO {
  readonly data: T;

  constructor(statusCode: StatusCode, message: string, data: T) {
    super(statusCode, message);
    this.data = data;
  }
}

export class PaginationResponseDTO<T> extends DataResponseDTO<T[]> {
  @IsInt()
  @ApiProperty({ description: 'Total number of items available' })
  readonly total: number;

  @IsInt()
  @ApiProperty({ description: 'Current page number' })
  readonly page: number;

  @IsInt()
  @ApiProperty({ description: 'Number of items per page' })
  readonly limit: number;

  constructor(
    statusCode: StatusCode,
    message: string,
    data: T[],
    total: number,
    page: number,
    limit: number,
  ) {
    super(statusCode, message, data);
    this.total = total;
    this.page = page;
    this.limit = limit;
  }
}
