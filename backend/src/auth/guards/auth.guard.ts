import { AuthErrorClass, mapToHttpExceptionV2 } from '@auth/auth.error';
import { AuthService } from '@auth/auth.service';
import { IS_PUBLIC_KEY } from '@auth/decorators/public.decorator';
import { runNest } from '@common/effect-util';
import { ProtectedRequest } from '@core/http/request';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '@user/schemas/user.schema';
import { UserService } from '@user/user.service';
import { Effect } from 'effect';
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
    const authGuardFlow = Effect.gen(this, function* () {
      const isPublic = this.reflector.getAllAndOverride<boolean>(
        IS_PUBLIC_KEY,
        [context.getHandler(), context.getClass()],
      );
      if (isPublic) return true;

      const request = context.switchToHttp().getRequest<ProtectedRequest>();
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        this.logger.warn('No token found in request headers');
        return yield* new AuthErrorClass({ code: 'UNAUTHORIZED' });
      }

      const payload = yield* this.authService.verifyToken(token);

      const valid = yield* this.authService.validatePayload(payload);
      if (!valid) {
        this.logger.warn('Invalid access token payload');
        return yield* new AuthErrorClass({
          code: 'INVALID_ACCESS_TOKEN',
        });
      }

      const userDto = yield* this.userService
        .findById(new Types.ObjectId(payload.sub))
        .pipe(
          Effect.mapError(() => {
            this.logger.warn('User not found for the provided access token');
            return new AuthErrorClass({ code: 'USER_NOT_REGISTERED' });
          }),
        );

      const keystore = yield* this.authService.findKeystore(
        userDto,
        payload.prm,
      );

      request.user = new User(userDto);
      request.keystore = keystore;

      return true;
    });

    return runNest(authGuardFlow, mapToHttpExceptionV2);
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
