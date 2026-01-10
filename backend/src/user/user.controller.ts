import { runNest } from '@common/effect-util';
import { MongoIdTransformer } from '@common/mongoid.transformer';
import { HeaderName } from '@core/http/header';
import { SearchParams } from '@core/http/query/query';
import {
  ApiPaginatedResponse,
  SearchQuery,
} from '@core/http/query/query.decorator';
import type { ProtectedRequest } from '@core/http/request';
import { PaginationResponseDTO, StatusCode } from '@core/http/response';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Query,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { Effect } from 'effect';
import { Types } from 'mongoose';
import { UserInfoDto } from './dto/user-info.dto';
import { UserDto } from './dto/user.dto';
import { mapToHttpException } from './user.error';
import { UserService } from './user.service';

@ApiBearerAuth(HeaderName.AUTHORIZATION)
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

  @Patch()
  @ApiOkResponse({
    description: 'Updated User successfully',
    schema: { $ref: getSchemaPath(UserDto) },
  })
  async updateUser(
    @Request() request: ProtectedRequest,
    @Body() updateUserDto: UserInfoDto,
  ) {
    this.logger.log(`Starting to update user`);

    if (updateUserDto.new_password && !updateUserDto.password) {
      throw new BadRequestException(
        'Current password is required to set a new password',
      );
    }

    const program = this.userService.updateProfile(
      request.user._id,
      updateUserDto,
    );

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
