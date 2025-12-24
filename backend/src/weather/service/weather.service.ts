import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateWeatherDTO } from '../dto/create-weather-snapshot.dto';
import { WeatherRepository } from '../repository/weather.repository';
import { Types } from 'mongoose';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(private weatherRepository: WeatherRepository) {}

  async create(createWeatherDto: CreateWeatherDTO) {
    this.logger.log('Creating new weather snapshot');

    const result = this.weatherRepository.create(createWeatherDto);

    this.logger.log('Weather snapshot created successfully');
    return result;
  }

  async findAll() {
    this.logger.debug('Fetching all weather snapshots');
    const snapshots = await this.weatherRepository.findAll();

    this.logger.log(`${snapshots.length} fetched successfully`);
    return snapshots;
  }

  async findOne(id: Types.ObjectId) {
    this.logger.debug(`Fetching weather snapshot with id: ${id.toString()}`);

    const snapshot = await this.weatherRepository.findOne(id);
    if (!snapshot) {
      this.logger.warn(`Weather snapshot with id: ${id.toString()} not found`);
      throw new NotFoundException('Snapshot not found');
    }

    this.logger.log(
      `Weather snapshot with id: ${id.toString()} fetched successfully`,
    );
    return snapshot;
  }

  async remove(id: Types.ObjectId) {
    this.logger.debug(`Removing weather snapshot with id: ${id.toString()}`);
    await this.weatherRepository.remove(id);

    this.logger.log(
      `Weather snapshot with id: ${id.toString()} removed successfully`,
    );
    return { message: 'Snapshot removed' };
  }
}
