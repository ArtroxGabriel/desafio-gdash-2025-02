import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class SignUpBasicDto {
  @IsEmail()
  @ApiProperty({
    type: String,
    description: "user's email address",
    required: true,
  })
  readonly email!: string;

  @MinLength(6)
  @MaxLength(100)
  @ApiProperty({
    description: "user's password",
    required: true,
    type: String,
    minLength: 6,
    maxLength: 100,
  })
  readonly password!: string;

  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  @ApiProperty({
    description: "user's full name",
    required: true,
    type: String,
    minLength: 2,
    maxLength: 200,
  })
  readonly name!: string;
}
