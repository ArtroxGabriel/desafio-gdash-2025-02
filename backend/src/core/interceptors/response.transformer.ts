import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import {
  DataResponseDTO,
  MessageResponseDTO,
  PaginationResponseDTO,
  StatusCode,
} from '../http/response';

@Injectable()
export class ResponseTransformer implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        if (data instanceof MessageResponseDTO) return data;
        if (data instanceof PaginationResponseDTO) return data;
        if (data instanceof DataResponseDTO) return data;
        if (typeof data == 'string')
          return new MessageResponseDTO(StatusCode.SUCCESS, data);
        return new DataResponseDTO(StatusCode.SUCCESS, 'success', data);
      }),
    );
  }
}
