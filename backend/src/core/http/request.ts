import { Request } from 'express';

export type PublicRequest = Request;

export type RoleRequest = PublicRequest & {
  currentRoleCodes: string[];
};

export type ProtectedRequest = RoleRequest & {
  user: unknown; // User;
  accessToken: string;
  keystore: unknown; // Keystore;
};
