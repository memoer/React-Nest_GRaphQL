import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { GqlModuleAsyncOptions, GqlModuleOptions } from '@nestjs/graphql';
import { join } from 'path';
import { ConfigAs, databaseConfigAs, appConfigAs } from './config/registerAs';

export const typeORMFactory: TypeOrmModuleAsyncOptions['useFactory'] = (
  configService: ConfigService,
) => {
  const dbConfig = configService.get<ReturnType<typeof databaseConfigAs>>(
    ConfigAs.DATABASE,
  );
  const { isDev } = configService.get<ReturnType<typeof appConfigAs>>(
    ConfigAs.APP,
  );
  return {
    type: 'postgres',
    port: 5432,
    logging: isDev,
    synchronize: isDev,
    entities: [join(__dirname + '/**/*.entity{.ts,.js}')],
    ...dbConfig,
  };
};

export const graphQLFactory: GqlModuleAsyncOptions['useFactory'] = (
  configService: ConfigService,
) => {
  const { isDev } = configService.get<ReturnType<typeof appConfigAs>>(
    ConfigAs.APP,
  );
  const options: Partial<GqlModuleOptions> = {
    context: ({ req }) => ({ req }),
    playground: isDev,
    introspection: isDev,
    debug: isDev,
    uploads: {
      maxFileSize: 10000000, // 10 MB
      maxFiles: 5,
    },
  };
  if (isDev) {
    options.autoSchemaFile = 'schema.graphql';
  } else {
    options.typeDefs = ['dist/schema.graphql'];
  }
  return options;
};
