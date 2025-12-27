import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WeatherSnapshot,
  WeatherSnapshotSchema,
} from './schemas/weather.schema';
import { WeatherController } from './weather.controller';
import { WeatherRepository } from './weather.repository';
import { WeatherService } from './weather.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WeatherSnapshot.name, schema: WeatherSnapshotSchema },
    ]),
  ],
  controllers: [WeatherController],
  providers: [ConfigService, WeatherService, WeatherRepository],
})
export class WeatherModule {}
