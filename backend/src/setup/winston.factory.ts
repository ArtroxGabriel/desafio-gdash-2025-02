import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  utilities,
  WinstonModuleOptions,
  WinstonModuleOptionsFactory,
} from 'nest-winston';
import { resolve } from 'path';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { ServerConfig, ServerConfigName } from '../config/server.config';

@Injectable()
export class WinstonFactory implements WinstonModuleOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createWinstonModuleOptions(): WinstonModuleOptions {
    const serverConfig =
      this.configService.getOrThrow<ServerConfig>(ServerConfigName);
    const logsPath = resolve(__dirname, '../..', serverConfig.logDirectory);
    const logLevel = serverConfig.nodeEnv === 'development' ? 'debug' : 'info';

    const dailyRotateFile = new DailyRotateFile({
      level: logLevel,
      dirname: logsPath,
      filename: '%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      handleExceptions: true,
      maxSize: '20m',
      maxFiles: '14d',
    });

    return {
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console({
          level: logLevel,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            utilities.format.nestLike('WeatherAPI', {
              colors: true,
              prettyPrint: true,
              processId: true,
              appName: true,
            }),
          ),
        }),
        dailyRotateFile,
      ],
      exitOnError: false,
    };
  }
}
