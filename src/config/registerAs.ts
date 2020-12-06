import { registerAs } from '@nestjs/config';

export enum ConfigAs {
  DATABASE = 'DATABASE',
  APP = 'APP',
}

export const databaseConfigAs = registerAs(ConfigAs.DATABASE, () => ({
  host: process.env.TYPEORM_HOST,
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
}));
export const appConfigAs = registerAs(ConfigAs.APP, () => {
  const isDev = process.env.NODE_ENV === 'development';
  return { isDev };
});
