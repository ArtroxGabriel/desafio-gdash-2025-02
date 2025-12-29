import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { RoleDto } from '@user/dto/role.dto';
import { Types } from 'mongoose';

export enum RoleCode {
  VIEWER = 'VIEWER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
}

@Schema({ collection: 'roles', versionKey: false, timestamps: true })
export class Role {
  readonly _id: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    unique: true,
    enum: Object.values(RoleCode),
  })
  readonly code: RoleCode;

  @Prop({ default: true })
  readonly status: boolean;

  constructor(roleDto: RoleDto) {
    this._id = roleDto.id;
    this.code = roleDto.code;
    this.status = roleDto.status;
  }
}

export const RoleSchema = SchemaFactory.createForClass(Role);

RoleSchema.index({ code: 1, status: 1 });
