import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UserTokensDto {
  @IsNotEmpty()
  @ApiProperty()
  readonly accessToken!: string;

  @IsNotEmpty()
  @ApiProperty()
  readonly refreshToken!: string;

  constructor(tokens: UserTokensDto) {
    Object.assign(this, tokens);
  }
}
