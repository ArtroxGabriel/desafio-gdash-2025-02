import { ApiKey } from '@auth/schemas/apikey.schema';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class ApiKeyDto {
  @Exclude()
  readonly apiKey: ApiKey;

  @Expose({
    name: 'api-key',
  })
  @IsString()
  @ApiProperty({ description: 'The API key string', type: String })
  get key() {
    return this.apiKey.key;
  }

  constructor(apiKey: ApiKey) {
    this.apiKey = apiKey;
  }
}
