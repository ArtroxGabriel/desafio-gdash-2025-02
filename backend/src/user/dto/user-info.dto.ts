import { copy } from '@common/copier';
import { IsMongoIdObject } from '@common/mongoid.validation';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';
import { User } from '../schemas/user.schema';

export class UserInfoDto {
  @IsMongoIdObject()
  readonly _id!: Types.ObjectId;

  @IsNotEmpty()
  @IsOptional()
  readonly name?: string;

  constructor(user: User) {
    Object.assign(this, copy(user, ['_id', 'name']));
  }
}
