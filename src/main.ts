import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import type { AppConfig } from '../libs/shared/src';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app')!;

  app.enableCors({
    origin: appConfig.cors.origin,
    credentials: appConfig.cors.credentials,
  });

  if (appConfig.security.helmet) {
    app.use(helmet());
  }

  if (appConfig.security.morgan) {
    app.use(morgan('combined'));
  }

  app.use(cookieParser(appConfig.cookie.secret));
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: appConfig.validation.transform,
      whitelist: appConfig.validation.whitelist,
      forbidNonWhitelisted: appConfig.validation.forbidNonWhitelisted,
      transformOptions: {
        enableImplicitConversion: appConfig.validation.enableImplicitConversion,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('HellTV API')
    .setDescription('API для управления балансом пользователей и транзакциями')
    .setVersion('1.0')
    .addTag('balance', 'Операции с балансом пользователей')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(appConfig.port, appConfig.host);
  Logger.log(`⚙️  Environment: ${appConfig.environment}`);
  Logger.log(
    `🚀 Application is running on: http://${appConfig.host}:${appConfig.port}`,
  );
}
bootstrap().catch((error) => {
  Logger.error('Error starting application:', error);
  process.exit(1);
});
