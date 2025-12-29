import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { ServerConfig, ServerConfigName } from './config/server.config';
import { OpenApiSetup } from './setup/open-api.factory';

async function server() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  app.setGlobalPrefix('api');

  OpenApiSetup(app);

  const configService = app.get(ConfigService);
  const serverConfig = configService.getOrThrow<ServerConfig>(ServerConfigName);

  Logger.debug(`Starting server on port ${serverConfig.port}`);
  await app.listen(serverConfig.port);
}

void server();
