import { Injectable, Logger } from '@nestjs/common';
import { Effect, pipe } from 'effect';
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
    return pipe(
      Effect.sync(() => this.logger.debug('Trying to create weather snapshot')),

      Effect.flatMap(() =>
        this.weatherRepository.create(createWeatherDto.current),
      ),

      Effect.flatMap((result) =>
        result
          ? Effect.succeed('Snapshot created')
          : Effect.fail(new WeatherError({ code: 'INTERNAL_SERVER_ERROR' })),
      ),

      Effect.tap(() => Effect.log('Weather snapshot created successfully')),
      Effect.tapError((err) =>
        Effect.sync(() =>
          this.logger.error(`Weather Flow Failed: ${err.code}`),
        ),
      ),
    );
  }

  findAll(
    page: number,
    limit: number,
  ): Effect.Effect<
    { data: WeatherSnapshotResponseDto[]; total: number },
    WeatherError
  > {
    return pipe(
      Effect.sync(() =>
        this.logger.debug(
          `Trying to fetch weather snapshots page: ${page}, limit: ${limit}`,
        ),
      ),
      Effect.flatMap(() => this.weatherRepository.findAll(page, limit)),
      Effect.map((rawResult) => ({
        data: rawResult.data.map(
          (snapshot) => new WeatherSnapshotResponseDto(snapshot),
        ),
        total: rawResult.total,
      })),
      Effect.tap((result) =>
        this.logger.log(`${result.data.length} fetched successfully`),
      ),
    );
  }

  findOne(
    id: Types.ObjectId,
  ): Effect.Effect<WeatherSnapshotResponseDto, WeatherError> {
    return pipe(
      Effect.sync(() =>
        this.logger.debug(
          `Trying to fecth weather snapshot with id: ${id.toString()}`,
        ),
      ),

      Effect.flatMap(() => this.weatherRepository.findOne(id)),
      Effect.flatMap((snapshot) =>
        snapshot === null
          ? Effect.fail(new WeatherError({ code: 'NOT_FOUND' }))
          : Effect.succeed(snapshot),
      ),

      Effect.map((snapshot) => new WeatherSnapshotResponseDto(snapshot)),
      Effect.tap(() =>
        Effect.sync(() =>
          this.logger.log(
            `Weather snapshot with id: ${id.toString()} fetched successfully`,
          ),
        ),
      ),

      Effect.tapError((err) =>
        Effect.sync(() =>
          this.logger.error(`Weather Flow Failed: ${err.code}`),
        ),
      ),
    );
  }

  remove(id: Types.ObjectId): Effect.Effect<void, WeatherError> {
    return pipe(
      Effect.sync(() =>
        this.logger.debug(
          `Trying to remove weather snapshot with id: ${id.toString()}`,
        ),
      ),

      Effect.flatMap(() => this.weatherRepository.remove(id)),
      Effect.flatMap((removed) =>
        removed === null
          ? pipe(
              Effect.sync(() =>
                this.logger.warn(
                  `Weather snapshot with id: ${id.toString()} not found`,
                ),
              ),
              Effect.flatMap(() =>
                Effect.fail(new WeatherError({ code: 'NOT_FOUND' })),
              ),
            )
          : Effect.void,
      ),

      Effect.tap(() =>
        Effect.sync(() =>
          this.logger.log(
            `Weather snapshot with id: ${id.toString()} removed successfully`,
          ),
        ),
      ),
    );
  }
}
