import { Public, VerifyApiKey } from '@auth/decorators/public.decorator';
import { runNest } from '@common/effect-util';
import { PaginationResponseDTO, StatusCode } from '@core/http/response';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { Effect } from 'effect';
import { Types } from 'mongoose';
import { MongoIdTransformer } from 'src/common/mongoid.transformer';
import { SearchParams } from 'src/core/http/query/query';
import {
  ApiPaginatedResponse,
  SearchQuery,
} from 'src/core/http/query/query.decorator';
import { CreateWeatherDTO } from './dto/create-weather-snapshot.dto';
import { WeatherSnapshotResponseDto } from './dto/weather-response.dto';
import { mapToHttpException } from './weather.error';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @VerifyApiKey()
  @Post()
  @ApiOkResponse({
    description: 'snapshot created successfully',
    schema: { type: 'string' },
  })
  async createSnapshot(
    @Body(new ValidationPipe()) weatherDto: CreateWeatherDTO,
  ): Promise<string> {
    const program = this.weatherService.create(weatherDto);
    return runNest(program, mapToHttpException);
  }

  @Public()
  @Get()
  @SearchQuery()
  @ApiPaginatedResponse(
    WeatherSnapshotResponseDto,
    'Retrieved weather snapshots successfully',
  )
  async findAll(
    @Query() search: SearchParams,
  ): Promise<PaginationResponseDTO<WeatherSnapshotResponseDto>> {
    const serviceEffect = this.weatherService.findAll(
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

  @Public()
  @Get(':id')
  @ApiOkResponse({
    description: 'Retrieved weather snapshot successfully',
    schema: { $ref: getSchemaPath(WeatherSnapshotResponseDto) },
  })
  @ApiNotFoundResponse({ description: 'Snapshot not found' })
  async findOne(
    @Param('id', MongoIdTransformer) id: Types.ObjectId,
  ): Promise<WeatherSnapshotResponseDto> {
    const program = this.weatherService.findOne(id);
    return runNest(program, mapToHttpException);
  }

  @Public()
  @Delete(':id')
  @ApiOkResponse({
    description: 'snapshot deleted successfully',
    schema: { type: 'string' },
  })
  @ApiNotFoundResponse({ description: 'Snapshot not found' })
  async remove(
    @Param('id', MongoIdTransformer) id: Types.ObjectId,
  ): Promise<string> {
    const removeEffect = this.weatherService.remove(id);

    const program = removeEffect.pipe(
      Effect.map(() => 'Snapshot deleted successfully'),
    );

    return runNest(program, mapToHttpException);
  }
}
