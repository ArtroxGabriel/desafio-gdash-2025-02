import { AiModule } from '@ai/ai.module';
import { AuthModule } from '@auth/auth.module';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { WinstonModule } from 'nest-winston';
import aiConfig from './config/ai.config';
import authConfig from './config/auth.config';
import databaseConfig from './config/database.config';
import serverConfig from './config/server.config';
import tokenConfig from './config/token.config';
import { CoreModule } from './core/core.module';
import { InsightsModule } from './insights/insights.module';
import { DatabaseFactory } from './setup/database.factory';
import { WinstonFactory } from './setup/winston.factory';
import { UserModule } from './user/user.module';
import { WeatherModule } from './weather/weather.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, serverConfig, authConfig, tokenConfig, aiConfig],
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
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 10 }],
    }),
    CoreModule,
    AuthModule,
    WeatherModule,
    UserModule,
    AiModule,
    InsightsModule,
  ],
  providers: [Logger],
})
export class AppModule {}
