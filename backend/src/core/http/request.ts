import { ApiKey } from '@auth/schemas/apikey.schema';
import { Keystore } from '@auth/schemas/keystore.schema';
import { User } from '@user/schemas/user.schema';
import { Request } from 'express';

export type PublicRequest = Request & {
  apiKey: ApiKey;
};

export type RoleRequest = PublicRequest & {
  currentRoleCodes: string[];
};

export type ProtectedRequest = RoleRequest & {
  user: User;
  accessToken: string;
  keystore: Keystore;
};
