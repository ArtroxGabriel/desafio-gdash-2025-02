import { runNest } from '@common/effect-util';
import { PaginationResponseDTO, StatusCode } from '@core/http/response';
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  ApiTooManyRequestsResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Effect } from 'effect';
import {
  ApiPaginatedResponse,
  SearchQuery,
} from 'src/core/http/query/query.decorator';
import { SearchParams } from 'src/core/http/query/query';
import { CreateInsightDto } from './dto/create-insight.dto';
import { InsightResponseDto } from './dto/insight-response.dto';
import { mapToHttpException } from './insights.error';
import { InsightsService } from './insights.service';

@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Post('generate')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOkResponse({
    description: 'AI insight generated successfully',
    schema: { $ref: getSchemaPath(InsightResponseDto) },
  })
  @ApiTooManyRequestsResponse({ description: 'Rate limit exceeded' })
  @ApiServiceUnavailableResponse({ description: 'AI service unavailable' })
  async generate(
    @Body(new ValidationPipe()) dto: CreateInsightDto,
  ): Promise<InsightResponseDto> {
    const program = this.insightsService.generate(dto.weatherSnapshotId);
    return runNest(program, mapToHttpException);
  }

  @Get()
  @SearchQuery()
  @ApiPaginatedResponse(InsightResponseDto, 'Retrieved insights successfully')
  async findAll(
    @Query() search: SearchParams,
  ): Promise<PaginationResponseDTO<InsightResponseDto>> {
    const serviceEffect = this.insightsService.findAll(
      search.page,
      search.limit,
    );

    const program = serviceEffect.pipe(
      Effect.map(
        ({ data, total }) =>
          new PaginationResponseDTO(
            StatusCode.SUCCESS,
            'Fetched successfully',
            data,
            total,
            search.page,
            search.limit,
          ),
      ),
    );

    return runNest(program, mapToHttpException);
  }
}
