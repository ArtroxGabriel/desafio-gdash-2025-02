import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '@user/user.module';
import { Effect } from 'effect';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { AuthGuard, RoleGuard } from './guards';
import { ApiKey, ApiKeySchema } from './schemas/apikey.schema';
import { Keystore, KeystoreSchema } from './schemas/keystore.schema';
import { Role, RoleSchema } from './schemas/role.schema';
import { SeedService } from './seed/seed.service';
import TokenFactory from './token/token.factory';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useClass: TokenFactory,
    }),
    MongooseModule.forFeature([
      { name: ApiKey.name, schema: ApiKeySchema },
      { name: Keystore.name, schema: KeystoreSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
    UserModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RoleGuard },
    SeedService,
    AuthService,
    AuthRepository,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule implements OnModuleInit {
  constructor(private readonly seedService: SeedService) {}

  async onModuleInit() {
    await Effect.runPromise(this.seedService.seed);
  }
}
