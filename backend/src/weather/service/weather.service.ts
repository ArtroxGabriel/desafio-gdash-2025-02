import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateWeatherDTO } from '../dto/create-weather-snapshot.dto';
import { WeatherRepository } from '../repository/weather.repository';
import { Types } from 'mongoose';
import { WeatherSnapshotResponseDto } from '../dto/weather-response.dto';
import { PaginationResponse, StatusCode } from 'src/core/http/response';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(private weatherRepository: WeatherRepository) {}

  async create(createWeatherDto: CreateWeatherDTO) {
    this.logger.log('Creating new weather snapshot');

    const result = await this.weatherRepository.create(createWeatherDto);

    this.logger.log('Weather snapshot created successfully');
    return new WeatherSnapshotResponseDto(result);
  }

  async findAll(page: number, limit: number) {
    this.logger.debug(
      `Fetching weather snapshots page: ${page}, limit: ${limit}`,
    );

    const { data, total } = await this.weatherRepository.findAll(page, limit);

    this.logger.log(`${data.length} fetched successfully`);

    return new PaginationResponse(
      StatusCode.SUCCESS,
      'Fetched successfully',
      data.map((snapshot) => new WeatherSnapshotResponseDto(snapshot)),
      total,
      page,
      limit,
    );
  }

  async findOne(id: Types.ObjectId) {
    this.logger.debug(`Fetching weather snapshot with id: ${id.toString()}`);

    const snapshot = await this.weatherRepository.findOne(id);
    if (!snapshot) {
      this.logger.warn(`Weather snapshot with id: ${id.toString()} not found`);
      throw new NotFoundException('weather snapshot not found');
    }

    this.logger.log(
      `Weather snapshot with id: ${id.toString()} fetched successfully`,
    );
    return new WeatherSnapshotResponseDto(snapshot);
  }

  async remove(id: Types.ObjectId) {
    this.logger.debug(`Removing weather snapshot with id: ${id.toString()}`);

    const removed = await this.weatherRepository.remove(id);
    if (!removed) {
      this.logger.warn(`Weather snapshot with id: ${id.toString()} not found`);
      throw new NotFoundException('weather snapshot not found');
    }

    this.logger.log(
      `Weather snapshot with id: ${id.toString()} removed successfully`,
    );
    return { message: 'Snapshot removed' };
  }
}
