import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, InsertResult } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly _user: Repository<User>) {}
  getUserByEmail(email: User['email']) {
    return this._user
      .createQueryBuilder()
      .where('email = :email', { email })
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
}
