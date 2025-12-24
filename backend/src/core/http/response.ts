export enum StatusCode {
  SUCCESS = 10000,
  FAILURE = 10001,
  RETRY = 10002,
  INVALID_ACCESS_TOKEN = 10003,
}

export class MessageResponse {
  readonly statusCode: StatusCode;
  readonly message: string;

  constructor(statusCode: StatusCode, message: string) {
    this.statusCode = statusCode;
    this.message = message;
  }
}

export class DataResponse<T> extends MessageResponse {
  readonly data: T;

  constructor(statusCode: StatusCode, message: string, data: T) {
    super(statusCode, message);
    this.data = data;
  }
}

export class PaginationResponse<T> extends DataResponse<T[]> {
  readonly total: number;
  readonly page: number;
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
