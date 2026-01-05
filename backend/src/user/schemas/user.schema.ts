import { Role } from '@auth/schemas/role.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserDto } from '@user/dto/user.dto';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'users', versionKey: false, timestamps: true })
export class User {
  readonly _id: Types.ObjectId;

  @Prop({ trim: true, maxlength: 200 })
  name?: string;

  @Prop({ unique: true, required: true, trim: true, select: false })
  email: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: Role.name }] })
  roles: Role[];

  @Prop({
    select: false,
    required: true,
    trim: true,
    minlength: 6,
    maxlength: 100,
  })
  password?: string;

  @Prop({ default: true })
  readonly status!: boolean;

  constructor(userDto: UserDto) {
    this._id = userDto.id;
    this.name = userDto.name;
    this.email = userDto.email;
    this.roles = userDto.roles.map((roleDto) => new Role(roleDto));
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ _id: 1, status: 1 });
UserSchema.index({ email: 1, status: 1 });
