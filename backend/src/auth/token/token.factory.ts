import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { AuthKeyConfig, AuthKeyConfigName } from 'src/config/auth.config';

@Injectable()
export default class TokenFactory implements JwtOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  async createJwtOptions(): Promise<JwtModuleOptions> {
    const keys =
      this.configService.getOrThrow<AuthKeyConfig>(AuthKeyConfigName);

    const publicKey = await readFile(
      join(__dirname, '../../../', keys.publicKeyPath),
      'utf-8',
    );
    const privateKey = await readFile(
      join(__dirname, '../../../', keys.privateKeyPath),
      'utf-8',
    );

    return {
      publicKey,
      privateKey,
      signOptions: {
        algorithm: 'RS256',
      },
    };
  }
}
