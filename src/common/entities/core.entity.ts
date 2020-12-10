import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';

// 넣어주지 않으면 User Entity가 해당 클래스를 상속받아도 schema.gql 에 아래의 필드가 포함되지 않는다.
@ObjectType()
export abstract class CoreEntity {
  @PrimaryGeneratedColumn()
  @Field(type => Number)
  id: number;

  @CreateDateColumn()
  @Field(type => Date)
  createdAt: Date;

  @Field(type => Date)
  @UpdateDateColumn()
  updatedAt: Date;
}
