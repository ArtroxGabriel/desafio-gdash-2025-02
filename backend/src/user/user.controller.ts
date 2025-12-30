import { isFail } from '@common/result';
import { SearchParams } from '@core/http/query/query';
import {
  ApiPaginatedResponse,
  SearchQuery,
} from '@core/http/query/query.decorator';
import type { ProtectedRequest } from '@core/http/request';
import { PaginationResponseDTO, StatusCode } from '@core/http/response';
import { Controller, Get, Query, Request } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { mapToHttpException } from './user.error';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @SearchQuery()
  @ApiPaginatedResponse(UserDto, 'Retrieved users successfully')
  async getUsers(
    @Query() search: SearchParams,
  ): Promise<PaginationResponseDTO<UserDto>> {
    const result = await this.userService.findAll(search.page, search.limit);
    if (isFail(result)) {
      throw mapToHttpException(result.error);
    }

    const { data: paginationData, total } = result.value;

    return new PaginationResponseDTO(
      StatusCode.SUCCESS,
      'Users Fetched successfully',
      paginationData,
      total,
      search.page,
      search.limit,
    );
  }

  @Get('my')
  async findMy(@Request() request: ProtectedRequest): Promise<UserDto> {
    const result = await this.userService.findPrivateProfile(request.user);
    if (isFail(result)) {
      throw mapToHttpException(result.error);
    }

    return result.value;
  }
}
