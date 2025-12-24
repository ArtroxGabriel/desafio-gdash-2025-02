import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export class SearchParams {
  @IsInt()
  page: number = 1;

  @IsInt()
  limit: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(SortDirection)
  sortDir?: SortDirection;
}
