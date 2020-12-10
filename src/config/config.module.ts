import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { databaseConfig, appConfig } from './registerAs';

export default ConfigModule.forRoot({
  isGlobal: true,
  // .env -> shared environment variables
  envFilePath: ['.env', `.env.${process.env.NODE_ENV}`],
  ignoreEnvFile: process.env.NODE_ENV === 'production',
  load: [databaseConfig, appConfig],
  validationSchema: Joi.object({
    NODE_ENV: Joi.string()
      .valid('development', 'production', 'test')
      .required(),
    TYPEORM_HOST: Joi.string().required(),
    TYPEORM_USERNAME: Joi.string().required(),
    TYPEORM_PASSWORD: Joi.string().required(),
    TYPEORM_DATABASE: Joi.string().required(),
    SECRET_KEY: Joi.string().required(),
  }),
});
