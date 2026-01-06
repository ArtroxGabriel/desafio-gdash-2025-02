import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Effect, pipe } from 'effect';
import { Model, Types } from 'mongoose';
import { WeatherSnapshot } from './schemas/weather.schema';
import { WeatherError } from './weather.error';

@Injectable()
export class WeatherRepository {
  constructor(
    @InjectModel(WeatherSnapshot.name)
    private readonly weatherModel: Model<WeatherSnapshot>,
  ) {}

  create(
    weatherToCreate: Omit<WeatherSnapshot, '_id'>,
  ): Effect.Effect<WeatherSnapshot, WeatherError> {
    return Effect.tryPromise({
      try: async () => {
        const createdWeather = await this.weatherModel.create(weatherToCreate);
        return createdWeather.toObject();
      },
      catch: (error) =>
        new WeatherError({
          code: 'DATABASE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
    });
  }

  findAll(
    page: number,
    limit: number,
  ): Effect.Effect<{ data: WeatherSnapshot[]; total: number }, WeatherError> {
    const skip = (page - 1) * limit;

    const allPromisesEffect = Effect.all(
      [
        Effect.tryPromise({
          try: () =>
            this.weatherModel.find().skip(skip).limit(limit).lean().exec(),
          catch: (error) =>
            new WeatherError({
              code: 'DATABASE_ERROR',
              message: String(error),
            }),
        }),
        Effect.tryPromise({
          try: () => this.weatherModel.countDocuments().exec(),
          catch: (error) =>
            new WeatherError({
              code: 'DATABASE_ERROR',
              message: String(error),
            }),
        }),
      ],
      { concurrency: 2 },
    );

    return pipe(
      allPromisesEffect,
      Effect.map(([data, total]) => ({ data, total })),
    );
  }

  findOne(
    id: Types.ObjectId,
  ): Effect.Effect<WeatherSnapshot | null, WeatherError> {
    return Effect.tryPromise({
      try: () => this.weatherModel.findOne({ _id: id }).lean().exec(),
      catch: (error) =>
        new WeatherError({
          code: 'DATABASE_ERROR',
          message: String(error),
        }),
    });
  }

  remove(
    id: Types.ObjectId,
  ): Effect.Effect<WeatherSnapshot | null, WeatherError> {
    return Effect.tryPromise({
      try: () => this.weatherModel.findByIdAndDelete({ _id: id }).lean().exec(),
      catch: (error) =>
        new WeatherError({
          code: 'DATABASE_ERROR',
          message: String(error),
        }),
    });
  }
}
