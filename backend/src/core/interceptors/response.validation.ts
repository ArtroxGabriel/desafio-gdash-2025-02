import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ValidationError, validateSync } from 'class-validator';

@Injectable()
export class ResponseValidation implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown) => {
        if (Array.isArray(data)) {
          data.forEach((item) => {
            if (this.isObject(item)) {
              this.validate(item);
            }
          });
        } else if (this.isObject(data)) {
          this.validate(data);
        }
        return data;
      }),
    );
  }

  private isObject(value: unknown): value is object {
    return value !== null && typeof value === 'object';
  }

  private validate(data: object) {
    const errors = validateSync(data);
    if (errors.length > 0) {
      const messages = this.extractErrorMessages(errors);
      throw new InternalServerErrorException([
        'Response validation failed',
        ...messages,
      ]);
    }
  }

  private extractErrorMessages(
    errors: ValidationError[],
    messages: string[] = [],
  ): string[] {
    for (const error of errors) {
      if (error.children && error.children.length > 0) {
        this.extractErrorMessages(error.children, messages);
      }

      if (error.constraints) {
        messages.push(...Object.values(error.constraints));
      }
    }
    return messages;
  }
}
