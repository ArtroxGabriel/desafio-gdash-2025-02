import { AuthService } from '@auth/auth.service';
import { Permissions } from '@auth/decorators/permissions.decorator';
import { VERIFY_API_KEY } from '@auth/decorators/public.decorator';
import { Permission } from '@auth/schemas/apikey.schema';
import { isFail } from '@common/result';
import { HeaderName } from '@core/http/header';
import { PublicRequest } from '@core/http/request';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ApikeyGuard implements CanActivate {
  private readonly logger = new Logger(ApikeyGuard.name);

  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const shouldVerify =
      this.reflector.getAllAndOverride<boolean>(VERIFY_API_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? false;
    if (!shouldVerify) return true;

    const permissions = this.reflector.get(Permissions, context.getClass()) ?? [
      Permission.GENERAL,
    ];
    if (!permissions) {
      this.logger.warn('No permissions found on route, denying access');
      throw new ForbiddenException();
    }

    const request = context.switchToHttp().getRequest<PublicRequest>();

    const key = request.headers[HeaderName.API_KEY]?.toString();
    if (!key) {
      this.logger.debug('Request headers:', request.headers);
      this.logger.warn('No API key found on request headers, denying access');
      throw new ForbiddenException();
    }

    const apiKeyResult = await this.authService.findApiKey(key);
    if (isFail(apiKeyResult)) {
      this.logger.warn('Invalid API key, denying access');
      throw new ForbiddenException();
    }

    const apiKey = apiKeyResult.value;
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
    throw new ForbiddenException();
  }
}
