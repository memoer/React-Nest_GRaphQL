import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // should be return true OR false
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext['user'];
    return !!user;
  }
}
