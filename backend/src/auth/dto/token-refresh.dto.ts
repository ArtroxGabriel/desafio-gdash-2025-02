import { ApiProperty } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';

export class TokenRefreshDto {
  @MaxLength(2000)
  @ApiProperty()
  refreshToken!: string;
}
