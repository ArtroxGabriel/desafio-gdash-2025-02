import { isFail } from '@common/result';
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
import { mapToHttpException } from './auth.error';
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

    const result = await this.authService.signUp(signUpDto);
    if (isFail(result)) {
      throw mapToHttpException(result.error);
    }

    return result.value;
  }

  @Public()
  @Post('login')
  @ApiCreatedResponse({
    type: UserAuthDto,
  })
  async login(@Body() signInDto: SignInBasicDto) {
    this.logger.log('Starting login user process');
    const result = await this.authService.signIn(signInDto);
    if (isFail(result)) {
      throw mapToHttpException(result.error);
    }

    return result.value;
  }

  @Delete('logout')
  @ApiBearerAuth(HeaderName.AUTHORIZATION)
  async signOut(@Request() request: ProtectedRequest) {
    this.logger.log(
      'Starting sign out user process for user: ' + request.user.email,
    );
    const result = await this.authService.signOut(request.keystore);
    if (isFail(result)) {
      throw mapToHttpException(result.error);
    }

    return result.value;
  }

  @Public()
  @Post('token/refresh')
  async tokenRefresh(
    @Request() request: ProtectedRequest,
    @Body() tokenRefreshDto: TokenRefreshDto,
  ): Promise<UserTokensDto> {
    this.logger.log('Starting token refresh process');
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer' || token === undefined)
      throw new UnauthorizedException();

    const refreshTokenResult = await this.authService.refreshToken(
      tokenRefreshDto,
      token,
    );
    if (isFail(refreshTokenResult)) {
      throw mapToHttpException(refreshTokenResult.error);
    }

    const tokens = refreshTokenResult.value.tokens;
    return tokens;
  }

  @Post('/api-key')
  @ApiBearerAuth(HeaderName.AUTHORIZATION)
  @ApiCreatedResponse({
    type: ApiKeyDto,
  })
  async createApiKey(@Request() request: ProtectedRequest): Promise<ApiKeyDto> {
    const apikeyResult = await this.authService.createApiKey(
      request.user.email,
    );
    if (isFail(apikeyResult)) {
      throw mapToHttpException(apikeyResult.error);
    }

    return apikeyResult.value;
  }
}
