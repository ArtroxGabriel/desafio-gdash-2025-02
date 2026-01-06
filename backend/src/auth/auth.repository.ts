import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@user/schemas/user.schema';
import { Model, Types } from 'mongoose';
import { ApiKey } from './schemas/apikey.schema';
import { Keystore } from './schemas/keystore.schema';
import { Role, RoleCode } from './schemas/role.schema';
import { AuthErrorClass } from './auth.error';
import { Effect } from 'effect';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectModel(ApiKey.name) private readonly apikeyModel: Model<ApiKey>,
    @InjectModel(Keystore.name) private readonly keystoreModel: Model<Keystore>,
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
  ) {}

  findRole(roleCode: RoleCode): Effect.Effect<Role | null, AuthErrorClass> {
    return tryPromise(() =>
      this.roleModel
        .findOne({
          code: roleCode,
          status: true,
        })
        .lean()
        .exec(),
    );
  }

  deleteRole(role: Role): Effect.Effect<Role | null, AuthErrorClass> {
    return tryPromise(() =>
      this.roleModel.findByIdAndDelete(role._id).lean().exec(),
    );
  }

  findApiKey(key: string): Effect.Effect<ApiKey | null, AuthErrorClass> {
    return tryPromise(() =>
      this.apikeyModel.findOne({ key: key, status: true }).lean().exec(),
    );
  }

  createApiKey(
    apikey: Omit<ApiKey, '_id' | 'status'>,
  ): Effect.Effect<ApiKey, AuthErrorClass> {
    return tryPromise(async () => {
      const created = await this.apikeyModel.create(apikey);
      return created.toObject();
    });
  }

  deleteApiKey(apikey: ApiKey): Effect.Effect<ApiKey | null, AuthErrorClass> {
    return tryPromise(() =>
      this.apikeyModel.findByIdAndDelete(apikey._id).lean().exec(),
    );
  }

  createKeystore(
    client: User,
    primaryKey: string,
    secondaryKey: string,
  ): Effect.Effect<Keystore, AuthErrorClass> {
    return tryPromise(async () => {
      const keystore = await this.keystoreModel.create({
        client: client,
        primaryKey: primaryKey,
        secondaryKey: secondaryKey,
      });
      return keystore.toObject();
    });
  }

  removeKeystore(
    clientId: Types.ObjectId,
  ): Effect.Effect<Keystore | null, AuthErrorClass> {
    return tryPromise(() =>
      this.keystoreModel.findByIdAndDelete(clientId).lean().exec(),
    );
  }

  findKeystore(
    client: User,
    key: string,
  ): Effect.Effect<Keystore | null, AuthErrorClass> {
    return tryPromise(() =>
      this.keystoreModel
        .findOne({
          client: client,
          primaryKey: key,
          status: true,
        })
        .lean()
        .exec(),
    );
  }

  findTokensKeystore(
    client: User,
    primaryKey: string,
    secondaryKey: string,
  ): Effect.Effect<Keystore | null, AuthErrorClass> {
    return tryPromise(() =>
      this.keystoreModel
        .findOne({
          client: client,
          primaryKey: primaryKey,
          secondaryKey: secondaryKey,
          status: true,
        })
        .lean()
        .exec(),
    );
  }
}

const tryPromise = <T>(tryFunc: () => Promise<T>) =>
  Effect.tryPromise({
    try: tryFunc,
    catch: (error) =>
      new AuthErrorClass({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
  });
