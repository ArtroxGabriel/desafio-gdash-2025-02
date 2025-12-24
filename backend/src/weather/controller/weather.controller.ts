import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
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
    const created = await this.weatherService.create(weatherDto);
    return created;
  }

  @Get()
  async findAll() {}

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
