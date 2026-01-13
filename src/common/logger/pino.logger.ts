import pino, { Logger } from 'pino';
import { ConfigService } from '@nestjs/config';

export function createPinoLogger(config: ConfigService): Logger {
  const env = config.get<string>('app.environment') ?? 'development';
  const isProd = env === 'production';

  return pino({
    level: config.get<string>('logging.level') ?? 'info',
    transport: isProd
      ? undefined
      : {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
    base: {
      app: config.get<string>('app.name') ?? 'app',
      version: config.get<string>('app.version') ?? '0.0.0',
      env,
    },
  });
}
