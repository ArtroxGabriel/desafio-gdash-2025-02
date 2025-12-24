import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsDefined,
  IsInt,
  IsNumber,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class WeatherSnapshotDto {
  @IsDate({ message: 'Invalid date format' })
  @Type(() => Date)
  @ApiProperty({ example: '2025-12-24T09:45' })
  public readonly time: Date;

  @IsNumber()
  @ApiProperty({ example: 900 })
  public readonly interval: number;

  @IsNumber()
  @ApiProperty({ example: 30.5 })
  public readonly temperature_2m: number;

  @ApiProperty({
    example: 1,
    description: '1 for day, 0 for night',
    type: Number,
  })
  @Transform(({ value }) => Boolean(value))
  @IsBoolean()
  public readonly is_day: boolean;

  @IsNumber()
  @ApiProperty({ example: 52 })
  public readonly relative_humidity_2m: number;

  @IsNumber()
  @ApiProperty({ example: 32.2 })
  public readonly apparent_temperature: number;

  @IsInt()
  @ApiProperty({ example: 2 })
  public readonly weather_code: number;

  @IsNumber()
  @ApiProperty({ example: 0 })
  public readonly precipitation: number;

  @IsNumber()
  @ApiProperty({ example: 21.1 })
  public readonly wind_speed_10m: number;

  @IsNumber()
  @Min(0, { message: 'Wind direction must greater than 0' })
  @Max(360, { message: 'Wind direction must lower than 360' })
  @ApiProperty({ example: 123 })
  public readonly wind_direction_10m: number;

  @IsNumber()
  @ApiProperty({ example: 43.6 })
  public readonly wind_gusts_10m: number;

  constructor(partial: Partial<WeatherSnapshotDto>) {
    Object.assign(this, partial);
  }
}

export class CreateWeatherDTO {
  @IsNumber()
  @ApiProperty({ example: 52.52 })
  public readonly latitude: number;

  @IsNumber()
  @ApiProperty({ example: 13.405 })
  public readonly longitude: number;

  @IsDefined()
  @ValidateNested()
  @Type(() => WeatherSnapshotDto)
  @ApiProperty({ type: WeatherSnapshotDto })
  public readonly current: WeatherSnapshotDto;

  constructor(partial: Partial<CreateWeatherDTO>) {
    Object.assign(this, partial);
  }
}
