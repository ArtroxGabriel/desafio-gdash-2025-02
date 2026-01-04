import { Injectable, Logger } from '@nestjs/common';
import { Effect, pipe } from 'effect';
import { Types } from 'mongoose';
import { UserDto } from './dto/user.dto';
import { User } from './schemas/user.schema';
import { UserError } from './user.error';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly userRepository: UserRepository) {}

  create(
    param: Omit<User, '_id' | 'status'>,
  ): Effect.Effect<UserDto, UserError> {
    return pipe(
      Effect.sync(() => this.logger.log('Creating a new user')),

      Effect.flatMap(() => this.userRepository.create(param)),

      Effect.map((user) => new UserDto(user)),

      Effect.tap((user) =>
        Effect.sync(() =>
          this.logger.log(`User created with ID: ${user.id.toString()}`),
        ),
      ),

      Effect.tapError((err) =>
        Effect.sync(() =>
          this.logger.error(`User creation failed: ${err.code}`),
        ),
      ),
    );
  }

  findAll(
    page: number,
    limit: number,
  ): Effect.Effect<{ data: UserDto[]; total: number }, UserError> {
    return pipe(
      Effect.sync(() =>
        this.logger.debug(`Fetching users page: ${page}, limit: ${limit}`),
      ),

      Effect.flatMap(() => this.userRepository.findAll(page, limit)),

      Effect.map(({ data, total }) => ({
        data: data.map((user) => new UserDto(user)),
        total,
      })),

      Effect.tap((result) =>
        Effect.sync(() =>
          this.logger.log(`${result.data.length} users fetched successfully`),
        ),
      ),
    );
  }

  findById(id: Types.ObjectId): Effect.Effect<UserDto, UserError> {
    return pipe(
      Effect.sync(() =>
        this.logger.log(`Finding user by ID: ${id.toString()}`),
      ),

      Effect.flatMap(() => this.userRepository.findById(id)),

      Effect.flatMap((user) =>
        user === null
          ? Effect.fail(
              new UserError({
                code: 'NOT_FOUND',
                message: 'User not found',
              }),
            )
          : Effect.succeed(user),
      ),

      Effect.map((user) => new UserDto(user)),

      Effect.tap(() =>
        Effect.sync(() =>
          this.logger.log(`User with ID: ${id.toString()} found successfully`),
        ),
      ),

      Effect.tapError((err) =>
        Effect.sync(() => this.logger.error(`User search failed: ${err.code}`)),
      ),
    );
  }

  findByEmail(email: string): Effect.Effect<UserDto, UserError> {
    return pipe(
      Effect.sync(() => this.logger.log(`Finding user by email: ${email}`)),

      Effect.flatMap(() => this.userRepository.findByEmail(email)),

      Effect.flatMap((user) =>
        user === null
          ? Effect.fail(
              new UserError({
                code: 'NOT_FOUND',
                message: 'User not found',
              }),
            )
          : Effect.succeed(user),
      ),

      Effect.map((user) => new UserDto(user)),

      Effect.tap(() =>
        Effect.sync(() =>
          this.logger.log(`User with email: ${email} found successfully`),
        ),
      ),

      Effect.tapError((err) =>
        Effect.sync(() =>
          this.logger.error(`User search by email failed: ${err.code}`),
        ),
      ),
    );
  }

  findPrivateProfile(user: User): Effect.Effect<UserDto, UserError> {
    return pipe(
      Effect.sync(() =>
        this.logger.log(
          `Finding private profile for user with ID ${user._id.toString()}`,
        ),
      ),

      Effect.flatMap(() => this.userRepository.findPrivateProfile(user._id)),

      Effect.flatMap((profile) =>
        profile === null
          ? Effect.fail(
              new UserError({
                code: 'NOT_FOUND',
                message: 'User not found',
              }),
            )
          : Effect.succeed(profile),
      ),

      Effect.map((profile) => new UserDto(profile)),

      Effect.tap(() =>
        Effect.sync(() =>
          this.logger.log(
            `Private profile for user with ID ${user._id.toString()} found successfully`,
          ),
        ),
      ),

      Effect.tapError((err) =>
        Effect.sync(() =>
          this.logger.error(`Private profile search failed: ${err.code}`),
        ),
      ),
    );
  }

  updateProfile(
    userId: Types.ObjectId,
    updateData: Partial<User>,
  ): Effect.Effect<UserDto, UserError> {
    return pipe(
      Effect.sync(() =>
        this.logger.log(
          `Updating profile for user with ID ${userId.toString()}`,
        ),
      ),

      Effect.flatMap(() =>
        this.userRepository.updateInfo({
          ...updateData,
          _id: userId,
        }),
      ),

      Effect.flatMap((updatedUser) =>
        updatedUser === null
          ? Effect.fail(
              new UserError({
                code: 'NOT_FOUND',
                message: 'User not found',
              }),
            )
          : Effect.succeed(updatedUser),
      ),

      Effect.map((user) => new UserDto(user)),

      Effect.tap(() =>
        Effect.sync(() =>
          this.logger.log(
            `Profile updated for user with ID ${userId.toString()}`,
          ),
        ),
      ),

      Effect.tapError((err) =>
        Effect.sync(() =>
          this.logger.error(`Profile update failed: ${err.code}`),
        ),
      ),
    );
  }

  deleteUser(user: User): Effect.Effect<void, UserError> {
    return pipe(
      Effect.sync(() =>
        this.logger.log(`Deleting user with ID ${user._id.toString()}`),
      ),

      Effect.flatMap(() => this.userRepository.delete(user)),

      Effect.flatMap((userDeleted) =>
        userDeleted === null
          ? pipe(
              Effect.sync(() =>
                this.logger.warn(
                  `User not found with ID ${user._id.toString()}`,
                ),
              ),
              Effect.flatMap(() =>
                Effect.fail(
                  new UserError({
                    code: 'NOT_FOUND',
                    message: 'User not found',
                  }),
                ),
              ),
            )
          : Effect.void,
      ),

      Effect.tap(() =>
        Effect.sync(() =>
          this.logger.log(`User with ID ${user._id.toString()} deleted`),
        ),
      ),
    );
  }

  deactivateUser(userId: Types.ObjectId): Effect.Effect<void, UserError> {
    return pipe(
      Effect.sync(() =>
        this.logger.log(`Deactivating user with ID ${userId.toString()}`),
      ),

      Effect.flatMap(() => this.userRepository.deactivate(userId)),

      Effect.flatMap((userDeactivated) =>
        userDeactivated === null
          ? pipe(
              Effect.sync(() =>
                this.logger.warn(`User not found with ID ${userId.toString()}`),
              ),
              Effect.flatMap(() =>
                Effect.fail(
                  new UserError({
                    code: 'NOT_FOUND',
                    message: 'User not found',
                  }),
                ),
              ),
            )
          : Effect.void,
      ),

      Effect.tap(() =>
        Effect.sync(() =>
          this.logger.log(`User with ID ${userId.toString()} deactivated`),
        ),
      ),
    );
  }
}
