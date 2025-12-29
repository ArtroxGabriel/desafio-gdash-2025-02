import type { ProtectedRequest } from '@core/http/request';
import { Controller, Get, Request } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('my')
  async findMy(@Request() request: ProtectedRequest) {
    return this.userService.findPrivateProfile(request.user);
  }
}
