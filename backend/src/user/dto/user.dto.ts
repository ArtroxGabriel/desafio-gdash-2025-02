import { IsMongoIdObject } from '@common/mongoid.validation';
import { User } from '@user/schemas/user.schema';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';
import { RoleDto } from './role.dto';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @IsMongoIdObject()
  @ApiProperty({ type: String, description: "user's unique identifier" })
  readonly id: Types.ObjectId;

  @IsEmail()
  @ApiProperty({ type: String, description: "user's email address" })
  readonly email: string;

  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: "user's full name",
    required: false,
  })
  readonly name?: string;

  @ValidateNested()
  @IsArray()
  @ApiProperty({
    type: RoleDto,
    description: "user's roles",
    isArray: true,
  })
  readonly roles: RoleDto[];

  @Exclude()
  readonly password?: string;

  @Exclude()
  readonly status: boolean;

  constructor(user: User) {
    this.id = user._id;
    this.name = user.name;
    this.email = user.email;
    this.roles = user.roles.map((role) => new RoleDto(role));
    this.password = user.password;
    this.status = user.status;
  }
}
