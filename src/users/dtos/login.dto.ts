import { ObjectType, Field, PickType, InputType } from '@nestjs/graphql';
import { CommonOutput } from '~/common/dtos/output.dto';
import { User } from '~/users/entities/user.entity';

@InputType()
export class LoginInput extends PickType(User, ['email', 'password'], InputType) {}

@ObjectType()
export class LoginOutput extends CommonOutput {
  @Field(type => String, { nullable: true })
  token?: string;
}
