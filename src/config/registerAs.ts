import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('DATABASE_CONFIG', () => ({
  host: process.env.TYPEORM_HOST,
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
}));
export const appConfig = registerAs('APP_CONFIG', () => {
  const isProd = process.env.NODE_ENV === 'production';
  return { isProd, env: process.env.NODE_ENV, secretKey: process.env.SECRET_KEY };
});
