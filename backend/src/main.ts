import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
      content: documentFactory,
    }),
  );

  await app.listen(process.env.NESTJS_PORT ?? 3000);
}
bootstrap().catch((err) => console.error(err));
