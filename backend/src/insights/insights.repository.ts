import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Effect, pipe } from 'effect';
import { Model, Types } from 'mongoose';
import { Insight } from './schemas/insight.schema';
import { InsightsError } from './insights.error';

@Injectable()
export class InsightsRepository {
  constructor(
    @InjectModel(Insight.name)
    private readonly insightModel: Model<Insight>,
  ) {}

  create(
    insightToCreate: Omit<Insight, '_id' | 'createdAt' | 'updatedAt'>,
  ): Effect.Effect<Insight, InsightsError> {
    return Effect.tryPromise({
      try: async () => {
        const created = await this.insightModel.create(insightToCreate);
        return created.toObject();
      },
      catch: (error) =>
        new InsightsError({
          code: 'DATABASE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
    });
  }

  findAll(
    page: number,
    limit: number,
  ): Effect.Effect<{ data: Insight[]; total: number }, InsightsError> {
    const skip = (page - 1) * limit;

    const allPromisesEffect = Effect.all(
      [
        Effect.tryPromise({
          try: () =>
            this.insightModel
              .find()
              .sort({ createdAt: -1 })
              .skip(skip)
              .limit(limit)
              .lean()
              .exec(),
          catch: (error) =>
            new InsightsError({
              code: 'DATABASE_ERROR',
              message: String(error),
            }),
        }),
        Effect.tryPromise({
          try: () => this.insightModel.countDocuments().exec(),
          catch: (error) =>
            new InsightsError({
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

  findBySnapshotId(
    snapshotId: Types.ObjectId,
  ): Effect.Effect<Insight[], InsightsError> {
    return Effect.tryPromise({
      try: () =>
        this.insightModel
          .find({ weatherSnapshotId: snapshotId })
          .sort({ createdAt: -1 })
          .lean()
          .exec(),
      catch: (error) =>
        new InsightsError({
          code: 'DATABASE_ERROR',
          message: String(error),
        }),
    });
  }
}
