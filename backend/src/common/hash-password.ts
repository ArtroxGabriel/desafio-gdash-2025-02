import { compare, hash } from 'bcrypt';
import { Effect } from 'effect';

export const hashPassword = (password: string) =>
  Effect.promise(() => hash(password, 10));

export const comparePassword = (password: string, hashedPassword: string) =>
  Effect.promise(() => compare(password, hashedPassword));
