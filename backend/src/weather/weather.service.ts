import { fail, Result, success } from '@common/result';
import { Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateWeatherDTO } from './dto/create-weather-snapshot.dto';
import { WeatherSnapshotResponseDto } from './dto/weather-response.dto';
import { WeatherError } from './weather.error';
import { WeatherRepository } from './weather.repository';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(private weatherRepository: WeatherRepository) {}

  async create(
    createWeatherDto: CreateWeatherDTO,
  ): Result<string, WeatherError> {
    this.logger.log('Creating new weather snapshot');

    const result = await this.weatherRepository.create(
      createWeatherDto.current,
    );
    if (!result) {
      this.logger.error('Failed to create weather snapshot');
      return fail(WeatherError.INTERNAL_SERVER_ERROR);
    }

    this.logger.log('Weather snapshot created successfully');
    return success('Snapshot created');
  }

  async findAll(
    page: number,
    limit: number,
  ): Result<
    { data: WeatherSnapshotResponseDto[]; total: number },
    WeatherError
  > {
    this.logger.debug(
      `Fetching weather snapshots page: ${page}, limit: ${limit}`,
    );

    const { data, total } = await this.weatherRepository.findAll(page, limit);

    const paginationData = data.map(
      (snapshot) => new WeatherSnapshotResponseDto(snapshot),
    );

    this.logger.log(`${data.length} fetched successfully`);
    return success({ data: paginationData, total });
  }

  async findOne(
    id: Types.ObjectId,
  ): Result<WeatherSnapshotResponseDto, WeatherError> {
    this.logger.debug(`Fetching weather snapshot with id: ${id.toString()}`);

    const snapshot = await this.weatherRepository.findOne(id);
    if (snapshot === null) {
      this.logger.warn(`Weather snapshot with id: ${id.toString()} not found`);
      return fail(WeatherError.NOT_FOUND);
    }

    this.logger.log(
      `Weather snapshot with id: ${id.toString()} fetched successfully`,
    );
    return success(new WeatherSnapshotResponseDto(snapshot));
  }

  async remove(id: Types.ObjectId): Result<unknown, WeatherError> {
    this.logger.debug(`Removing weather snapshot with id: ${id.toString()}`);

    const removed = await this.weatherRepository.remove(id);
    if (removed === null) {
      this.logger.warn(`Weather snapshot with id: ${id.toString()} not found`);
      return fail(WeatherError.NOT_FOUND);
    }

    this.logger.log(
      `Weather snapshot with id: ${id.toString()} removed successfully`,
    );
    return success(null);
  }
}
