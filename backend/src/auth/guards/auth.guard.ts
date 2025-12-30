import { AuthError, mapToHttpException } from '@auth/auth.error';
import { AuthService } from '@auth/auth.service';
import { IS_PUBLIC_KEY } from '@auth/decorators/public.decorator';
import { isFail } from '@common/result';
import { ProtectedRequest } from '@core/http/request';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '@user/schemas/user.schema';
import { UserService } from '@user/user.service';
import { Request } from 'express';
import { Types } from 'mongoose';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<ProtectedRequest>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      this.logger.warn('No token found in request headers');
      throw new UnauthorizedException();
    }

    const payloadResult = await this.authService.verifyToken(token);
    if (isFail(payloadResult)) {
      throw mapToHttpException(payloadResult.error);
    }
    const payload = payloadResult.value;

    const valid = this.authService.validatePayload(payload);
    if (!valid) {
      this.logger.warn('Invalid access token payload');
      throw mapToHttpException(AuthError.INVALID_ACCESS_TOKEN);
    }

    const userResult = await this.userService.findById(
      new Types.ObjectId(payload.sub),
    );
    if (isFail(userResult)) {
      this.logger.warn(`User not found for ID: ${payload.sub}`);
      throw mapToHttpException(AuthError.USER_NOT_REGISTERED);
    }
    const userDto = userResult.value;

    const keystoreResult = await this.authService.findKeystore(
      userDto,
      payload.prm,
    );
    if (isFail(keystoreResult)) {
      this.logger.warn('No keystore found for the provided access token');
      throw mapToHttpException(keystoreResult.error);
    }

    request.user = new User(userDto);
    request.keystore = keystoreResult.value;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
