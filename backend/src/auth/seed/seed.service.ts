import { Role, RoleCode } from '@auth/schemas/role.schema';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@user/schemas/user.schema';
import { hash } from 'bcrypt';
import { Effect } from 'effect';
import { Model } from 'mongoose';
import { ServerConfig, ServerConfigName } from 'src/config/server.config';
import { SeedError } from './seed.error';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(Role.name) private roleModel: Model<Role>,
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
  ) {}

  seed = Effect.gen(this, function* () {
    const serverConfig = yield* Effect.try({
      try: () => this.configService.getOrThrow<ServerConfig>(ServerConfigName),
      catch: (error) => {
        this.logger.error(
          'Error fetching server configuration during seeding',
          error instanceof Error ? error : undefined,
        );
        return new SeedError();
      },
    });

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

    yield* Effect.all([this.seedRoles, this.seedDefaultUser]);
    this.logger.debug('Database seeding completed successfully');
  });

  private seedRoles = Effect.gen(this, function* () {
    const existingRoles = yield* Effect.tryPromise({
      try: () => this.roleModel.countDocuments(),
      catch: (error) => {
        this.logger.error(
          'Error checking existing roles during seeding',
          error instanceof Error ? error : undefined,
        );
        return new SeedError();
      },
    });

    if (existingRoles > 0) {
      this.logger.debug('Roles already exist, skipping roles seeding');
      return;
    }

    this.logger.debug('Seeding default roles...');

    const roles = Object.values(RoleCode).map((code) => ({
      code,
      status: true,
    }));

    yield* Effect.tryPromise({
      try: () => this.roleModel.insertMany(roles),
      catch: (error) => {
        this.logger.error(
          'Error creating default roles during seeding',
          error instanceof Error ? error : undefined,
        );
        return new SeedError();
      },
    });

    this.logger.debug(`Created ${roles.length} default roles`);
  });

  private seedDefaultUser = Effect.gen(this, function* () {
    const existingUsers = yield* Effect.tryPromise({
      try: () => this.userModel.countDocuments(),
      catch: (error) => {
        this.logger.error(
          'Error checking existing users during seeding',
          error instanceof Error ? error : undefined,
        );
        return new SeedError();
      },
    });

    if (existingUsers > 0) {
      this.logger.debug('Users already exist, skipping default user seeding');
      return;
    }

    this.logger.debug('Seeding default admin user...');

    const adminRole = yield* Effect.tryPromise({
      try: () => this.roleModel.findOne({ code: RoleCode.ADMIN }),
      catch: (error) => {
        this.logger.error(
          'Error fetching admin role during user seeding',
          error instanceof Error ? error : undefined,
        );
        return new SeedError();
      },
    });

    if (!adminRole) {
      this.logger.debug('Admin role not found during user seeding');
      return yield* new SeedError();
    }

    const hashedPassword = yield* Effect.promise(() => hash('admin123', 10));

    const defaultUser = new this.userModel({
      name: 'Admin User',
      email: 'admin@localhost.dev',
      password: hashedPassword,
      roles: [adminRole._id],
      status: true,
    });

    yield* Effect.tryPromise({
      try: () => defaultUser.save(),
      catch: (error) => {
        this.logger.error(
          'Error creating default admin user during seeding',
          error instanceof Error ? error : undefined,
        );
        return new SeedError();
      },
    });

    this.logger.debug(
      `Created default admin user with email: admin@localhost.dev`,
    );
  });
}
