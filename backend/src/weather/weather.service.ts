import { Injectable, Logger } from '@nestjs/common';
import { Effect } from 'effect';
import { Types } from 'mongoose';
import { CreateWeatherDTO } from './dto/create-weather-snapshot.dto';
import { WeatherSnapshotResponseDto } from './dto/weather-response.dto';
import { WeatherError } from './weather.error';
import { WeatherRepository } from './weather.repository';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(private weatherRepository: WeatherRepository) {}

  create(
    createWeatherDto: CreateWeatherDTO,
  ): Effect.Effect<string, WeatherError> {
    return Effect.gen(this, function* () {
      this.logger.debug('Trying to create weather snapshot');

      yield* this.weatherRepository.create(createWeatherDto.current).pipe(
        Effect.tapError((err) => {
          this.logger.error(`Weather snapshot creation failed: ${err.message}`);
          return new WeatherError({ code: 'DATABASE_ERROR' });
        }),
      );

      this.logger.log('Weather snapshot created successfully');
      return 'Snapshot created';
    });
  }

  findAll(
    page: number,
    limit: number,
  ): Effect.Effect<
    { data: WeatherSnapshotResponseDto[]; total: number },
    WeatherError
  > {
    return Effect.gen(this, function* () {
      this.logger.debug(
        `Trying to fetch weather snapshots page: ${page}, limit: ${limit}`,
      );

      const { data, total } = yield* this.weatherRepository
        .findAll(page, limit)
        .pipe(
          Effect.tapError((err) => {
            this.logger.error(
              `Fetching weather snapshots failed: ${err.message}`,
            );
            return new WeatherError({ code: 'DATABASE_ERROR' });
          }),
        );

      const dataDto = data.map(
        (snapshot) => new WeatherSnapshotResponseDto(snapshot),
      );

      this.logger.log(`${data.length} fetched successfully`);
      return { data: dataDto, total };
    });
  }

  findOne(
    id: Types.ObjectId,
  ): Effect.Effect<WeatherSnapshotResponseDto, WeatherError> {
    return Effect.gen(this, function* () {
      this.logger.debug(
        `Trying to fetch weather snapshot with id: ${id.toString()}`,
      );

      const snapshot = yield* this.weatherRepository.findOne(id).pipe(
        Effect.tapError((err) => {
          this.logger.error(`Fetching weather snapshot failed: ${err.message}`);
          return new WeatherError({ code: 'DATABASE_ERROR' });
        }),
      );

      if (snapshot === null) {
        this.logger.warn(
          `Weather snapshot not found with id: ${id.toString()}`,
        );
        return yield* new WeatherError({ code: 'NOT_FOUND' });
      }

      const snapshotDto = new WeatherSnapshotResponseDto(snapshot);
      this.logger.log(
        `Weather snapshot with id: ${id.toString()} fetched successfully`,
      );

      return snapshotDto;
    });
  }

  remove(id: Types.ObjectId): Effect.Effect<void, WeatherError> {
    return Effect.gen(this, function* () {
      this.logger.debug(
        `Trying to remove weather snapshot with id: ${id.toString()}`,
      );

      const removed = yield* this.weatherRepository.remove(id).pipe(
        Effect.tapError((err) => {
          this.logger.error(`Removing weather snapshot failed: ${err.message}`);
          return new WeatherError({ code: 'DATABASE_ERROR' });
        }),
      );

      if (removed === null) {
        this.logger.warn(
          `Weather snapshot not found with id: ${id.toString()}`,
        );
        return yield* new WeatherError({ code: 'NOT_FOUND' });
      }

      this.logger.log(
        `Weather snapshot with id: ${id.toString()} removed successfully`,
      );
    });
  }
}
