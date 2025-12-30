import { IsNotEmptyObject, ValidateNested } from 'class-validator';
import { UserDto } from '../../user/dto/user.dto';
import { UserTokensDto } from './user-tokens.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UserAuthDto {
  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => UserDto)
  @ApiProperty()
  readonly user: UserDto;

  @ValidateNested()
  @Type(() => UserTokensDto)
  @IsNotEmptyObject()
  @ApiProperty()
  readonly tokens: UserTokensDto;

  constructor(user: UserDto, tokens: UserTokensDto) {
    this.user = user;
    this.tokens = tokens;
  }
}
