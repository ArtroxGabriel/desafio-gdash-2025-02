import { Module } from '@nestjs/common';
import { WeatherService } from './service/weather.service';
import { WeatherController } from './controller/weather.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WeatherSnapshot,
  WeatherSnapshotSchema,
} from './schemas/weather.schema';
import { WeatherRepository } from './repository/weather.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WeatherSnapshot.name, schema: WeatherSnapshotSchema },
    ]),
  ],
  controllers: [WeatherController],
  providers: [WeatherService, WeatherRepository],
})
export class WeatherModule {}
