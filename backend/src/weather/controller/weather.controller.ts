import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { CreateWeatherDTO } from '../dto/create-weather-snapshot.dto';
import { WeatherService } from '../service/weather.service';
import { ApiNotFoundResponse } from '@nestjs/swagger';
import { MongoIdTransformer } from '../../common/mongoid.transformer';
import { Types } from 'mongoose';

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
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.weatherService.findAll(page, limit);
  }

  @Get(':id')
  @ApiNotFoundResponse({ description: 'Snapshot not found' })
  async findOne(@Param('id', MongoIdTransformer) id: Types.ObjectId) {
    const snapshot = await this.weatherService.findOne(id);
    if (!snapshot) {
      return new NotFoundException('Snapshot not found');
    }
    return snapshot;
  }

  @Delete(':id')
  @ApiNotFoundResponse({ description: 'Snapshot not found' })
  async remove(@Param('id', MongoIdTransformer) id: Types.ObjectId) {
    return this.weatherService.remove(id);
  }
}
