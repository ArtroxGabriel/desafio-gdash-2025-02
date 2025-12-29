import { HeaderName } from '@core/http/header';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

export const OpenApiSetup = (app: INestApplication) => {
  const openApiConfig = new DocumentBuilder()
    .setTitle('Weather API')
    .setDescription('The Weather API description')
    .setVersion('1.0')
    .addTag('weather')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'authorization',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: HeaderName.API_KEY,
        in: 'header',
        description: 'Enter your API Key',
      },
      'api_key',
    )
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, openApiConfig);

  app.use(
    '/api/docs',
    apiReference({
      content: documentFactory(),
    }),
  );
};
