import { Types } from 'mongoose';
import { WeatherSnapshotDto } from './create-weather-snapshot.dto';

export class WeatherSnapshotResponseDto {
  public readonly id: Types.ObjectId;

  public readonly time: Date;

  public readonly interval: number;

  public readonly temperature_2m: number;

  public readonly is_day: boolean;

  public readonly relative_humidity_2m: number;

  public readonly apparent_temperature: number;

  public readonly weather_code: number;

  public readonly precipitation: number;

  public readonly wind_speed_10m: number;

  public readonly wind_direction_10m: number;

  public readonly wind_gusts_10m: number;

  constructor(partial: WeatherSnapshotDto & { _id: Types.ObjectId }) {
    this.id = partial._id;
    this.time = partial.time;
    this.interval = partial.interval;
    this.temperature_2m = partial.temperature_2m;
    this.is_day = partial.is_day;
    this.relative_humidity_2m = partial.relative_humidity_2m;
    this.apparent_temperature = partial.apparent_temperature;
    this.weather_code = partial.weather_code;
    this.precipitation = partial.precipitation;
    this.wind_speed_10m = partial.wind_speed_10m;
    this.wind_direction_10m = partial.wind_direction_10m;
    this.wind_gusts_10m = partial.wind_gusts_10m;
  }
}
