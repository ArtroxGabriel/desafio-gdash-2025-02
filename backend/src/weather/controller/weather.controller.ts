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
import { ApiNotFoundResponse } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { SearchParams } from 'src/core/http/query/query';
import { SearchQuery } from 'src/core/http/query/query.decorator';
import { MongoIdTransformer } from '../../common/mongoid.transformer';
import { CreateWeatherDTO } from '../dto/create-weather-snapshot.dto';
import { WeatherService } from '../service/weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post()
  async createSnapshot(
    @Body(new ValidationPipe()) weatherDto: CreateWeatherDTO,
  ) {
    return this.weatherService.create(weatherDto);
  }

  @Get()
  @SearchQuery()
  async findAll(@Query() search: SearchParams) {
    return this.weatherService.findAll(search.page, search.limit);
  }

  @Get(':id')
  @ApiNotFoundResponse({ description: 'Snapshot not found' })
  async findOne(@Param('id', MongoIdTransformer) id: Types.ObjectId) {
    return await this.weatherService.findOne(id);
  }

  @Delete(':id')
  @ApiNotFoundResponse({ description: 'Snapshot not found' })
  async remove(@Param('id', MongoIdTransformer) id: Types.ObjectId) {
    return this.weatherService.remove(id);
  }
}
