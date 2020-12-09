import { Injectable, Inject } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { User } from '~/users/entities/user.entity';
import { JwtModuleOptions } from './jwt.interface';
import { JWT_OPTIONS } from './jwt.constants';

@Injectable()
export class JwtService {
  constructor(@Inject(JWT_OPTIONS) private readonly jwtOptions: JwtModuleOptions) {}
  sign(userId: User['id']): string {
    return jwt.sign({ id: userId }, this.jwtOptions.privateKey);
  }
  verify(token: Parameters<typeof jwt['verify']>['0']) {
    return jwt.verify(token, this.jwtOptions.privateKey);
  }
}
