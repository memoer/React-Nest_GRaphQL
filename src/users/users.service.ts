import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, InsertResult } from 'typeorm';
import { CommonOutput } from '~/common/dtos/output.dto';
import { JwtService } from '~/jwt/jwt.service';
import { User } from './entities/user.entity';
import { CreateAccountInput } from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { EditProfileInput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verify-email';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly _user: Repository<User>,
    @InjectRepository(Verification) private readonly _verification: Repository<Verification>,
    private readonly _jwtService: JwtService,
  ) {}
  getUserByEmail(email: User['email'], select?: string[]) {
    const query = this._user.createQueryBuilder().where('email = :email', { email });
    if (select) {
      query.select(select.map(data => `User.${data}`));
    }
    return query.getOne();
  }
  async getUserById(id: User['id']) {
    return this._user
      .createQueryBuilder()
      .where('id = :id', { id })
      .getOne();
  }
  createUser(input: CreateAccountInput): Promise<InsertResult> {
    return this._user
      .createQueryBuilder()
      .insert()
      .into(User)
      .values({ ...input })
      .execute();
  }
  async checkUser(email) {
    const user = await this.getUserByEmail(email);
    if (user) {
      throw 'There is a user with that email already';
    }
  }
  async createAccount({ email, password, role }: CreateAccountInput): Promise<CommonOutput> {
    try {
      const exists = await this._user.findOne({ email });
      if (exists) {
        return { ok: false, error: 'There is a user with that email already' };
      }
      const user = await this._user.save(this._user.create({ email, password, role }));
      this._verification.save(this._verification.create({ user }));
      return { ok: true };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.getUserByEmail(email, ['id', 'password']);
      if (!user) {
        return { ok: false, error: 'User not found' };
      }
      const isValid = await user.checkPassword(password);
      if (!isValid) {
        return { ok: false, error: 'Wrong Password' };
      }
      const token = this._jwtService.sign(user.id);
      return { ok: true, token };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async editProfile(userId: User['id'], editProfileInput: EditProfileInput) {
    const userEntity = await this.getUserById(userId);
    Object.keys(editProfileInput).forEach(async key => {
      userEntity[key] = editProfileInput[key];
      if (key === 'email') {
        userEntity.verified = false;
        await this._verification.save(this._verification.create({ user: userEntity }));
      }
    });
    return this._user.save(userEntity);
  }

  async verifyEmail({ code }: VerifyEmailInput): Promise<VerifyEmailOutput> {
    try {
      const verification = await this._verification.findOne({ code }, { relations: ['user'] });
      if (!verification) {
        throw 'verification not found';
      }
      verification.user.verified = true;
      await this._user.save(verification.user);
      return { ok: true };
    } catch (error) {
      return { ok: false, error };
    }
  }
}
