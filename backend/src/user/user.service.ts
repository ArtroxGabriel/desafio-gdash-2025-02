import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { UserDto } from './dto/user.dto';
import { User } from './schemas/user.schema';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async create(param: Omit<User, '_id' | 'status'>): Promise<UserDto> {
    this.logger.log('Creating a new user');

    const user = await this.userRepository.create(param);

    this.logger.log(`User created with ID: ${user._id.toString()}`);
    return new UserDto(user);
  }

  async findById(id: Types.ObjectId): Promise<UserDto> {
    this.logger.log(`Finding user by ID: ${id.toString()}`);

    const user = await this.userRepository.findById(id);
    if (!user) {
      this.logger.warn(`User not found with ID: ${id.toString()}`);
      throw new NotFoundException('User not found');
    }

    this.logger.log(`User found with ID: ${id.toString()}`);
    return new UserDto(user);
  }

  async findByEmail(email: string): Promise<UserDto> {
    this.logger.log(`Finding user by email: ${email}`);

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      this.logger.warn(`User not found with email: ${email}`);
      throw new NotFoundException('User not found');
    }

    this.logger.log(`User found with email: ${email}`);
    return new UserDto(user);
  }

  async findPrivateProfile(user: User): Promise<UserDto> {
    this.logger.log(
      `Finding private profile for user with ID ${user._id.toString()} `,
    );

    const profile = await this.userRepository.findPrivateProfile(user);
    if (!profile) {
      this.logger.warn(
        `Private profile not found for user with ID ${user._id.toString()}`,
      );
      throw new NotFoundException('User not found');
    }

    this.logger.log(
      `Private profile found for user with ID ${user._id.toString()}`,
    );
    return new UserDto(profile);
  }

  async updateProfile(
    userId: Types.ObjectId,
    updateData: Partial<User>,
  ): Promise<UserDto> {
    this.logger.log(`Updating profile for user with ID ${userId.toString()}`);

    const updatedUser = await this.userRepository.updateInfo({
      ...updateData,
      _id: userId,
    });

    if (!updatedUser) {
      this.logger.warn(
        `Failed to update profile for user with ID ${userId.toString()}`,
      );
      throw new NotFoundException('User not found');
    }

    this.logger.log(`Profile updated for user with ID ${userId.toString()}`);
    return new UserDto(updatedUser);
  }

  async deleteUser(user: User): Promise<string> {
    this.logger.log(`Deleting user with ID ${user._id.toString()}`);

    const userDeleted = await this.userRepository.delete(user);
    if (!userDeleted) {
      this.logger.warn(`User not found with ID ${user._id.toString()}`);
      throw new NotFoundException('User not found');
    }

    this.logger.log(`User deleted with ID ${user._id.toString()}`);
    return 'User successfully deleted';
  }

  async deactivateUser(userId: Types.ObjectId): Promise<string> {
    this.logger.log(`Deactivating user with ID ${userId.toString()}`);

    const userDeactivated = await this.userRepository.deactivate(userId);
    if (!userDeactivated) {
      this.logger.warn(`User not found with ID ${userId.toString()}`);
      throw new NotFoundException('User not found');
    }

    this.logger.log(`User deactivated with ID ${userId.toString()}`);
    return 'User successfully deactivated';
  }
}
