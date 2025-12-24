import { registerAs } from '@nestjs/config';

export const DatabaseConfigName: string | symbol = 'database';

export type DatabaseConfig = {
  name: string;
  host: string;
  port: number;
  user: string;
  password: string;
  minPoolSize: number;
  maxPoolSize: number;
};

export default registerAs(DatabaseConfigName, () => ({
  name: process.env.MONGODB_NAME || '',
  host: process.env.MONGODB_HOST || '',
  port: parseInt(process.env.MONGODB_PORT || '27017'),
  user: process.env.MONGODB_USER || '',
  password: process.env.MONGODB_PASSWORD || '',
  minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || '5'),
  maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '10'),
}));
