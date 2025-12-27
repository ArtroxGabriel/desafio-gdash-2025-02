import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '@user/user.module';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { AuthGuard, RoleGuard } from './guards';
import { ApiKey, ApiKeySchema } from './schemas/apikey.schema';
import { Keystore, KeystoreSchema } from './schemas/keystore.schema';
import { Role, RoleSchema } from './schemas/role.schema';
import TokenFactory from './token/token.factory';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useClass: TokenFactory,
    }),
    UserModule,
  ],
  providers: [
    AuthService,
    AuthRepository,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
