import { AuthErrorClass, mapToHttpException } from '@auth/auth.error';
import { AuthService } from '@auth/auth.service';
import { Permissions } from '@auth/decorators/permissions.decorator';
import { VERIFY_API_KEY } from '@auth/decorators/public.decorator';
import { Permission } from '@auth/schemas/apikey.schema';
import { runNest } from '@common/effect-util';
import { HeaderName } from '@core/http/header';
import { PublicRequest } from '@core/http/request';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Effect } from 'effect';

@Injectable()
export class ApikeyGuard implements CanActivate {
  private readonly logger = new Logger(ApikeyGuard.name);

  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const apiKeyGuardFlow = Effect.gen(this, function* () {
      const shouldVerify =
        this.reflector.getAllAndOverride<boolean>(VERIFY_API_KEY, [
          context.getHandler(),
          context.getClass(),
        ]) ?? false;
      if (!shouldVerify) return true;

      const permissions = this.reflector.get(
        Permissions,
        context.getClass(),
      ) ?? [Permission.GENERAL];
      if (!permissions) {
        this.logger.warn('No permissions found on route, denying access');
        return yield* new AuthErrorClass({ code: 'FORBIDDEN' });
      }

      const request = context.switchToHttp().getRequest<PublicRequest>();

      const key = request.headers[HeaderName.API_KEY]?.toString();
      if (!key) {
        this.logger.debug('Request headers:', request.headers);
        this.logger.warn('No API key found on request headers, denying access');
        return yield* new AuthErrorClass({ code: 'FORBIDDEN' });
      }

      const apiKey = yield* this.authService.findApiKey(key).pipe(
        Effect.mapError(() => {
          this.logger.warn('API key not found, denying access');
          return new AuthErrorClass({ code: 'FORBIDDEN' });
        }),
      );

      request.apiKey = apiKey;

      for (const askedPermission of permissions) {
        for (const allowedPermission of apiKey.permissions) {
          if (allowedPermission === askedPermission) return true;
        }
      }

      this.logger.warn(
        `API key does not have required permissions: ${permissions.join(
          ', ',
        )}, denying access`,
      );
      return yield* new AuthErrorClass({ code: 'FORBIDDEN' });
    });

    return runNest(apiKeyGuardFlow, mapToHttpException);
  }
}
