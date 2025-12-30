import { fail, Result, success } from '@common/result';
import { Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { UserDto } from './dto/user.dto';
import { User } from './schemas/user.schema';
import { UserError } from './user.error';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async create(
    param: Omit<User, '_id' | 'status'>,
  ): Result<UserDto, UserError> {
    this.logger.log('Creating a new user');

    const user = await this.userRepository.create(param);

    this.logger.log(`User created with ID: ${user._id.toString()}`);
    return success(new UserDto(user));
  }

  async findAll(
    page: number,
    limit: number,
  ): Result<{ data: UserDto[]; total: number }, UserError> {
    this.logger.debug(`Fetching users page: ${page}, limit: ${limit}`);

    const { data, total } = await this.userRepository.findAll(page, limit);
    const usersDto = data.map((user) => new UserDto(user));

    return success({ data: usersDto, total });
  }

  async findById(id: Types.ObjectId): Result<UserDto, UserError> {
    this.logger.log(`Finding user by ID: ${id.toString()}`);

    const user = await this.userRepository.findById(id);
    if (user === null) {
      this.logger.warn(`User not found with ID: ${id.toString()}`);
      return fail(UserError.NOT_FOUND);
    }

    this.logger.log(`User found with ID: ${id.toString()}`);
    return success(new UserDto(user));
  }

  async findByEmail(email: string): Result<UserDto, UserError> {
    this.logger.log(`Finding user by email: ${email}`);

    const user = await this.userRepository.findByEmail(email);
    if (user === null) {
      this.logger.warn(`User not found with email: ${email}`);
      return fail(UserError.NOT_FOUND);
    }

    this.logger.log(`User found with email: ${email}`);
    return success(new UserDto(user));
  }

  async findPrivateProfile(user: User): Result<UserDto, UserError> {
    this.logger.log(
      `Finding private profile for user with ID ${user._id.toString()} `,
    );

    const profile = await this.userRepository.findPrivateProfile(user);
    if (profile === null) {
      this.logger.warn(
        `Private profile not found for user with ID ${user._id.toString()}`,
      );
      return fail(UserError.NOT_FOUND);
    }

    this.logger.log(
      `Private profile found for user with ID ${user._id.toString()}`,
    );
    return success(new UserDto(profile));
  }

  async updateProfile(
    userId: Types.ObjectId,
    updateData: Partial<User>,
  ): Result<UserDto, UserError> {
    this.logger.log(`Updating profile for user with ID ${userId.toString()}`);

    const updatedUser = await this.userRepository.updateInfo({
      ...updateData,
      _id: userId,
    });

    if (updatedUser === null) {
      this.logger.warn(
        `Failed to update profile for user with ID ${userId.toString()}`,
      );
      return fail(UserError.NOT_FOUND);
    }

    this.logger.log(`Profile updated for user with ID ${userId.toString()}`);
    return success(new UserDto(updatedUser));
  }

  async deleteUser(user: User): Result<unknown, UserError> {
    this.logger.log(`Deleting user with ID ${user._id.toString()}`);

    const userDeleted = await this.userRepository.delete(user);
    if (userDeleted === null) {
      this.logger.warn(`User not found with ID ${user._id.toString()}`);
      return fail(UserError.NOT_FOUND);
    }

    this.logger.log(`User deleted with ID ${user._id.toString()}`);
    return success(null);
  }

  async deactivateUser(userId: Types.ObjectId): Result<unknown, UserError> {
    this.logger.log(`Deactivating user with ID ${userId.toString()}`);

    const userDeactivated = await this.userRepository.deactivate(userId);
    if (userDeactivated === null) {
      this.logger.warn(`User not found with ID ${userId.toString()}`);
      return fail(UserError.NOT_FOUND);
    }

    this.logger.log(`User deactivated with ID ${userId.toString()}`);
    return success(null);
  }
}
