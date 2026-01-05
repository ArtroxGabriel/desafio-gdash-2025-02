import { runNest } from '@common/effect-util';
import { HeaderName } from '@core/http/header';
import type { ProtectedRequest } from '@core/http/request';
import {
  Body,
  Controller,
  Delete,
  Logger,
  Post,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse } from '@nestjs/swagger';
import { Effect, pipe } from 'effect';
import { mapToHttpExceptionV2 } from './auth.error';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { ApiKeyDto } from './dto/api-key.dto';
import { SignInBasicDto } from './dto/signin-basic.dto';
import { SignUpBasicDto } from './dto/signup-basic.dto';
import { TokenRefreshDto } from './dto/token-refresh.dto';
import { UserAuthDto } from './dto/user-auth.dto';
import { UserTokensDto } from './dto/user-tokens.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiCreatedResponse({
    type: UserAuthDto,
  })
  async register(@Body() signUpDto: SignUpBasicDto) {
    this.logger.log('Starting register user process');

    const registerFlow = this.authService.signUp(signUpDto);
    return runNest(registerFlow, mapToHttpExceptionV2);
  }

  @Public()
  @Post('login')
  @ApiCreatedResponse({
    type: UserAuthDto,
  })
  async login(@Body() signInDto: SignInBasicDto) {
    this.logger.log('Starting login user process');

    const loginFlow = this.authService.signIn(signInDto);
    return runNest(loginFlow, mapToHttpExceptionV2);
  }

  @Delete('logout')
  @ApiBearerAuth(HeaderName.AUTHORIZATION)
  async signOut(@Request() request: ProtectedRequest) {
    this.logger.log(
      'Starting sign out user process for user: ' + request.user.email,
    );

    const signOutFlow = this.authService.signOut(request.keystore);
    return runNest(signOutFlow, mapToHttpExceptionV2);
  }

  @Public()
  @Post('token/refresh')
  async tokenRefresh(
    @Request() request: ProtectedRequest,
    @Body() tokenRefreshDto: TokenRefreshDto,
  ): Promise<UserTokensDto> {
    this.logger.log('Starting token refresh process');

    const refreshTokenFlow = pipe(
      Effect.sync(() => {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        if (type !== 'Bearer' || token === undefined) {
          throw new UnauthorizedException();
        }
        return token;
      }),

      Effect.flatMap((token) =>
        this.authService.refreshToken(tokenRefreshDto, token),
      ),

      Effect.map((result) => result.tokens),
    );

    return runNest(refreshTokenFlow, mapToHttpExceptionV2);
  }

  @Post('/api-key')
  @ApiBearerAuth(HeaderName.AUTHORIZATION)
  @ApiCreatedResponse({
    type: ApiKeyDto,
  })
  async createApiKey(@Request() request: ProtectedRequest): Promise<ApiKeyDto> {
    this.logger.log(
      'Starting API key creation process for user: ' + request.user.email,
    );

    const createApiKeyFlow = this.authService.createApiKey(request.user.email);

    return runNest(createApiKeyFlow, mapToHttpExceptionV2);
  }
}
