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

export class UserDto {
  @IsMongoIdObject()
  readonly _id: Types.ObjectId;

  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsOptional()
  readonly name?: string;

  @ValidateNested()
  @IsArray()
  readonly roles: RoleDto[];

  @Exclude()
  readonly password?: string;

  @Exclude()
  readonly status: boolean;

  constructor(user: User) {
    this._id = user._id;
    this.name = user.name;
    this.email = user.email;
    this.roles = user.roles.map((role) => new RoleDto(role));
    this.password = user.password;
    this.status = user.status;
  }
}
