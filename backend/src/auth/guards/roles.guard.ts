import { Roles } from '@auth/decorators/role.decorator';
import { ProtectedRequest } from '@core/http/request';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    console.log('RolesGuard canActivate called');
    let roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) roles = this.reflector.get(Roles, context.getClass());
    if (roles) {
      const request = context.switchToHttp().getRequest<ProtectedRequest>();
      const user = request.user;
      if (!user) {
        this.logger.warn('User not found in request for role validation');
        throw new ForbiddenException('Permission Denied');
      }

      const hasRole = () =>
        user.roles.some((role) => !!roles.find((item) => item === role.code));

      if (!hasRole()) {
        this.logger.warn('User does not have required roles for access');
        throw new ForbiddenException('Permission Denied');
      }
    }

    return true;
  }
}
