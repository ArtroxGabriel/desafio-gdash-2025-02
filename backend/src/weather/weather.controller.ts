import { Public, VerifyApiKey } from '@auth/decorators/public.decorator';
import { isFail } from '@common/result';
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
    const result = await this.weatherService.create(weatherDto);
    if (isFail(result)) {
      throw mapToHttpException(result.error);
    }

    return result.value;
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
    const result = await this.weatherService.findAll(search.page, search.limit);
    if (isFail(result)) {
      throw mapToHttpException(result.error);
    }

    const { data: paginationData, total } = result.value;

    return new PaginationResponseDTO(
      StatusCode.SUCCESS,
      'Fetched successfully',
      paginationData,
      total,
      search.page,
      search.limit,
    );
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
    const result = await this.weatherService.findOne(id);
    if (isFail(result)) {
      throw mapToHttpException(result.error);
    }

    return result.value;
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
    const result = await this.weatherService.remove(id);
    if (isFail(result)) {
      throw mapToHttpException(result.error);
    }

    return 'Snapshot removed';
  }
}
