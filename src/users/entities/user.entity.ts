import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { Entity, Column, BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CoreEntity } from 'common/entities/core.entity';
import { InternalServerErrorException } from '@nestjs/common';

enum UserRole {
  CLIENT,
  OWNER,
  DELIVERY,
}
registerEnumType(UserRole, { name: 'userRole' });

@ObjectType() // for GraphQL
@Entity() // for DB
export class User extends CoreEntity {
  @Column() // for DB
  @Field(type => String) // for GraphQl
  email: string;

  @Field(type => String)
  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @Field(type => UserRole)
  role: UserRole;

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
