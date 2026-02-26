import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { IsMongoIdObject } from '@common/mongoid.validation';
import { Insight } from '../schemas/insight.schema';

export class InsightResponseDto {
  @IsMongoIdObject()
  @Type(() => String)
  @ApiProperty({ description: 'Unique identifier', type: String })
  public readonly id: Types.ObjectId;

  @IsString()
  @ApiProperty({ description: 'AI-generated weather insight content' })
  public readonly content: string;

  @Type(() => String)
  @ApiProperty({
    description: 'Weather snapshot this insight is based on',
    type: String,
  })
  public readonly weatherSnapshotId: Types.ObjectId;

  @IsString()
  @ApiProperty({ description: 'AI model used to generate the insight' })
  public readonly model: string;

  @IsNumber()
  @ApiProperty({ description: 'Tokens used in the prompt' })
  public readonly promptTokens: number;

  @IsNumber()
  @ApiProperty({ description: 'Tokens used in the completion' })
  public readonly completionTokens: number;

  @IsDate()
  @ApiProperty({ description: 'When the insight was created' })
  public readonly createdAt: Date;

  constructor(partial: Insight & { createdAt?: Date }) {
    this.id = partial._id;
    this.content = partial.content;
    this.weatherSnapshotId = partial.weatherSnapshotId;
    this.model = partial.model;
    this.promptTokens = partial.promptTokens;
    this.completionTokens = partial.completionTokens;
    this.createdAt = partial.createdAt ?? new Date();
  }
}
