import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { typeORMFactory, graphQLFactory } from './app.factories';
import MyConfigModule from './config/config.module';
@Module({
  imports: [
    MyConfigModule,
    TypeOrmModule.forRootAsync({
      useFactory: typeORMFactory,
      inject: [ConfigService],
    }),
    GraphQLModule.forRootAsync({
      useFactory: graphQLFactory,
      inject: [ConfigService],
    }),
    UsersModule,
    CommonModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
