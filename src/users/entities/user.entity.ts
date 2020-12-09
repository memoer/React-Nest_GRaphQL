import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { InternalServerErrorException } from '@nestjs/common';
import { Entity, Column, BeforeInsert, BeforeUpdate } from 'typeorm';
import { IsEmail, IsString, IsEnum } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { CoreEntity } from '~/common/entities/core.entity';

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
  @IsEmail()
  email: string;

  @Field(type => String)
  @Column({ select: false }) // 명시적으로 select password 를 적어주지 않을 경우엔 query에 대한 답으로 password 를 넘겨주지 않는다.
  @IsString()
  password: string;

  @Column({ default: false })
  @Field(type => Boolean, { defaultValue: false })
  verified: boolean;

  @Column({ type: 'enum', enum: UserRole })
  @Field(type => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    try {
      if (this.password) {
        // query에 대한 답에 password가 있을 경우 안의 로직을 실행한다.
        // 즉, 명시적으로 select password를 적어주지 않을 경우, 아래 로직이 실행되지 않는 것.
        this.password = await bcrypt.hash(this.password, 10);
      }
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async checkPassword(plainPassword): Promise<boolean> {
    try {
      const ok = await bcrypt.compare(plainPassword, this.password);
      return ok;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }
}
