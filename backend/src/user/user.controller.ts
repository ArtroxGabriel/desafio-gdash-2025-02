import { MongoIdTransformer } from '@common/mongoid.transformer';
import { runNest } from '@common/effect-util';
import { SearchParams } from '@core/http/query/query';
import {
  ApiPaginatedResponse,
  SearchQuery,
} from '@core/http/query/query.decorator';
import type { ProtectedRequest } from '@core/http/request';
import { PaginationResponseDTO, StatusCode } from '@core/http/response';
import { Controller, Get, Logger, Param, Query, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { Effect } from 'effect';
import { Types } from 'mongoose';
import { UserDto } from './dto/user.dto';
import { mapToHttpException } from './user.error';
import { UserService } from './user.service';
import { HeaderName } from '@core/http/header';
import { Public } from '@auth/decorators/public.decorator';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(private readonly userService: UserService) {}

  @Public()
  @Get()
  @SearchQuery()
  @ApiPaginatedResponse(UserDto, 'Retrieved users successfully')
  async getUsers(
    @Query() search: SearchParams,
  ): Promise<PaginationResponseDTO<UserDto>> {
    this.logger.log('Starting to get users');

    const serviceEffect = this.userService.findAll(search.page, search.limit);

    const program = serviceEffect.pipe(
      Effect.map(
        ({ data, total }) =>
          new PaginationResponseDTO(
            StatusCode.SUCCESS,
            'Users Fetched successfully',
            data,
            total,
            search.page,
            search.limit,
          ),
      ),
    );

    return runNest(program, mapToHttpException);
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

    const program = this.userService.findPrivateProfile(request.user);
    return runNest(program, mapToHttpException);
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

    const program = this.userService.findById(id);
    return runNest(program, mapToHttpException);
  }

  @Get('email/:email')
  @ApiOkResponse({
    description: 'Retrieved User successfully',
    schema: { $ref: getSchemaPath(UserDto) },
  })
  async getUserByEmail(@Param('email') email: string): Promise<UserDto> {
    this.logger.log(`Starting to get user by email: ${email}`);

    const program = this.userService.findByEmail(email);
    return runNest(program, mapToHttpException);
  }
}
