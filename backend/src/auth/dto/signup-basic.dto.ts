import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class SignUpBasicDto {
  @IsEmail()
  readonly email: string;

  @MinLength(6)
  @MaxLength(100)
  readonly password: string;

  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  readonly name: string;
}
