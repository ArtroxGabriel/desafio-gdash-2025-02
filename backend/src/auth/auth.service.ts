import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { UserDto } from '@user/dto/user.dto';
import { User } from '@user/schemas/user.schema';
import { UserService } from '@user/user.service';
import { compare, hash } from 'bcrypt';
import { randomBytes } from 'crypto';
import { Effect, pipe } from 'effect';
import { Types } from 'mongoose';
import { TokenConfig, TokenConfigName } from 'src/config/token.config';
import { AuthErrorClass } from './auth.error';
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

  signUp(
    signUpBasicDto: SignInBasicDto,
  ): Effect.Effect<UserAuthDto, AuthErrorClass> {
    return Effect.gen(this, function* () {
      this.logger.log(`Signing up user with email ${signUpBasicDto.email}`);

      yield* this.userService.findByEmail(signUpBasicDto.email).pipe(
        Effect.flip,
        Effect.mapError(() => {
          this.logger.warn(
            `User with email ${signUpBasicDto.email} already exists`,
          );
          return new AuthErrorClass({
            code: 'USER_ALREADY_EXISTS',
            message: 'User with this email already exists',
          });
        }),
        Effect.catchAll(() => Effect.void),
      );

      const role = yield* this.authRepository.findRole(RoleCode.VIEWER);
      if (role === null) {
        this.logger.error(`Role ${RoleCode.VIEWER} not found`);
        return yield* new AuthErrorClass({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Default role not found',
        });
      }

      const password = yield* Effect.promise(() =>
        hash(signUpBasicDto.password, 10),
      );

      const createUserDto = yield* this.userService
        .create({
          ...signUpBasicDto,
          password: password,
          roles: [role],
        })
        .pipe(
          Effect.tapError(() =>
            Effect.sync(() =>
              this.logger.error(
                `Failed to create user with email ${signUpBasicDto.email}`,
              ),
            ),
          ),
          Effect.mapError(
            () =>
              new AuthErrorClass({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to create user',
              }),
          ),
        );

      const tokenDto = yield* this.createToken(createUserDto).pipe(
        Effect.tapError(() =>
          Effect.sync(() =>
            this.logger.error(
              `Failed to create tokens for user with email ${signUpBasicDto.email} during sign up`,
            ),
          ),
        ),
      );

      this.logger.log(
        `User with email ${signUpBasicDto.email} signed up successfully`,
      );
      return new UserAuthDto(createUserDto, tokenDto);
    });
  }

  signIn(
    signInBasicDto: SignInBasicDto,
  ): Effect.Effect<UserAuthDto, AuthErrorClass> {
    return Effect.gen(this, function* () {
      const userDto = yield* this.userService
        .findByEmail(signInBasicDto.email)
        .pipe(
          Effect.tapError(() =>
            Effect.sync(() =>
              this.logger.error(
                `Failed to find user with email ${signInBasicDto.email} during sign in`,
              ),
            ),
          ),
          Effect.mapError(
            () =>
              new AuthErrorClass({
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password',
              }),
          ),
        );

      if (!userDto.password) {
        this.logger.warn(
          `User with email ${signInBasicDto.email} has no password set`,
        );
        return yield* new AuthErrorClass({
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        });
      }

      const hashPassword = userDto.password;
      const match = yield* Effect.promise(() =>
        compare(signInBasicDto.password, hashPassword),
      );
      if (!match) {
        this.logger.warn(
          `Invalid password for user with email ${signInBasicDto.email}`,
        );
        yield* new AuthErrorClass({
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        });
      }

      const tokenDto = yield* this.createToken(userDto).pipe(
        Effect.tapError(() =>
          Effect.sync(() =>
            this.logger.error(
              `Failed to create tokens for user with email ${signInBasicDto.email} during sign in`,
            ),
          ),
        ),
      );

      return new UserAuthDto(userDto, tokenDto);
    });
  }

  signOut(keystore: Keystore): Effect.Effect<string, AuthErrorClass> {
    return pipe(
      this.authRepository.removeKeystore(keystore._id),
      Effect.map(() => 'Logout successful'),

      Effect.tapError(() =>
        Effect.sync(() =>
          this.logger.error(
            `Failed to logout user with keystore id: ${keystore._id.toString()}`,
          ),
        ),
      ),
    );
  }

  refreshToken(
    tokenRefreshDto: TokenRefreshDto,
    accessToken: string,
  ): Effect.Effect<UserAuthDto, AuthErrorClass> {
    return Effect.gen(this, function* () {
      const accessTokenPayload = yield* this.decodeToken(accessToken);
      const validAccessToken = yield* this.validatePayload(accessTokenPayload);
      if (!validAccessToken) {
        this.logger.warn('Invalid access token payload during token refresh');
        yield* new AuthErrorClass({
          code: 'INVALID_ACCESS_TOKEN',
          message: 'Invalid Access token',
        });
      }

      const userDto = yield* this.userService
        .findById(new Types.ObjectId(accessTokenPayload.sub))
        .pipe(
          Effect.tapError(() =>
            Effect.sync(() =>
              this.logger.error(
                `Failed to find user with id ${accessTokenPayload.sub} during token refresh`,
              ),
            ),
          ),
          Effect.mapError(
            () =>
              new AuthErrorClass({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to create keystore',
              }),
          ),
        );

      const refreshTokenPayload = yield* this.verifyToken(
        tokenRefreshDto.refreshToken,
      ).pipe(
        Effect.tapError(() =>
          Effect.sync(() =>
            this.logger.error(
              `Failed to verify refresh token during token refresh for user id ${userDto.id.toString()}`,
            ),
          ),
        ),
      );

      const validRefreshToken =
        yield* this.validatePayload(refreshTokenPayload);
      if (!validRefreshToken) {
        this.logger.warn('Invalid refresh token payload during token refresh');
        return yield* new AuthErrorClass({
          code: 'INVALID_ACCESS_TOKEN',
          message: 'Invalid Access tken',
        });
      }

      if (accessTokenPayload.sub !== refreshTokenPayload.sub) {
        this.logger.warn(
          'Access token and refresh token subject mismatch during token refresh',
        );
        return yield* new AuthErrorClass({
          code: 'INVALID_ACCESS_TOKEN',
          message: 'Invalid Access token',
        });
      }

      const keystore = yield* this.findTokensKeystore(
        userDto,
        accessTokenPayload.prm,
        refreshTokenPayload.prm,
      ).pipe(
        Effect.tapError(() =>
          Effect.sync(() =>
            this.logger.error(
              `Failed to find keystore during token refresh for user id ${userDto.id.toString()}`,
            ),
          ),
        ),

        Effect.mapError(
          () =>
            new AuthErrorClass({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to find keystore',
            }),
        ),
      );

      yield* this.authRepository.removeKeystore(keystore._id);

      const tokenDto = yield* this.createToken(userDto).pipe(
        Effect.tapError(() =>
          Effect.sync(() =>
            this.logger.error(
              `Failed to create new tokens during token refresh for user id ${userDto.id.toString()}`,
            ),
          ),
        ),
      );

      this.logger.log(
        `Token refreshed successfully for user with id ${userDto.id.toString()}`,
      );
      return new UserAuthDto(userDto, tokenDto);
    });
  }

  private createToken(
    user: UserDto,
  ): Effect.Effect<UserTokensDto, AuthErrorClass> {
    return Effect.gen(this, function* () {
      const tokenConfig =
        this.configService.getOrThrow<TokenConfig>(TokenConfigName);

      const accessTokenKey = randomBytes(64).toString('hex');
      const refreshTokenKey = randomBytes(64).toString('hex');

      yield* this.createKeystore(user, accessTokenKey, refreshTokenKey).pipe(
        Effect.tapError(() =>
          Effect.sync(() =>
            this.logger.error(
              `Failed to create keystore for user id ${user.id.toString()}`,
            ),
          ),
        ),
        Effect.mapError(
          () =>
            new AuthErrorClass({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to create keystore',
            }),
        ),
      );

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

      const [accessToken, refreshToken] = yield* Effect.all([
        this.signToken(accessTokenPayload),
        this.signToken(refreshTokenPayload),
      ]);

      return new UserTokensDto({
        accessToken,
        refreshToken,
      });
    });
  }

  validatePayload(payload: TokenPayload): Effect.Effect<boolean, never> {
    return pipe(
      Effect.sync(() =>
        this.configService.getOrThrow<TokenConfig>(TokenConfigName),
      ),

      Effect.map((tokenConfig) => {
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
      }),
    );
  }

  private signToken(
    payload: TokenPayload,
  ): Effect.Effect<string, AuthErrorClass> {
    return Effect.tryPromise({
      try: () => this.jwtService.signAsync({ ...payload }),
      catch: (error) =>
        new AuthErrorClass({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Error signing token: ${error instanceof Error ? error.message : String(error)}`,
        }),
    }).pipe(
      Effect.tapError((authError) =>
        Effect.sync(() => this.logger.error(authError.message)),
      ),
    );
  }

  verifyToken(token: string): Effect.Effect<TokenPayload, AuthErrorClass> {
    return Effect.tryPromise({
      try: () => this.jwtService.verifyAsync<TokenPayload>(token),
      catch: (error) => {
        if (error instanceof TokenExpiredError) {
          return new AuthErrorClass({
            code: 'EXPIRED_ACCESS_TOKEN',
            message: 'Expired Access token',
          });
        }
        return new AuthErrorClass({
          code: 'INVALID_ACCESS_TOKEN',
          message: 'Invalid Access token',
        });
      },
    });
  }

  private decodeToken(token: string): Effect.Effect<TokenPayload, never> {
    return Effect.sync(() => this.jwtService.decode<TokenPayload>(token));
  }

  createKeystore(
    client: UserDto,
    primaryKey: string,
    secondaryKey: string,
  ): Effect.Effect<Keystore, AuthErrorClass> {
    return pipe(
      Effect.sync(() =>
        this.logger.debug(
          'Creating keystore for user id: ' + client.id.toString(),
        ),
      ),

      Effect.map(() => new User(client)),
      Effect.flatMap((clientModel) =>
        this.authRepository.createKeystore(
          clientModel,
          primaryKey,
          secondaryKey,
        ),
      ),

      Effect.tap(() =>
        Effect.sync(() =>
          this.logger.log(
            'Keystore created for user id: ' + client.id.toString(),
          ),
        ),
      ),

      Effect.tapError((err) =>
        Effect.sync(() =>
          this.logger.error(
            `CreateKeystore Flow Failed: ${err.code} - ${err.message}`,
          ),
        ),
      ),
    );
  }

  findTokensKeystore(
    client: UserDto,
    primaryKey: string,
    secondaryKey: string,
  ): Effect.Effect<Keystore, AuthErrorClass> {
    return pipe(
      Effect.sync(() =>
        this.logger.debug(
          'Finding keystore for user id: ' + client.id.toString(),
        ),
      ),

      Effect.map(() => new User(client)),
      Effect.flatMap((clientModel) =>
        this.authRepository.findTokensKeystore(
          clientModel,
          primaryKey,
          secondaryKey,
        ),
      ),
      Effect.flatMap((keystore) => {
        if (keystore === null) {
          this.logger.warn(
            'Keystore not found for user id: ' + client.id.toString(),
          );
          return Effect.fail(
            new AuthErrorClass({
              code: 'INVALID_ACCESS_TOKEN',
              message: 'Invalid Access token',
            }),
          );
        }
        return Effect.succeed(keystore);
      }),

      Effect.tap(
        Effect.sync(() =>
          this.logger.log(
            'Keystore found for user id: ' + client.id.toString(),
          ),
        ),
      ),

      Effect.tapError((err) =>
        Effect.sync(() =>
          this.logger.error(
            `FindKeystore Flow Failed: ${err.code} - ${err.message}`,
          ),
        ),
      ),
    );
  }

  findKeystore(
    clientDto: UserDto,
    key: string,
  ): Effect.Effect<Keystore, AuthErrorClass> {
    return pipe(
      Effect.sync(() =>
        this.logger.debug(
          'Finding keystore for user id: ' + clientDto.id.toString(),
        ),
      ),

      Effect.map(() => new User(clientDto)),
      Effect.flatMap((clientModel) =>
        this.authRepository.findKeystore(clientModel, key),
      ),

      Effect.flatMap((keystore) => {
        if (keystore === null) {
          this.logger.warn(
            'Keystore not found for user id: ' + clientDto.id.toString(),
          );
          return Effect.fail(
            new AuthErrorClass({
              code: 'INVALID_ACCESS_TOKEN',
              message: 'Invalid Access token',
            }),
          );
        }
        return Effect.succeed(keystore);
      }),

      Effect.tap(
        Effect.sync(() =>
          this.logger.log(
            'Keystore found for user id: ' + clientDto.id.toString(),
          ),
        ),
      ),

      Effect.tapError((err) =>
        Effect.sync(() =>
          this.logger.error(
            `FindKeystore Flow Failed: ${err.code} - ${err.message}`,
          ),
        ),
      ),
    );
  }

  findApiKey(key: string): Effect.Effect<ApiKey, AuthErrorClass> {
    return pipe(
      this.authRepository.findApiKey(key),

      Effect.flatMap((apiKey) => {
        if (apiKey === null) {
          this.logger.warn('API key not found for key: ' + key);
          return Effect.fail(
            new AuthErrorClass({
              code: 'NOT_FOUND',
              message: 'API key not found',
            }),
          );
        }

        return Effect.succeed(apiKey);
      }),

      Effect.tapError((err) =>
        Effect.sync(() =>
          this.logger.error(
            `FindApiKey Flow Failed: ${err.code} - ${err.message}`,
          ),
        ),
      ),
    );
  }

  createApiKey(email: string): Effect.Effect<ApiKeyDto, AuthErrorClass> {
    return pipe(
      Effect.sync(() => randomBytes(32).toString('hex')),

      Effect.flatMap((secureKey) =>
        this.authRepository.createApiKey({
          key: secureKey,
          version: 1,
          permissions: [Permission.GENERAL],
          comments: [`Generated for user: ${email}`],
        }),
      ),
      Effect.map((apiKey) => new ApiKeyDto(apiKey)),

      Effect.tap(() =>
        Effect.sync(() =>
          this.logger.log('api key created for user: ' + email),
        ),
      ),

      Effect.tapError((err) =>
        Effect.sync(() =>
          this.logger.error(
            `CreateApiKey Flow Failed: ${err.code} - ${err.message}`,
          ),
        ),
      ),
    );
  }

  deleteApiKey(apikey: ApiKey): Effect.Effect<ApiKey, AuthErrorClass> {
    return pipe(
      this.authRepository.deleteApiKey(apikey),

      Effect.flatMap((apikeyDeleted) => {
        if (apikeyDeleted === null) {
          this.logger.warn(
            'Failed to delete api key: ' + apikey._id.toString(),
          );
          return Effect.fail(
            new AuthErrorClass({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to delete api key',
            }),
          );
        }
        return Effect.succeed(apikeyDeleted);
      }),

      Effect.tap(() =>
        Effect.sync(() =>
          this.logger.log('api key deleted: ' + apikey._id.toString()),
        ),
      ),

      Effect.tapError((err) =>
        Effect.sync(() =>
          this.logger.error(
            `DeleteApiKey Flow Failed: ${err.code} - ${err.message}`,
          ),
        ),
      ),
    );
  }
}
