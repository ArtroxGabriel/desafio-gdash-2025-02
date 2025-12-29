import { Public, VerifyApiKey } from '@auth/decorators/public.decorator';
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
  ) {
    return this.weatherService.create(weatherDto);
  }

  @Get()
  @SearchQuery()
  @ApiPaginatedResponse(
    WeatherSnapshotResponseDto,
    'Retrieved weather snapshots successfully',
  )
  @Public()
  async findAll(@Query() search: SearchParams) {
    return this.weatherService.findAll(search.page, search.limit);
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Retrieved weather snapshot successfully',
    schema: { $ref: getSchemaPath(WeatherSnapshotResponseDto) },
  })
  @ApiNotFoundResponse({ description: 'Snapshot not found' })
  @Public()
  async findOne(@Param('id', MongoIdTransformer) id: Types.ObjectId) {
    return await this.weatherService.findOne(id);
  }

  @Delete(':id')
  @ApiOkResponse({
    description: 'snapshot deleted successfully',
    schema: { type: 'string' },
  })
  @ApiNotFoundResponse({ description: 'Snapshot not found' })
  @Public()
  async remove(@Param('id', MongoIdTransformer) id: Types.ObjectId) {
    return this.weatherService.remove(id);
  }
}
