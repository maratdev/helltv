export interface AppConfig {
  port: number;
  host: string;
  environment: 'development' | 'production' | 'test';
  cors: {
    origin: string[];
    credentials: boolean;
  };
  cookie: {
    secret: string;
    maxAge: number;
    secure: boolean;
    httpOnly: boolean;
    sameSite: 'strict' | 'lax' | 'none';
  };
  validation: {
    transform: boolean;
    whitelist: boolean;
    forbidNonWhitelisted: boolean;
    enableImplicitConversion: boolean;
  };
  security: {
    helmet: boolean;
    morgan: boolean;
  };
}

export const defaultAppConfig: AppConfig = {
  port: 3000,
  host: '0.0.0.0',
  environment: 'development',
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  },
  cookie: {
    secret: 'your-secret-key',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: false,
    httpOnly: true,
    sameSite: 'lax',
  },
  validation: {
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    enableImplicitConversion: true,
  },
  security: {
    helmet: true,
    morgan: true,
  },
};
