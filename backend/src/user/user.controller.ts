import { MongoIdTransformer } from '@common/mongoid.transformer';
import { isFail } from '@common/result';
import { SearchParams } from '@core/http/query/query';
import {
  ApiPaginatedResponse,
  SearchQuery,
} from '@core/http/query/query.decorator';
import type { ProtectedRequest } from '@core/http/request';
import { PaginationResponseDTO, StatusCode } from '@core/http/response';
import { Controller, Get, Logger, Param, Query, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { UserDto } from './dto/user.dto';
import { mapToHttpException } from './user.error';
import { UserService } from './user.service';
import { HeaderName } from '@core/http/header';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(private readonly userService: UserService) {}

  @Get()
  @SearchQuery()
  @ApiPaginatedResponse(UserDto, 'Retrieved users successfully')
  async getUsers(
    @Query() search: SearchParams,
  ): Promise<PaginationResponseDTO<UserDto>> {
    this.logger.log('Starting to get users');

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
  @ApiBearerAuth(HeaderName.AUTHORIZATION)
  @ApiOkResponse({
    description: 'Retrieved User Private Profile successfully',
    schema: { $ref: getSchemaPath(UserDto) },
  })
  async findMy(@Request() request: ProtectedRequest): Promise<UserDto> {
    this.logger.log(
      `Starting to get private profile for user with ID ${request.user._id.toString()}`,
    );

    const result = await this.userService.findPrivateProfile(request.user);
    if (isFail(result)) {
      throw mapToHttpException(result.error);
    }

    return result.value;
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Retrieved User successfully',
    schema: { $ref: getSchemaPath(UserDto) },
  })
  async getUserById(
    @Param('id', MongoIdTransformer) id: Types.ObjectId,
  ): Promise<UserDto> {
    this.logger.log(`Starting to get user by ID: ${id.toString()}`);

    const result = await this.userService.findById(id);
    if (isFail(result)) {
      throw mapToHttpException(result.error);
    }

    return result.value;
  }

  @Get('email/:email')
  @ApiOkResponse({
    description: 'Retrieved User successfully',
    schema: { $ref: getSchemaPath(UserDto) },
  })
  async getUserByEmail(@Param('email') email: string): Promise<UserDto> {
    this.logger.log(`Starting to get user by email: ${email}`);

    const result = await this.userService.findByEmail(email);
    if (isFail(result)) {
      throw mapToHttpException(result.error);
    }

    return result.value;
  }
}
