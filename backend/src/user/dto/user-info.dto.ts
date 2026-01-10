import { copy } from '@common/copier';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@user/schemas/user.schema';
import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class UserInfoDto {
  @IsOptional()
  @ApiProperty({
    type: String,
    description: "new user's full name",
    required: false,
  })
  @Type(() => String)
  readonly name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    description: "current user's password",
    required: false,
  })
  @Type(() => String)
  readonly password?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    description: "new user's password",
    required: false,
  })
  @Type(() => String)
  readonly new_password?: string;

  constructor(user: User) {
    if (user == null) return;
    Object.assign(this, copy(user, ['_id', 'name']));
  }
}
