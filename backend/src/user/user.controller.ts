import { isFail } from '@common/result';
import type { ProtectedRequest } from '@core/http/request';
import { Controller, Get, Request } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { mapToHttpException } from './user.error';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('my')
  async findMy(@Request() request: ProtectedRequest): Promise<UserDto> {
    const result = await this.userService.findPrivateProfile(request.user);
    if (isFail(result)) {
      throw mapToHttpException(result.error);
    }

    return result.value;
  }
}
