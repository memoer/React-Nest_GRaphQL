import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigType } from '@nestjs/config';
import { GqlModuleAsyncOptions, GqlModuleOptions } from '@nestjs/graphql';
import { join } from 'path';
import { databaseConfig, appConfig } from './config/registerAs';

export const typeORMFactory: TypeOrmModuleAsyncOptions['useFactory'] = (
  _appConfig: ConfigType<typeof appConfig>,
  _databaseConfig: ConfigType<typeof databaseConfig>,
) => {
  const dbConfig = _databaseConfig;
  const { isProd, env } = _appConfig;
  return {
    type: 'postgres',
    port: 5432,
    logging: env === 'development',
    synchronize: !isProd,
    entities: [join(__dirname + '/**/*.entity{.ts,.js}')],
    ...dbConfig,
  };
};

export const graphQLFactory: GqlModuleAsyncOptions['useFactory'] = (
  _appConfig: ConfigType<typeof appConfig>,
) => {
  const { isProd } = _appConfig;
  const context = ({ req }) => ({ user: req['user'] });
  const options: Partial<GqlModuleOptions> = {
    context,
    playground: !isProd,
    introspection: !isProd,
    debug: !isProd,
    uploads: {
      maxFileSize: 10000000, // 10 MB
      maxFiles: 5,
    },
    sortSchema: !isProd,
  };
  if (!isProd) {
    options.autoSchemaFile = join(process.cwd(), 'src/schema.gql');
  } else {
    options.typeDefs = ['dist/schema.graphql'];
  }
  return options;
};
