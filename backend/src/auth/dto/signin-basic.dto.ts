import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength, MinLength } from 'class-validator';

export class SignInBasicDto {
  @IsEmail()
  @ApiProperty()
  readonly email: string;

  @MinLength(6)
  @MaxLength(100)
  @ApiProperty()
  readonly password: string;
}
