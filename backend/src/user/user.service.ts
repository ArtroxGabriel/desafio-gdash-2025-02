import { Injectable, Logger } from '@nestjs/common';
import { Effect } from 'effect';
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
    return Effect.gen(this, function* () {
      this.logger.log('Creating a new user');

      const user = yield* this.userRepository.create(param).pipe(
        Effect.tapError((err) => {
          this.logger.error(`User creation failed: ${err.message}`);
          return err;
        }),
      );
      const userDto = new UserDto(user);

      this.logger.log(`User created with ID: ${userDto.id.toString()}`);
      return userDto;
    });
  }

  findAll(
    page: number,
    limit: number,
  ): Effect.Effect<{ data: UserDto[]; total: number }, UserError> {
    return Effect.gen(this, function* () {
      this.logger.debug(`Fetching users page: ${page}, limit: ${limit}`);

      const { data, total } = yield* this.userRepository
        .findAll(page, limit)
        .pipe(
          Effect.tapError((err) => {
            this.logger.error(`Fetching users failed: ${err.message}`);
            return err;
          }),
        );

      const dataPaginated = data.map((user) => new UserDto(user));

      this.logger.log(`${data.length} users fetched successfully`);
      return { data: dataPaginated, total };
    });
  }

  findById(id: Types.ObjectId): Effect.Effect<UserDto, UserError> {
    return Effect.gen(this, function* () {
      this.logger.log(`Finding user by ID: ${id.toString()}`);

      const user = yield* this.userRepository.findById(id).pipe(
        Effect.tapError((err) => {
          this.logger.error(`User search by ID failed: ${err.message}`);
          return err;
        }),
      );

      if (user === null) {
        this.logger.warn(`User not found with id: ${id.toString()}`);
        return yield* new UserError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      const userDto = new UserDto(user);

      this.logger.log(`User with ID: ${id.toString()} found successfully`);
      return userDto;
    });
  }

  findByEmail(email: string): Effect.Effect<UserDto, UserError> {
    return Effect.gen(this, function* () {
      this.logger.log(`Finding user by email: ${email}`);

      const user = yield* this.userRepository.findByEmail(email).pipe(
        Effect.tapError((err) => {
          this.logger.error(`User search by Email failed: ${err.message}`);
          return err;
        }),
      );
      if (user === null) {
        this.logger.warn(`User not found with email: ${email}`);
        return yield* new UserError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      const userDto = new UserDto(user);

      this.logger.log(`User with email: ${email} found successfully`);
      return userDto;
    });
  }

  findPrivateProfile(user: User): Effect.Effect<UserDto, UserError> {
    return Effect.gen(this, function* () {
      this.logger.log(
        `Finding private profile for user with ID ${user._id.toString()}`,
      );

      const profile = yield* this.userRepository.findPrivateProfile(user._id);
      if (profile === null) {
        this.logger.warn(
          `Private profile not found for user with ID ${user._id.toString()}`,
        );
        return yield* new UserError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      const userDto = new UserDto(profile);

      this.logger.log(
        `Private profile for user with ID ${user._id.toString()} found successfully`,
      );
      return userDto;
    });
  }

  updateProfile(
    userId: Types.ObjectId,
    updateData: Partial<User>,
  ): Effect.Effect<UserDto, UserError> {
    return Effect.gen(this, function* () {
      this.logger.log(`Updating profile for user with ID ${userId.toString()}`);

      const updateUser = yield* this.userRepository
        .updateInfo({
          ...updateData,
          _id: userId,
        })
        .pipe(
          Effect.tapError((err) => {
            this.logger.error(
              `Profile update failed for user with ID ${userId.toString()}: ${err.message}`,
            );
            return err;
          }),
        );

      if (updateUser === null) {
        this.logger.warn(
          `Profile update failed: User not found with ID ${userId.toString()}`,
        );
        return yield* new UserError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      const userDto = new UserDto(updateUser);

      this.logger.log(`Profile updated for user with ID ${userId.toString()}`);
      return userDto;
    });
  }

  deleteUser(user: User): Effect.Effect<void, UserError> {
    return Effect.gen(this, function* () {
      this.logger.log(`Deleting user with ID ${user._id.toString()}`);

      const userDeleted = yield* this.userRepository.delete(user).pipe(
        Effect.tapError((err) => {
          this.logger.error(
            `User deletion failed for ID ${user._id.toString()}: ${err.message}`,
          );
          return err;
        }),
      );
      if (userDeleted === null) {
        this.logger.warn(`User not found with ID ${user._id.toString()}`);
        return yield* new UserError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      this.logger.log(`User with ID ${user._id.toString()} deleted`);
    });
  }

  deactivateUser(userId: Types.ObjectId): Effect.Effect<void, UserError> {
    return Effect.gen(this, function* () {
      this.logger.log(`Deactivating user with ID ${userId.toString()}`);

      const userDeactivated = yield* this.userRepository
        .deactivate(userId)
        .pipe(
          Effect.tapError((err) => {
            this.logger.error(
              `User deactivation failed for ID ${userId.toString()}: ${err.message}`,
            );
            return err;
          }),
        );

      if (userDeactivated === null) {
        this.logger.warn(`User not found with ID ${userId.toString()}`);
        return yield* new UserError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      this.logger.log(`User with ID ${userId.toString()} deactivated`);
    });
  }
}
