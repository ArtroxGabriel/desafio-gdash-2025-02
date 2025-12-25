import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateWeatherDTO } from '../dto/create-weather-snapshot.dto';
import { WeatherRepository } from '../repository/weather.repository';
import { Types } from 'mongoose';
import { WeatherSnapshotResponseDto } from '../dto/weather-response.dto';
import { PaginationResponseDTO, StatusCode } from 'src/core/http/response';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(private weatherRepository: WeatherRepository) {}

  async create(createWeatherDto: CreateWeatherDTO): Promise<string> {
    this.logger.log('Creating new weather snapshot');

    const result = await this.weatherRepository.create(createWeatherDto);
    if (!result) {
      this.logger.error('Failed to create weather snapshot');
      throw new Error('Failed to create weather snapshot');
    }

    this.logger.log('Weather snapshot created successfully');
    return 'Snapshot created';
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<PaginationResponseDTO<WeatherSnapshotResponseDto>> {
    this.logger.debug(
      `Fetching weather snapshots page: ${page}, limit: ${limit}`,
    );

    const { data, total } = await this.weatherRepository.findAll(page, limit);

    const paginationData = data.map(
      (snapshot) => new WeatherSnapshotResponseDto(snapshot),
    );

    this.logger.log(`${data.length} fetched successfully`);
    return new PaginationResponseDTO(
      StatusCode.SUCCESS,
      'Fetched successfully',
      paginationData,
      total,
      page,
      limit,
    );
  }

  async findOne(id: Types.ObjectId): Promise<WeatherSnapshotResponseDto> {
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

  async remove(id: Types.ObjectId): Promise<string> {
    this.logger.debug(`Removing weather snapshot with id: ${id.toString()}`);

    const removed = await this.weatherRepository.remove(id);
    if (!removed) {
      this.logger.warn(`Weather snapshot with id: ${id.toString()} not found`);
      throw new NotFoundException('weather snapshot not found');
    }

    this.logger.log(
      `Weather snapshot with id: ${id.toString()} removed successfully`,
    );
    return 'Snapshot removed';
  }
}
