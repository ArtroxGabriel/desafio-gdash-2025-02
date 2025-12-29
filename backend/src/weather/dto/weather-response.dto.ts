import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsNumber } from 'class-validator';
import { Types } from 'mongoose';
import { IsMongoIdObject } from 'src/common/mongoid.validation';
import { WeatherSnapshotDto } from './create-weather-snapshot.dto';
import { Type } from 'class-transformer';

export class WeatherSnapshotResponseDto {
  @IsMongoIdObject()
  @Type(() => String)
  @ApiProperty({ description: 'Unique identifier', type: String })
  public readonly id: Types.ObjectId;

  @IsDate()
  @ApiProperty()
  public readonly time: Date;

  @IsNumber()
  @ApiProperty()
  public readonly interval: number;

  @IsNumber()
  @ApiProperty()
  public readonly temperature_2m: number;

  @IsBoolean()
  @ApiProperty()
  public readonly is_day: boolean;

  @IsNumber()
  @ApiProperty()
  public readonly relative_humidity_2m: number;

  @IsNumber()
  @ApiProperty()
  public readonly apparent_temperature: number;

  @IsNumber()
  @ApiProperty()
  public readonly weather_code: number;

  @IsNumber()
  @ApiProperty()
  public readonly precipitation: number;

  @IsNumber()
  @ApiProperty()
  public readonly wind_speed_10m: number;

  @IsNumber()
  @ApiProperty()
  public readonly wind_direction_10m: number;

  @IsNumber()
  @ApiProperty()
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
