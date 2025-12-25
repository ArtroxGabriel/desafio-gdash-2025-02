import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { AppModule } from './app.module';
import { ServerConfig, ServerConfigName } from './config/server.config';

async function server() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const openApiConfig = new DocumentBuilder()
    .setTitle('Weather API')
    .setDescription('The Weather API description')
    .setVersion('1.0')
    .addTag('weather')
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, openApiConfig);

  app.use(
    '/api/docs',
    apiReference({
      content: documentFactory(),
    }),
  );

  const configService = app.get(ConfigService);
  const serverConfig = configService.getOrThrow<ServerConfig>(ServerConfigName);

  Logger.debug(`Starting server on port ${serverConfig.port}`);
  await app.listen(serverConfig.port);
}

void server();
