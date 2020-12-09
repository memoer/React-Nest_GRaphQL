import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection } from 'typeorm';
import { LoginOutput } from '~/users/dtos/login.dto';
import { User } from '~/users/entities/user.entity';
import { UserProfileOutput } from '~/users/dtos/user-profile.dto';

interface TestFn {
  (res: request.Response): void;
}
interface OtherProcess<T> {
  (data: T): void;
}
interface RunTestPamras<T> {
  query: string;
  dataName: string;
  ok: boolean;
  otherProcess?: OtherProcess<T>;
  status?: number;
  errorMsg?: string;
  set?: string;
}

describe('UserController (e2e)', () => {
  //* setting before test
  let app: INestApplication;
  //* common variables
  const USER = {
    ID: null,
    EMAIL: 'test@naver.com',
    PASSWORD: 'q1w2e3',
    TOKEN: null,
  };
  class CommonPackage<T extends Record<string, any>> {
    private readonly _data: T;
    private readonly _otherProcess: RunTestPamras<T>['otherProcess'];
    private readonly _ok: RunTestPamras<T>['ok'];
    private readonly _errorMsg: RunTestPamras<T>['errorMsg'];
    public constructor(
      options: Pick<RunTestPamras<T>, 'ok' | 'dataName' | 'otherProcess' | 'errorMsg'> & {
        res: request.Response;
      },
    ) {
      const { res, ok, dataName, errorMsg, otherProcess } = options;
      this._data = res.body.data[dataName];
      this._ok = ok;
      if (otherProcess) this._otherProcess = otherProcess;
      if (errorMsg) this._errorMsg = errorMsg;
    }
    public expectCommonOutput = (): void => {
      const { ok, error } = this._data;
      const errorMsg = this._errorMsg || expect.any(String);
      // expect.any(String) -> toEqual 로만 정상적으로 작동
      // toBe 로 하면 예상과 다르게 출력 -> error ( 객체 주소까지 비교해서 )
      expect(ok).toBe(this._ok);
      expect(error).toEqual(ok ? null : errorMsg);
      if (this._otherProcess) this._otherProcess(this._data);
    };
  }
  const expectResult = <T>(
    options: Pick<RunTestPamras<T>, 'ok' | 'dataName' | 'otherProcess' | 'errorMsg'>,
  ): TestFn => res => {
    const commonPacakge = new CommonPackage<T>({ res, ...options });
    commonPacakge.expectCommonOutput();
  };
  const runTest = <T>(options: RunTestPamras<T>): request.Test => {
    const { query, status = 200, set, ...rest } = options;
    const req = request(app.getHttpServer()).post('/graphql');
    if (set) {
      req.set('x-jwt', set);
    }
    return req
      .send({ query })
      .expect(status)
      .expect(expectResult<T>(rest));
  };
  //* settings
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });
  afterAll(async () => {
    await getConnection().dropDatabase(); // 모든 테스트가 완료되면 모든 Table 을 지운다.
    app.close();
  });
  //* describe - 1
  describe('createAccount', () => {
    const query = `mutation{
      createAccount(input:{email:"${USER.EMAIL}", password:"${USER.PASSWORD}", role:CLIENT}){
        ok
        error
      }
    }`;
    it('should create account', () => runTest({ query, ok: true, dataName: 'createAccount' }));

    it('should fail if account already exists', () =>
      runTest({ query, ok: false, dataName: 'createAccount' }));
  });
  //* describe - 2
  describe('login', () => {
    const query = ({ email = USER.EMAIL, password = USER.PASSWORD } = {}) => `mutation{
      login(input:{email:"${email}", password:"${password}"}){
        ok
        error
        token
      }
    }`;
    it('should login with correct credentials', () =>
      runTest<LoginOutput>({
        query: query(),
        ok: true,
        dataName: 'login',
        otherProcess: data => {
          USER.TOKEN = data.token;
          expect(data.token).toEqual(expect.any(String));
        },
      }));

    it('should not be able to login with wrong email', () =>
      runTest<LoginOutput>({
        query: query({ email: '123@naver.com' }),
        ok: false,
        dataName: 'login',
        errorMsg: 'User not found',
      }));

    it('should not be able to login with wrong password', () =>
      runTest<LoginOutput>({
        query: query({ password: '123' }),
        ok: false,
        dataName: 'login',
        errorMsg: 'Wrong Password',
      }));
  });
  //
  describe('me', () => {
    const query = `query{
      me{
        id
      }
    }`;
    it('should return user info with correct JWT', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .set('x-jwt', USER.TOKEN)
        .send({ query })
        .expect(200)
        .expect(res => {
          const { id } = res.body.data.me;
          USER.ID = id;
          expect(id).toEqual(expect.any(Number));
        }));

    it('should throw error on 403 status code with incorrect JWT', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(res => expect(res.body.errors[0].message).toEqual('Forbidden resource')));
  });
  //
  describe('userProfile', () => {
    it('should find a profile', () => {
      return runTest<UserProfileOutput>({
        query: `query{
          userProfile(userId:${USER.ID}){
            ok
            error
            user{
              id
            }
          }
        }`,
        ok: true,
        dataName: 'userProfile',
        set: USER.TOKEN,
        otherProcess: data => {
          console.log(data);
          expect(data.user.id).toEqual(USER.ID);
        },
      });
    });

    it('should not find a profile', () => {
      return runTest({
        query: `query{
          userProfile(userId:999){
            ok
            error
          }
        }`,
        ok: false,
        dataName: 'userProfile',
        errorMsg: 'User Not Found',
        set: USER.TOKEN,
      });
    });
  });
  //
  it.todo('verifyEmail');
  //
  it.todo('editProfile');
});
