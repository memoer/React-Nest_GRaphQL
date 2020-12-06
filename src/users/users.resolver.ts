import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { CreateAccountOutput, CreateAccountInput } from './dtos/create-account.dto';
import { CommonOutput } from 'common/dtos/output.dto';
import { basicWrapTryCatch } from 'lib/warpTryCatch';

@Resolver(of => User)
export class UsersResolver {
  constructor(private readonly _usersService: UsersService) {}
  @Query(returns => Boolean)
  hi() {
    return true;
  }
  @Mutation(returns => CreateAccountOutput)
  createAccount(@Args('input') createAccountInput: CreateAccountInput): Promise<CommonOutput> {
    const services = async () => {
      if (await this._usersService.getUserByEmail(createAccountInput.email)) {
        return { ok: false, error: 'There is a user with that email already' };
      }
      await this._usersService.createUser(createAccountInput);
      return { ok: true };
    };
    return basicWrapTryCatch(services);
  }
}
