import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { setLogger } from './common/logger/logger';
import { createPinoLogger } from './common/logger/pino.logger';
import { requestLogger } from './common/middlewares/request-logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', { infer: true });
  const logger = createPinoLogger(configService);
  setLogger(logger);
  app.use(requestLogger);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ResponseTransformInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.listen(port);
  logger.info({ port }, '🚀 Server running');
}
bootstrap();
