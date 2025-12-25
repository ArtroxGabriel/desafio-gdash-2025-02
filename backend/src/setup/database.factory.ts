import { Injectable, Logger } from '@nestjs/common';
import {
  MongooseOptionsFactory,
  MongooseModuleOptions,
} from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { DatabaseConfig, DatabaseConfigName } from '../config/database.config';
import { ServerConfig, ServerConfigName } from '../config/server.config';
import mongoose from 'mongoose';

@Injectable()
export class DatabaseFactory implements MongooseOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createMongooseOptions(): MongooseModuleOptions {
    const dbConfig =
      this.configService.getOrThrow<DatabaseConfig>(DatabaseConfigName);

    const { user, host, port, name, minPoolSize, maxPoolSize } = dbConfig;

    const password = encodeURIComponent(dbConfig.password);

    // TODO: why only works with authSource=admin?
    const uri = `mongodb://${user}:${password}@${host}:${port}/${name}?authSource=admin`;

    const serverConfig =
      this.configService.getOrThrow<ServerConfig>(ServerConfigName);
    if (serverConfig.nodeEnv == 'development') mongoose.set({ debug: true });

    Logger.debug('Database URI: ' + uri);

    return {
      uri: uri,
      autoIndex: true,
      minPoolSize: minPoolSize,
      maxPoolSize: maxPoolSize,
      connectTimeoutMS: 60000,
      socketTimeoutMS: 45000,
    };
  }
}
