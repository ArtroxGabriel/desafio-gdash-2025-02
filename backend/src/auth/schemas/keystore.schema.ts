import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from '@user/schemas/user.schema';
import mongoose, { Types } from 'mongoose';

@Schema({ collection: 'keystores', versionKey: false, timestamps: true })
export class Keystore {
  readonly _id!: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  client!: User;

  @Prop({ required: true, trim: true })
  primaryKey!: string;

  @Prop({ required: true, trim: true })
  secondaryKey!: string;

  @Prop({ default: true })
  status!: boolean;
}

export const KeystoreSchema = SchemaFactory.createForClass(Keystore);

KeystoreSchema.index({ client: 1, primaryKey: 1, secondaryKey: 1, status: 1 });
