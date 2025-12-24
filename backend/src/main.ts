import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { ConfigService } from '@nestjs/config';
import { ConsoleLogger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      json: true,
      colors: true,
    }),
  });

  const config = new DocumentBuilder()
    .setTitle('Weather API')
    .setDescription('The Weather API description')
    .setVersion('1.0')
    .addTag('weather')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);

  app.use(
    '/api/docs',
    apiReference({
      content: documentFactory(),
    }),
  );

  const NESTJS_PORT = app.get(ConfigService).get<string>('NESTJS_PORT');
  await app.listen(NESTJS_PORT ?? 3000);
}

void bootstrap();
