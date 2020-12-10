import { ObjectType, PartialType, InputType, PickType } from '@nestjs/graphql';
import { CommonOutput } from '~/common/dtos/output.dto';
import { User } from '~/users/entities/user.entity';

@ObjectType()
export class EditProfileOutput extends CommonOutput {}

@InputType()
export class EditProfileInput extends PartialType(
  PickType(User, ['email', 'password']),
  InputType,
) {}
