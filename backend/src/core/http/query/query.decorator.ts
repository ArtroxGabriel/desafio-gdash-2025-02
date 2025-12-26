import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiQuery,
  getSchemaPath,
} from '@nestjs/swagger';
import { SortDirection } from './query';
import { PaginationResponseDTO } from '../response';

export const SearchQuery = () =>
  applyDecorators(
    ApiQuery({ name: 'page', type: Number, default: 1 }),
    ApiQuery({ name: 'limit', type: Number, default: 10 }),
    ApiQuery({ name: 'sortBy', required: false, type: String }),
    ApiQuery({ name: 'sortDir', required: false, enum: SortDirection }),
  );

export const ApiPaginatedResponse = <TModel extends Type<unknown>>(
  model: TModel,
  description = 'Paginated response',
) =>
  applyDecorators(
    ApiExtraModels(PaginationResponseDTO, model),
    ApiOkResponse({
      description: description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginationResponseDTO) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
