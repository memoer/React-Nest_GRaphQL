import { PickType, ObjectType, InputType } from '@nestjs/graphql';
import { User } from '~/users/entities/user.entity';
import { CommonOutput } from '~/common/dtos/output.dto';

@InputType()
export class CreateAccountInput extends PickType(User, ['email', 'password', 'role'], InputType) {}

@ObjectType()
export class CreateAccountOutput extends CommonOutput {}
