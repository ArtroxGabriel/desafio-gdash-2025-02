import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export class SearchParams {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page!: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit!: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(SortDirection)
  sortDir?: SortDirection;
}
