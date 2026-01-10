import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Effect } from 'effect';
import { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';
import { UserError } from './user.error';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  readonly USER_CRITICAL_DETAIL = '+email +password +roles';

  create(user: Omit<User, '_id' | 'status'>): Effect.Effect<User, UserError> {
    return Effect.tryPromise({
      try: async () => {
        const created = await this.userModel.create(user);
        return { ...created.toObject(), roles: user.roles };
      },
      catch: (error) =>
        new UserError({
          code: 'DATABASE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
    });
  }

  findAll(
    page: number,
    limit: number,
  ): Effect.Effect<{ data: User[]; total: number }, UserError> {
    const skip = (page - 1) * limit;

    const allPromisesEffect = Effect.all(
      [
        Effect.tryPromise({
          try: () =>
            this.userModel
              .find({ status: true })
              .skip(skip)
              .limit(limit)
              .lean()
              .exec(),
          catch: (error) =>
            new UserError({
              code: 'DATABASE_ERROR',
              message: String(error),
            }),
        }),
        Effect.tryPromise({
          try: () => this.userModel.countDocuments({ status: true }).exec(),
          catch: (error) =>
            new UserError({
              code: 'DATABASE_ERROR',
              message: error instanceof Error ? error.message : 'Unknown error',
            }),
        }),
      ],
      { concurrency: 2 },
    );

    return allPromisesEffect.pipe(
      Effect.map(([data, total]) => ({ data, total })),
    );
  }

  findById(id: Types.ObjectId): Effect.Effect<User | null, UserError> {
    return Effect.tryPromise({
      try: () =>
        this.userModel
          .findOne({ _id: id, status: true })
          .select(this.USER_CRITICAL_DETAIL)
          .populate({
            path: 'roles',
            match: { status: true },
          })
          .lean()
          .exec(),
      catch: (error) =>
        new UserError({
          code: 'DATABASE_ERROR',
          message: String(error),
        }),
    });
  }

  findByEmail(email: string): Effect.Effect<User | null, UserError> {
    return Effect.tryPromise({
      try: () =>
        this.userModel
          .findOne({ email, status: true })
          .select(this.USER_CRITICAL_DETAIL)
          .populate({
            path: 'roles',
            match: { status: true },
          })
          .lean()
          .exec(),
      catch: (error) =>
        new UserError({
          code: 'DATABASE_ERROR',
          message: String(error),
        }),
    });
  }

  findPrivateProfile(
    id: Types.ObjectId,
  ): Effect.Effect<User | null, UserError> {
    return Effect.tryPromise({
      try: () =>
        this.userModel
          .findOne({ _id: id, status: true })
          .select('+email')
          .populate({
            path: 'roles',
            match: { status: true },
            select: { code: 1 },
          })
          .lean()
          .exec(),
      catch: (error) =>
        new UserError({
          code: 'DATABASE_ERROR',
          message: String(error),
        }),
    });
  }

  updateInfo(user: Partial<User>): Effect.Effect<User | null, UserError> {
    return Effect.tryPromise({
      try: () =>
        this.userModel
          .findByIdAndUpdate(
            { _id: user._id, status: true },
            { $set: user },
            { new: true },
          )
          .select('+email')
          .populate({
            path: 'roles',
            match: { status: true },
            select: { code: 1 },
          })
          .lean()
          .exec(),
      catch: (error) =>
        new UserError({
          code: 'DATABASE_ERROR',
          message: String(error),
        }),
    });
  }

  delete(user: User): Effect.Effect<User | null, UserError> {
    return Effect.tryPromise({
      try: () => this.userModel.findByIdAndDelete(user._id).lean().exec(),
      catch: (error) =>
        new UserError({
          code: 'DATABASE_ERROR',
          message: String(error),
        }),
    });
  }

  deactivate(id: Types.ObjectId): Effect.Effect<User | null, UserError> {
    return Effect.tryPromise({
      try: () =>
        this.userModel
          .findByIdAndUpdate({ _id: id }, { status: false })
          .lean()
          .exec(),
      catch: (error) =>
        new UserError({
          code: 'DATABASE_ERROR',
          message: String(error),
        }),
    });
  }
}
