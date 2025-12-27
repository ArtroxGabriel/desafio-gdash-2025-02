import { IsNotEmptyObject, ValidateNested } from 'class-validator';
import { UserDto } from '../../user/dto/user.dto';
import { UserTokensDto } from './user-tokens.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UserAuthDto {
  @ValidateNested()
  @IsNotEmptyObject()
  @ApiProperty()
  readonly user: UserDto;

  @ValidateNested()
  @IsNotEmptyObject()
  @ApiProperty()
  readonly tokens: UserTokensDto;

  constructor(user: UserDto, tokens: UserTokensDto) {
    this.user = user;
    this.tokens = tokens;
  }
}
