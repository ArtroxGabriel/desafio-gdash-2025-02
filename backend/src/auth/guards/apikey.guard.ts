import { AuthService } from '@auth/auth.service';
import { Permissions } from '@auth/decorators/permissions.decorator';
import { Permission } from '@auth/schemas/apikey.schema';
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

    const apiKey = await this.authService.findApiKey(key);
    if (!apiKey) {
      this.logger.warn('Invalid API key, denying access');
      throw new ForbiddenException();
    }

    request.apiKey = apiKey;

    for (const askedPermission of permissions) {
      for (const allowedPemission of apiKey.permissions) {
        if (allowedPemission === askedPermission) return true;
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
