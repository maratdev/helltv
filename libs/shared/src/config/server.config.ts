import { registerAs } from '@nestjs/config';
import { AppConfig, defaultAppConfig } from './app.config';

export default registerAs('app', (): AppConfig => {
  return {
    port: parseInt(process.env.PORT || String(defaultAppConfig.port), 10),
    host: process.env.HOST || defaultAppConfig.host,
    environment:
      (process.env.NODE_ENV as AppConfig['environment']) ||
      defaultAppConfig.environment,
    cors: {
      origin: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',')
        : defaultAppConfig.cors.origin,
      credentials:
        process.env.CORS_CREDENTIALS === 'true' ||
        defaultAppConfig.cors.credentials,
    },
    cookie: {
      secret: process.env.COOKIE_SECRET || defaultAppConfig.cookie.secret,
      maxAge: parseInt(
        process.env.COOKIE_MAX_AGE || String(defaultAppConfig.cookie.maxAge),
        10,
      ),
      secure:
        process.env.COOKIE_SECURE === 'true' || defaultAppConfig.cookie.secure,
      httpOnly:
        process.env.COOKIE_HTTP_ONLY !== 'false' ||
        defaultAppConfig.cookie.httpOnly,
      sameSite:
        (process.env.COOKIE_SAME_SITE as AppConfig['cookie']['sameSite']) ||
        defaultAppConfig.cookie.sameSite,
    },
    validation: {
      transform:
        process.env.VALIDATION_TRANSFORM !== 'false' ||
        defaultAppConfig.validation.transform,
      whitelist:
        process.env.VALIDATION_WHITELIST !== 'false' ||
        defaultAppConfig.validation.whitelist,
      forbidNonWhitelisted:
        process.env.VALIDATION_FORBID_NON_WHITELISTED !== 'false' ||
        defaultAppConfig.validation.forbidNonWhitelisted,
      enableImplicitConversion:
        process.env.VALIDATION_ENABLE_IMPLICIT_CONVERSION !== 'false' ||
        defaultAppConfig.validation.enableImplicitConversion,
    },
    security: {
      helmet:
        process.env.HELMET_ENABLED !== 'false' ||
        defaultAppConfig.security.helmet,
      morgan:
        process.env.MORGAN_ENABLED !== 'false' ||
        defaultAppConfig.security.morgan,
    },
  };
});
