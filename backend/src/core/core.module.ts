import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { validationFactory } from '../setup/validation.factory';
import { CoreController } from './core.controller';
import { ExceptionHandler } from './interceptors/exception.handler';
import { ResponseTransformer } from './interceptors/response.transformer';
import { ResponseValidation } from './interceptors/response.validation';

@Module({
  imports: [ConfigModule],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformer },
    { provide: APP_INTERCEPTOR, useClass: ResponseValidation },
    { provide: APP_FILTER, useClass: ExceptionHandler },
    { provide: APP_PIPE, useFactory: validationFactory },
  ],
  controllers: [CoreController],
})
export class CoreModule {}
