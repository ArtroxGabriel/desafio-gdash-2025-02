import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { SortDirection } from './query';

export function SearchQuery() {
  return applyDecorators(
    ApiQuery({ name: 'page', type: Number, default: 1 }),
    ApiQuery({ name: 'limit', type: Number, default: 10 }),
    ApiQuery({ name: 'sortBy', required: false, type: String }),
    ApiQuery({ name: 'sortDir', required: false, enum: SortDirection }),
  );
}
