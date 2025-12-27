import { ApiProperty } from '@nestjs/swagger';

export class TokenPayload {
  @ApiProperty()
  readonly aud: string;

  @ApiProperty()
  readonly sub: string;

  @ApiProperty()
  readonly iss: string;

  @ApiProperty()
  readonly iat: number;

  @ApiProperty()
  readonly exp: number;

  @ApiProperty()
  readonly prm: string;

  constructor(
    issuer: string,
    audience: string,
    subject: string,
    param: string,
    validity: number,
  ) {
    this.iss = issuer;
    this.aud = audience;
    this.sub = subject;
    this.iat = Math.floor(Date.now() / 1000);
    this.exp = this.iat + validity;
    this.prm = param;
  }
}
