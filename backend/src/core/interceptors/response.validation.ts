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
import { WinstonLogger } from 'src/setup/winston.logger';

@Injectable()
export class ResponseValidation implements NestInterceptor {
  constructor(private readonly logger: WinstonLogger) {}

  intercept(_: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: Array<object> | object) => {
        if (Array.isArray(data)) {
          data.forEach((item: unknown) => {
            if (item instanceof Object) this.validate(item);
          });
          return data;
        }
        if (data instanceof Object) {
          this.validate(data);
        }
        return data;
      }),
    );
  }

  private validate(data: object) {
    const errors = validateSync(data);
    if (errors.length > 0) {
      const messages = this.extractErrorMessages(errors);
      this.logger.error(`Response validation failed: ${messages.join('; ')}`);
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
      if (error) {
        if (error.children && error.children.length > 0)
          this.extractErrorMessages(error.children, messages);
        const constraints = error.constraints;
        if (constraints) messages.push(Object.values(constraints).join(', '));
      }
    }
    return messages;
  }
}
