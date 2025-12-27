import { Role, RoleCode } from '@auth/schemas/role.schema';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@user/schemas/user.schema';
import { hash } from 'bcrypt';
import { Model } from 'mongoose';
import { ServerConfig, ServerConfigName } from 'src/config/server.config';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(Role.name) private roleModel: Model<Role>,
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
  ) {}

  async seed(): Promise<void> {
    const serverConfig =
      this.configService.getOrThrow<ServerConfig>(ServerConfigName);

    if (
      serverConfig.nodeEnv !== 'development' &&
      serverConfig.nodeEnv !== 'local'
    ) {
      this.logger.debug(
        'Skipping seeding: not in development or local environment',
      );
      return;
    }

    this.logger.debug('Starting database seeding...');

    try {
      await this.seedRoles();
      await this.seedDefaultUser();
      this.logger.debug('Database seeding completed successfully');
    } catch (error) {
      this.logger.error('Database seeding failed', error);
      throw error;
    }
  }

  private async seedRoles(): Promise<void> {
    const existingRoles = await this.roleModel.countDocuments();

    if (existingRoles > 0) {
      this.logger.debug('Roles already exist, skipping roles seeding');
      return;
    }

    this.logger.debug('Seeding default roles...');

    const roles = Object.values(RoleCode).map((code) => ({
      code,
      status: true,
    }));

    await this.roleModel.insertMany(roles);
    this.logger.debug(`Created ${roles.length} default roles`);
  }

  private async seedDefaultUser(): Promise<void> {
    const existingUsers = await this.userModel.countDocuments();

    if (existingUsers > 0) {
      this.logger.debug('Users already exist, skipping default user seeding');
      return;
    }

    this.logger.debug('Seeding default admin user...');

    const adminRole = await this.roleModel.findOne({ code: RoleCode.ADMIN });

    if (!adminRole) {
      this.logger.debug('Admin role not found during user seeding');
      throw new Error('Admin role must exist before creating default user');
    }

    const hashedPassword = await hash('admin123', 10);

    const defaultUser = new this.userModel({
      name: 'Admin User',
      email: 'admin@localhost.dev',
      password: hashedPassword,
      roles: [adminRole._id],
      status: true,
    });

    await defaultUser.save();
    this.logger.debug(
      `Created default admin user with email: admin@localhost.dev`,
    );
  }
}
