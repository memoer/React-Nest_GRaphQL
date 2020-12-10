import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { appConfig, databaseConfig } from '~/config/registerAs';
import { JwtMiddleware } from '~/jwt/jwt.middleware';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { typeORMFactory, graphQLFactory } from './app.factories';
import { JwtModule } from './jwt/jwt.module';
import MyConfigModule from './config/config.module';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [
    MyConfigModule,
    TypeOrmModule.forRootAsync({
      useFactory: typeORMFactory,
      inject: [appConfig.KEY, databaseConfig.KEY],
    }),
    GraphQLModule.forRootAsync({
      useFactory: graphQLFactory,
      inject: [appConfig.KEY],
    }),
    JwtModule.forRoot({
      privateKey: process.env.SECRET_KEY,
    }),
    UsersModule,
    CommonModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({
      path: '/graphql',
      method: RequestMethod.POST,
    });
  }
}
