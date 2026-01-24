export default () => ({
  app: {
    name: process.env.APPNAME,
    version: process.env.APPVERSION,
    port: Number(process.env.APP_PORT ?? 4000),
    environment: process.env.NODE_ENV || 'development',
  },
  database: {
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    name: process.env.POSTGRES_DB,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    pretty: process.env.LOG_PRETTY !== 'false',
  },
  auth: {
    accessTokenTtl: process.env.ACCESS_TOKEN_TTL || '15m',
    refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7),
  },
});
