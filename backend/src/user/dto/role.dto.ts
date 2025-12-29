import { Types } from 'mongoose';
import { Role, RoleCode } from '@auth/schemas/role.schema';
import { IsNotEmpty } from 'class-validator';
import { IsMongoIdObject } from '@common/mongoid.validation';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';

export class RoleDto {
  @IsMongoIdObject()
  @Type(() => String)
  @ApiProperty({ description: 'Unique identifier', type: String })
  readonly id: Types.ObjectId;

  @IsNotEmpty()
  @ApiProperty({ enum: RoleCode })
  readonly code: RoleCode;

  @Exclude()
  readonly status: boolean;

  constructor(role: Role) {
    this.id = role._id;
    this.code = role.code;
    this.status = role.status;
  }
}
