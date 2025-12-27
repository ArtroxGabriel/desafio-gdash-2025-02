import { AuthModule } from '@auth/auth.module';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { WinstonModule } from 'nest-winston';
import { ApiKey, ApiKeySchema } from './auth/schemas/apikey.schema';
import authConfig from './config/auth.config';
import databaseConfig from './config/database.config';
import serverConfig from './config/server.config';
import tokenConfig from './config/token.config';
import { CoreModule } from './core/core.module';
import { DatabaseFactory } from './setup/database.factory';
import { WinstonFactory } from './setup/winston.factory';
import { UserModule } from './user/user.module';
import { WeatherModule } from './weather/weather.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, serverConfig, authConfig, tokenConfig],
      cache: true,
      envFilePath: '.env',
    }),
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      useClass: WinstonFactory,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseFactory,
    }),
    MongooseModule.forFeature([{ name: ApiKey.name, schema: ApiKeySchema }]),
    CoreModule,
    AuthModule,
    WeatherModule,
    UserModule,
  ],
  providers: [Logger],
})
export class AppModule {}
