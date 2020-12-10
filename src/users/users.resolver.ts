import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '~/auth/auth.guard';
import { AuthUser } from '~/auth/auth.decorator';
import { CommonOutput } from '~/common/dtos/output.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { CreateAccountOutput, CreateAccountInput } from './dtos/create-account.dto';
import { LoginOutput, LoginInput } from './dtos/login.dto';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { EditProfileOutput, EditProfileInput } from './dtos/edit-profile.dto';
import { VerifyEmailOutput, VerifyEmailInput } from './dtos/verify-email';

@Resolver(of => User)
export class UsersResolver {
  constructor(private readonly _usersService: UsersService) {}
  @Query(returns => Boolean)
  hi() {
    return true;
  }

  @UseGuards(AuthGuard)
  @Query(returns => User)
  me(@AuthUser() user: User): User {
    return user;
  }

  @UseGuards(AuthGuard)
  @Query(returns => UserProfileOutput)
  async userProfile(@Args() userProfileInput: UserProfileInput): Promise<UserProfileOutput> {
    try {
      const user = await this._usersService.getUserById(userProfileInput.userId);
      return user ? { ok: true, user } : { ok: false, error: 'User Not Found' };
    } catch (error) {
      return { ok: false, error };
    }
  }

  @Mutation(returns => CreateAccountOutput)
  createAccount(@Args('input') createAccountInput: CreateAccountInput): Promise<CommonOutput> {
    return this._usersService.createAccount(createAccountInput);
  }

  @Mutation(returns => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    try {
      return await this._usersService.login(loginInput);
    } catch (error) {
      return { ok: false, error };
    }
  }

  @UseGuards(AuthGuard)
  @Mutation(returns => EditProfileOutput)
  async editProfile(
    @AuthUser() user: User,
    @Args('input') editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      await this._usersService.editProfile(user.id, editProfileInput);
      return { ok: true };
    } catch (error) {
      return { ok: false, error };
    }
  }

  @Mutation(returns => VerifyEmailOutput)
  async verifyEmail(@Args('input') verifyEmailInput: VerifyEmailInput): Promise<VerifyEmailOutput> {
    try {
      return this._usersService.verifyEmail(verifyEmailInput);
    } catch (error) {
      return { ok: false, error };
    }
  }
}
