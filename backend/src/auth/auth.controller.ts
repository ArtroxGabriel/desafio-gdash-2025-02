import { HeaderName } from '@core/http/header';
import { type ProtectedRequest } from '@core/http/request';
import {
  Body,
  Controller,
  Delete,
  Post,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse } from '@nestjs/swagger';
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
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiCreatedResponse({
    type: UserAuthDto,
  })
  async register(@Body() signUpDto: SignUpBasicDto) {
    return this.authService.signUp(signUpDto);
  }

  @Public()
  @Post('login')
  @ApiCreatedResponse({
    type: UserAuthDto,
  })
  async login(@Body() signInDto: SignInBasicDto) {
    return this.authService.signIn(signInDto);
  }

  @Delete('logout')
  @ApiBearerAuth(HeaderName.AUTHORIZATION)
  async signOut(@Request() request: ProtectedRequest) {
    return this.authService.signOut(request.keystore);
  }

  @Public()
  @Post('token/refresh')
  async tokenRefresh(
    @Request() request: ProtectedRequest,
    @Body() tokenRefreshDto: TokenRefreshDto,
  ): Promise<UserTokensDto> {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer' || token === undefined)
      throw new UnauthorizedException();

    const { token: tokens } = await this.authService.refreshToken(
      tokenRefreshDto,
      token,
    );
    return tokens;
  }

  @Post('/api-key')
  @ApiBearerAuth(HeaderName.AUTHORIZATION)
  @ApiCreatedResponse({
    type: ApiKeyDto,
  })
  async createApiKey(@Request() request: ProtectedRequest): Promise<ApiKeyDto> {
    return this.authService.createApiKey(request.user.email);
  }
}
