import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { WeatherSnapshot } from '@weather/schemas/weather.schema';
import { HydratedDocument, Types } from 'mongoose';

export type InsightDocument = HydratedDocument<Insight>;

@Schema({
  collection: 'insights',
  versionKey: false,
  timestamps: true,
})
export class Insight {
  readonly _id!: Types.ObjectId;

  @Prop({ required: true })
  content!: string;

  @Prop({ required: true, type: Types.ObjectId, ref: WeatherSnapshot.name })
  weatherSnapshotId!: Types.ObjectId;

  @Prop({ required: true })
  model!: string;

  @Prop({ required: true })
  promptTokens!: number;

  @Prop({ required: true })
  completionTokens!: number;

  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export const InsightSchema = SchemaFactory.createForClass(Insight);

InsightSchema.index({ weatherSnapshotId: 1 });
InsightSchema.index({ createdAt: -1 });
