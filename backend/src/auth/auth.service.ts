import { fail, isFail, isSuccess, Result, success } from '@common/result';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { UserDto } from '@user/dto/user.dto';
import { User } from '@user/schemas/user.schema';
import { UserService } from '@user/user.service';
import { compare, hash } from 'bcrypt';
import { randomBytes } from 'crypto';
import { Types } from 'mongoose';
import { TokenConfig, TokenConfigName } from 'src/config/token.config';
import { AuthError } from './auth.error';
import { AuthRepository } from './auth.repository';
import { ApiKeyDto } from './dto/api-key.dto';
import { SignInBasicDto } from './dto/signin-basic.dto';
import { TokenRefreshDto } from './dto/token-refresh.dto';
import { UserAuthDto } from './dto/user-auth.dto';
import { UserTokensDto } from './dto/user-tokens.dto';
import { ApiKey, Permission } from './schemas/apikey.schema';
import { Keystore } from './schemas/keystore.schema';
import { RoleCode } from './schemas/role.schema';
import { TokenPayload } from './token/token.payload';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(signUpBasicDto: SignInBasicDto): Result<UserAuthDto, AuthError> {
    this.logger.log(`Signing up user with email ${signUpBasicDto.email}`);

    const userResult = await this.userService.findByEmail(signUpBasicDto.email);
    if (isSuccess(userResult)) {
      this.logger.warn(
        `User with email ${signUpBasicDto.email} already exists`,
      );
      return fail(AuthError.USER_ALREADY_EXISTS);
    }

    const role = await this.authRepository.findRole(RoleCode.VIEWER);
    if (role === null) {
      this.logger.error(`Role ${RoleCode.VIEWER} not found`);
      return fail(AuthError.INTERNAL_SERVER_ERROR);
    }

    const password = await hash(signUpBasicDto.password, 10);

    const createUserResult = await this.userService.create({
      ...signUpBasicDto,
      password: password,
      roles: [role],
    });

    if (isFail(createUserResult)) {
      return fail(AuthError.INTERNAL_SERVER_ERROR);
    }

    const createUserDto = createUserResult.value;
    const tokenResult = await this.createToken(createUserDto);
    if (isFail(tokenResult)) {
      return fail(AuthError.INTERNAL_SERVER_ERROR);
    }
    const tokenDto = tokenResult.value;

    this.logger.log(
      `User with email ${signUpBasicDto.email} signed up successfully`,
    );
    return success(new UserAuthDto(createUserDto, tokenDto));
  }

  async signIn(signInBasicDto: SignInBasicDto): Result<UserAuthDto, AuthError> {
    const result = await this.userService.findByEmail(signInBasicDto.email);
    if (isFail(result)) {
      this.logger.warn(`User with email ${signInBasicDto.email} not found`);
      return fail(AuthError.INVALID_CREDENTIALS);
    }

    const userDto = result.value;
    if (!userDto.password) {
      this.logger.warn(
        `User with email ${signInBasicDto.email} has no password set`,
      );
      return fail(AuthError.INVALID_CREDENTIALS);
    }

    const match = await compare(signInBasicDto.password, userDto.password);
    if (!match) {
      this.logger.warn(
        `Invalid password for user with email ${signInBasicDto.email}`,
      );
      return fail(AuthError.INVALID_CREDENTIALS);
    }

    const tokenResult = await this.createToken(userDto);
    if (isFail(tokenResult)) {
      return fail(AuthError.INTERNAL_SERVER_ERROR);
    }
    const tokenDto = tokenResult.value;

    return success(new UserAuthDto(userDto, tokenDto));
  }

  async signOut(keystore: Keystore): Result<string, AuthError> {
    await this.authRepository.removeKeystore(keystore._id);
    return success('Logout successful');
  }

  async refreshToken(
    tokenRefreshDto: TokenRefreshDto,
    accessToken: string,
  ): Result<UserAuthDto, AuthError> {
    const accessTokenPayload = this.decodeToken(accessToken);
    const validAccessToken = this.validatePayload(accessTokenPayload);
    if (!validAccessToken) {
      this.logger.warn('Invalid access token payload during token refresh');
      return fail(AuthError.INVALID_ACCESS_TOKEN);
    }

    const userResult = await this.userService.findById(
      new Types.ObjectId(accessTokenPayload.sub),
    );
    if (isFail(userResult)) {
      this.logger.warn(
        `User with id ${accessTokenPayload.sub} not found during token refresh`,
      );
      return fail(AuthError.USER_NOT_REGISTERED);
    }
    const userDto = userResult.value;

    const refreshResult = await this.verifyToken(tokenRefreshDto.refreshToken);
    if (isFail(refreshResult)) {
      if (refreshResult.error === AuthError.EXPIRED_ACCESS_TOKEN) {
        this.logger.warn('Refresh token expired during token refresh');
        return fail(AuthError.EXPIRED_ACCESS_TOKEN);
      }

      this.logger.warn('Invalid refresh token during token refresh');
      return fail(AuthError.INVALID_ACCESS_TOKEN);
    }

    const refreshTokenPayload = refreshResult.value;

    const validRefreshToken = this.validatePayload(refreshTokenPayload);
    if (!validRefreshToken) {
      this.logger.warn('Invalid refresh token payload during token refresh');
      return fail(AuthError.INVALID_ACCESS_TOKEN);
    }

    if (accessTokenPayload.sub !== refreshTokenPayload.sub) {
      this.logger.warn(
        'Access token and refresh token subject mismatch during token refresh',
      );
      return fail(AuthError.TOKEN_SUBJECT_MISMATCH);
    }

    const keystoreResult = await this.findTokensKeystore(
      userDto,
      accessTokenPayload.prm,
      refreshTokenPayload.prm,
    );
    if (isFail(keystoreResult)) {
      return keystoreResult;
    }
    const keystore = keystoreResult.value;

    await this.authRepository.removeKeystore(keystore._id);

    const tokenResult = await this.createToken(userDto);
    if (isFail(tokenResult)) {
      return fail(AuthError.INTERNAL_SERVER_ERROR);
    }
    const tokenDto = tokenResult.value;

    this.logger.log(
      `Token refreshed successfully for user with id ${userDto.id.toString()}`,
    );
    return success(new UserAuthDto(userDto, tokenDto));
  }

  private async createToken(user: UserDto): Result<UserTokensDto, AuthError> {
    this.logger.log(`Creating token for user with id ${user.id.toString()}`);

    const tokenConfig =
      this.configService.getOrThrow<TokenConfig>(TokenConfigName);

    const accessTokenKey = randomBytes(64).toString('hex');
    const refreshTokenKey = randomBytes(64).toString('hex');

    const keystoreResult = await this.createKeystore(
      user,
      accessTokenKey,
      refreshTokenKey,
    );
    if (isFail(keystoreResult)) {
      this.logger.error(
        `Failed to create keystore for user with id ${user.id.toString()}`,
      );
      return fail(AuthError.INTERNAL_SERVER_ERROR);
    }

    const accessTokenPayload = new TokenPayload(
      tokenConfig.issuer,
      tokenConfig.audience,
      user.id.toString(),
      accessTokenKey,
      tokenConfig.accessTokenValidity,
    );

    const refreshTokenPayload = new TokenPayload(
      tokenConfig.issuer,
      tokenConfig.audience,
      user.id.toString(),
      refreshTokenKey,
      tokenConfig.refreshTokenValidity,
    );

    const accessTokenResult = await this.signToken(accessTokenPayload);
    if (isFail(accessTokenResult)) {
      return accessTokenResult;
    }
    const accessToken = accessTokenResult.value;

    const refreshTokenResult = await this.signToken(refreshTokenPayload);
    if (isFail(refreshTokenResult)) {
      return refreshTokenResult;
    }
    const refreshToken = refreshTokenResult.value;

    return success(
      new UserTokensDto({
        accessToken: accessToken,
        refreshToken: refreshToken,
      }),
    );
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

  private async signToken(payload: TokenPayload): Result<string, AuthError> {
    try {
      const token = await this.jwtService.signAsync({ ...payload });
      return success(token);
    } catch (error) {
      this.logger.error('Error signing token: ' + error);
      return fail(AuthError.INTERNAL_SERVER_ERROR);
    }
  }

  async verifyToken(token: string): Result<TokenPayload, AuthError> {
    try {
      const payload = await this.jwtService.verifyAsync<TokenPayload>(token);
      return success(payload);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return fail(AuthError.EXPIRED_ACCESS_TOKEN);
      }
      return fail(AuthError.INVALID_ACCESS_TOKEN);
    }
  }

  private decodeToken(token: string) {
    return this.jwtService.decode<TokenPayload>(token);
  }

  async createKeystore(
    client: UserDto,
    primaryKey: string,
    secondaryKey: string,
  ): Result<Keystore, AuthError> {
    const clientModel = new User(client);
    const keystoreCreated = await this.authRepository.createKeystore(
      clientModel,
      primaryKey,
      secondaryKey,
    );

    return success(keystoreCreated);
  }

  async findTokensKeystore(
    client: UserDto,
    primaryKey: string,
    secondaryKey: string,
  ): Result<Keystore, AuthError> {
    const clientModel = new User(client);
    const keystore = await this.authRepository.findTokensKeystore(
      clientModel,
      primaryKey,
      secondaryKey,
    );
    if (keystore === null) {
      this.logger.warn('Keystore not found for provided tokens');
      return fail(AuthError.INVALID_ACCESS_TOKEN);
    }

    return success(keystore);
  }

  async findKeystore(
    clientDto: UserDto,
    key: string,
  ): Result<Keystore, AuthError> {
    const clientModel = new User(clientDto);
    const keystore = await this.authRepository.findKeystore(clientModel, key);
    if (keystore === null) {
      this.logger.warn(
        'Keystore not found for user id: ' + clientDto.id.toString(),
      );
      return fail(AuthError.INVALID_ACCESS_TOKEN);
    }

    return success(keystore);
  }

  async findApiKey(key: string): Result<ApiKey, AuthError> {
    const apikey = await this.authRepository.findApiKey(key);
    if (apikey === null) {
      this.logger.warn('API key not found for key: ' + key);
      return fail(AuthError.NOT_FOUND);
    }

    return success(apikey);
  }

  async createApiKey(email: string): Result<ApiKeyDto, AuthError> {
    const secureKey = randomBytes(32).toString('hex');

    const apiKey = await this.authRepository.createApiKey({
      key: secureKey,
      version: 1,
      permissions: [Permission.GENERAL],
      comments: [`Generated for user: ${email}`],
    });

    this.logger.log('api key created for user: ' + email);
    return success(new ApiKeyDto(apiKey));
  }

  async deleteApiKey(apikey: ApiKey): Result<ApiKey, AuthError> {
    const apikeyDeleted = await this.authRepository.deleteApiKey(apikey);
    if (apikeyDeleted === null) {
      this.logger.warn('Failed to delete api key: ' + apikey._id.toString());
      return fail(AuthError.INTERNAL_SERVER_ERROR);
    }

    return success(apikeyDeleted);
  }
}
