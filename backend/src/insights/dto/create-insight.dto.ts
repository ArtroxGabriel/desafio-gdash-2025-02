import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateInsightDto {
  @IsNotEmpty({ message: 'weatherSnapshotId is required' })
  @IsMongoId({ message: 'weatherSnapshotId must be a valid MongoDB ObjectId' })
  @ApiProperty({
    description: 'The ID of the weather snapshot to generate insights for',
    example: '507f1f77bcf86cd799439011',
  })
  public readonly weatherSnapshotId!: string;
}
