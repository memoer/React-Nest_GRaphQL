import { ObjectType, Field } from '@nestjs/graphql';
import { Column, Entity, OneToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { IsString, ValidateNested } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';
import { CoreEntity } from '~/common/entities/core.entity';
import { User } from './user.entity';

@ObjectType()
@Entity()
export class Verification extends CoreEntity {
  @Column()
  @Field(type => String)
  @IsString()
  code: string;

  @OneToOne(type => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  @ValidateNested()
  user: User;

  @BeforeInsert()
  createCode(): void {
    this.code = uuidv4();
  }
}
