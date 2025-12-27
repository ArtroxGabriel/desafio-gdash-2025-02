import { Module } from '@nestjs/common';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WeatherModule } from './weather/weather.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseFactory } from './setup/database.factory';
import { WinstonModule } from 'nest-winston';
import databaseConfig from './config/database.config';
import serverConfig from './config/server.config';
import { CoreModule } from './core/core.module';
import { WinstonFactory } from './setup/winston.factory';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, serverConfig],
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
    CoreModule,
    WeatherModule,
  ],
  providers: [Logger],
})
export class AppModule {}
