import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { UserDto } from '@user/dto/user.dto';
import { UserService } from '@user/user.service';
import { compare, hash } from 'bcrypt';
import { randomBytes } from 'crypto';
import { Types } from 'mongoose';
import { TokenConfig, TokenConfigName } from 'src/config/token.config';
import { AuthRepository } from './auth.repository';
import { SignInBasicDto } from './dto/signin-basic.dto';
import { TokenRefreshDto } from './dto/token-refresh.dto';
import { UserTokensDto } from './dto/user-tokens.dto';
import { Keystore } from './schemas/keystore.schema';
import { RoleCode } from './schemas/role.schema';
import { TokenPayload } from './token/token.payload';
import { ApiKey } from './schemas/apikey.schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async signUpBasic(signUpBasicDto: SignInBasicDto): Promise<{
    user: UserDto;
    tokens: UserTokensDto;
  }> {
    this.logger.log(`Signing up user with email ${signUpBasicDto.email}`);

    const user = await this.userService.findByEmail(signUpBasicDto.email);
    if (user) {
      this.logger.warn(
        `User with email ${signUpBasicDto.email} already exists`,
      );
      throw new BadRequestException('User already exists');
    }

    const role = await this.authRepository.findRole(RoleCode.VIEWER);
    if (!role) {
      this.logger.error(`Role ${RoleCode.VIEWER} not found`);
      throw new InternalServerErrorException();
    }

    const password = await hash(signUpBasicDto.password, 5);

    const createdUserDto = await this.userService.create({
      ...signUpBasicDto,
      password: password,
      roles: [role],
    });

    if (!createdUserDto) throw new InternalServerErrorException();

    const tokensDto = await this.createTokens(createdUserDto);

    this.logger.log(
      `User with email ${signUpBasicDto.email} signed up successfully`,
    );
    return { user: createdUserDto, tokens: tokensDto };
  }

  async signInBasic(
    signInBasicDto: SignInBasicDto,
  ): Promise<{ user: UserDto; tokens: UserTokensDto }> {
    const userDto = await this.userService.findByEmail(signInBasicDto.email);
    if (!userDto) {
      this.logger.warn(`User with email ${signInBasicDto.email} not found`);
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!userDto.password) {
      this.logger.warn(
        `User with email ${signInBasicDto.email} has no password set`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    const match = await compare(signInBasicDto.password, userDto.password);
    if (!match) {
      this.logger.warn(
        `Invalid password for user with email ${signInBasicDto.email}`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokensDto = await this.createTokens(userDto);

    return { user: userDto, tokens: tokensDto };
  }

  async signOut(keystore: Keystore): Promise<Keystore | null> {
    return this.authRepository.removeKeystore(keystore._id);
  }

  async refreshTokens(tokenRefreshDto: TokenRefreshDto, accessToken: string) {
    const accessTokenPayload = this.decodeToken(accessToken);
    const validAccessToken = this.validatePayload(accessTokenPayload);
    if (!validAccessToken) {
      this.logger.warn('Invalid access token payload during token refresh');
      throw new UnauthorizedException('Invalid Access Token');
    }

    const userDto = await this.userService.findById(
      new Types.ObjectId(accessTokenPayload.sub),
    );
    if (!userDto) {
      this.logger.warn(
        `User with id ${accessTokenPayload.sub} not found during token refresh`,
      );
      throw new UnauthorizedException('User not registered');
    }

    const refreshTokenPayload = await this.verifyToken(
      tokenRefreshDto.refreshToken,
    ).catch((e: Error) => {
      if (e instanceof TokenExpiredError) {
        this.logger.warn('Refresh token expired during token refresh');
        throw new UnauthorizedException('Refresh Token Expired');
      }

      this.logger.warn('Invalid refresh token during token refresh');
      throw new UnauthorizedException('Invalid Refresh Token');
    });

    const validRefreshToken = this.validatePayload(refreshTokenPayload);
    if (!validRefreshToken) {
      this.logger.warn('Invalid refresh token payload during token refresh');
      throw new UnauthorizedException('Invalid Refresh Token');
    }

    if (accessTokenPayload.sub !== refreshTokenPayload.sub) {
      this.logger.warn(
        'Access token and refresh token subject mismatch during token refresh',
      );
      throw new UnauthorizedException('Token Subject Mismatch');
    }

    const keystore = await this.findTokensKeystore(
      userDto,
      accessTokenPayload.prm,
      refreshTokenPayload.prm,
    );
    if (!keystore) {
      this.logger.warn(
        'Keystore not found for provided tokens during token refresh',
      );
      throw new UnauthorizedException('Invalid access token');
    }

    await this.authRepository.removeKeystore(keystore._id);

    const tokens = await this.createTokens(userDto);

    this.logger.log(
      `Tokens refreshed successfully for user with id ${userDto._id.toString()}`,
    );
    return { user: userDto, tokens: tokens };
  }

  private async createTokens(user: UserDto) {
    this.logger.log(`Creating tokens for user with id ${user._id.toString()}`);

    const tokenConfig =
      this.configService.getOrThrow<TokenConfig>(TokenConfigName);

    const accessTokenKey = randomBytes(64).toString('hex');
    const refreshTokenKey = randomBytes(64).toString('hex');

    const keystore = await this.createKeystore(
      user,
      accessTokenKey,
      refreshTokenKey,
    );
    if (!keystore) {
      this.logger.error(
        `Failed to create keystore for user with id ${user._id.toString()}`,
      );
      throw new InternalServerErrorException();
    }

    const accessTokenPayload = new TokenPayload(
      tokenConfig.issuer,
      tokenConfig.audience,
      user._id.toString(),
      accessTokenKey,
      tokenConfig.accessTokenValidity,
    );

    const refreshTokenPayload = new TokenPayload(
      tokenConfig.issuer,
      tokenConfig.audience,
      user._id.toString(),
      refreshTokenKey,
      tokenConfig.refreshTokenValidity,
    );

    const accessToken = await this.signToken(accessTokenPayload);
    if (!accessToken) throw new InternalServerErrorException();

    const refreshToken = await this.signToken(refreshTokenPayload);
    if (!refreshToken) throw new InternalServerErrorException();

    return new UserTokensDto({
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  }

  validatePayload(payload: TokenPayload) {
    const tokenConfig =
      this.configService.getOrThrow<TokenConfig>(TokenConfigName);
    if (
      !payload ||
      !payload.iss ||
      !payload.sub ||
      !payload.aud ||
      !payload.prm ||
      payload.iss !== tokenConfig.issuer ||
      payload.aud !== tokenConfig.audience ||
      !Types.ObjectId.isValid(payload.sub)
    ) {
      return false;
    }
    return true;
  }

  private async signToken(payload: TokenPayload) {
    return this.jwtService.signAsync({ ...payload });
  }

  async verifyToken(token: string) {
    try {
      return this.jwtService.verifyAsync<TokenPayload>(token);
    } catch (error) {
      if (error instanceof TokenExpiredError) throw error;
      throw new UnauthorizedException('Invalid Access Token');
    }
  }

  private decodeToken(token: string) {
    return this.jwtService.decode<TokenPayload>(token);
  }

  async createKeystore(
    client: UserDto,
    primaryKey: string,
    secondaryKey: string,
  ): Promise<Keystore> {
    return this.authRepository.createKeystore(client, primaryKey, secondaryKey);
  }

  async findTokensKeystore(
    client: UserDto,
    primaryKey: string,
    secondaryKey: string,
  ): Promise<Keystore | null> {
    return this.authRepository.findTokensKeystore(
      client,
      primaryKey,
      secondaryKey,
    );
  }

  async findKeystore(client: UserDto, key: string): Promise<Keystore | null> {
    return this.authRepository.findKeystore(client, key);
  }

  async findApiKey(key: string): Promise<ApiKey | null> {
    return this.authRepository.findApiKey(key);
  }

  async createApiKey(apikey: Omit<ApiKey, '_id' | 'status'>): Promise<ApiKey> {
    return this.authRepository.createApiKey(apikey);
  }

  async deleteApiKey(apikey: ApiKey): Promise<ApiKey | null> {
    return this.authRepository.deleteApiKey(apikey);
  }
}
