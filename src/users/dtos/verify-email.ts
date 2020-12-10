import { ObjectType, PickType, InputType } from '@nestjs/graphql';
import { CommonOutput } from '~/common/dtos/output.dto';
import { Verification } from '~/users/entities/verification.entity';

@ObjectType()
export class VerifyEmailOutput extends CommonOutput {}

@InputType()
export class VerifyEmailInput extends PickType(Verification, ['code'], InputType) {}
