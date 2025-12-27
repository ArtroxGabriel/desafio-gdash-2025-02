import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@user/schemas/user.schema';
import { Model, Types } from 'mongoose';
import { ApiKey } from './schemas/apikey.schema';
import { Keystore } from './schemas/keystore.schema';
import { Role, RoleCode } from './schemas/role.schema';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectModel(ApiKey.name) private readonly apikeyModel: Model<ApiKey>,
    @InjectModel(Keystore.name) private readonly keystoreModel: Model<Keystore>,
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
  ) {}

  async findRole(roleCode: RoleCode): Promise<Role | null> {
    return this.roleModel
      .findOne({
        code: roleCode,
        status: true,
      })
      .lean()
      .exec();
  }

  async deleteRole(role: Role): Promise<Role | null> {
    return this.roleModel.findByIdAndDelete(role._id).lean().exec();
  }

  async findApiKey(key: string): Promise<ApiKey | null> {
    return this.apikeyModel.findOne({ key: key, status: true }).lean().exec();
  }

  async createApiKey(apikey: Omit<ApiKey, '_id' | 'status'>): Promise<ApiKey> {
    const created = await this.apikeyModel.create(apikey);
    return created.toObject();
  }

  async deleteApiKey(apikey: ApiKey): Promise<ApiKey | null> {
    return this.apikeyModel.findByIdAndDelete(apikey._id).lean().exec();
  }

  async createKeystore(
    client: User,
    primaryKey: string,
    secondaryKey: string,
  ): Promise<Keystore> {
    const keystore = await this.keystoreModel.create({
      client: client,
      primaryKey: primaryKey,
      secondaryKey: secondaryKey,
    });
    return keystore.toObject();
  }

  async removeKeystore(clientId: Types.ObjectId): Promise<Keystore | null> {
    return this.keystoreModel.findByIdAndDelete(clientId).lean().exec();
  }

  async findKeystore(client: User, key: string): Promise<Keystore | null> {
    return this.keystoreModel
      .findOne({
        client: client,
        primaryKey: key,
        status: true,
      })
      .lean()
      .exec();
  }

  async findTokensKeystore(
    client: User,
    primaryKey: string,
    secondaryKey: string,
  ): Promise<Keystore | null> {
    return this.keystoreModel
      .findOne({
        client: client,
        primaryKey: primaryKey,
        secondaryKey: secondaryKey,
        status: true,
      })
      .lean()
      .exec();
  }
}
