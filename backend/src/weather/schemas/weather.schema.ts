import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type WeatherSnapshotDocument = HydratedDocument<WeatherSnapshot>;

@Schema({
  collection: 'weather_snapshots',
  versionKey: false,
  timestamps: true,
})
export class WeatherSnapshot {
  readonly _id: Types.ObjectId;

  @Prop({ required: true })
  time: Date;

  @Prop({ required: true })
  interval: number;

  @Prop({ required: true })
  temperature_2m: number;

  @Prop({ required: true })
  is_day: boolean;

  @Prop({ required: true })
  relative_humidity_2m: number;

  @Prop({ required: true })
  apparent_temperature: number;

  @Prop({ required: true })
  weather_code: number;

  @Prop({ required: true })
  precipitation: number;

  @Prop({ required: true })
  wind_speed_10m: number;

  @Prop({ required: true })
  wind_direction_10m: number;

  @Prop({ required: true })
  wind_gusts_10m: number;
}

export const WeatherSnapshotSchema =
  SchemaFactory.createForClass(WeatherSnapshot);

WeatherSnapshotSchema.index({ time: 1 });
