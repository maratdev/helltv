export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
};

export const cacheConfig = {
  ttl: {
    balance: 30000, // 30 секунд для баланса
    transactions: 300000, // 5 минут для транзакций
    user: 300000, // 5 минут для пользователя
    default: 300000, // 5 минут по умолчанию
  },
  keyPrefix: {
    balance: 'balance:',
    transactions: 'transactions:',
    user: 'user:',
  },
};
