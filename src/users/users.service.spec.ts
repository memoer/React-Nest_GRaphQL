import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { JwtService } from '~/jwt/jwt.service';
type QueryBuilderKeys = 'select' | 'where' | 'getOne' | 'insert' | 'into' | 'values' | 'execute';
// Service Class 내부에 존재하는 함수 하나하나를 테스트 -> 유닛 테스트
describe('UsersService', () => {
  const createQueryBuilder: jest.Mock<Record<
    QueryBuilderKeys,
    jest.Mock
  >> = jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    into: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    execute: jest.fn().mockReturnThis(),
  });
  const mockRepository = () => ({
    createQueryBuilder,
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  });
  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };
  const mockUser = { id: 1, email: 'test@naver.com', password: 'q1w2e3', role: 0, verified: true };

  let service: UsersService; // 모든 테스트에서 실행된다.
  let usersRepository: ReturnType<typeof mockRepository>;
  let verificationRepository: ReturnType<typeof mockRepository>;
  let jwtService: typeof mockJwtService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(getRepositoryToken(User));
    verificationRepository = module.get(getRepositoryToken(Verification));
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    // implementation 때문에 해주어야 한다.
    // 해주지 않으면, 맨 마지막으로 implementation 을 기반으로 getOne mock 함수가 호출된다.
    // 1 -> 2 -> 3 test 를 가정했을 때, 2번 test 에서 getOne resolveValue -> id:"1" 로 한다면
    // 3 test 에서는 resolveValue를 따로 해주지 않아도 id:"1" 로 리턴된다.
    usersRepository.createQueryBuilder().getOne.mockReset();
    // 해주지 않으면, createQueryBuilder 내부 getOne을 예로 들때 횟수가 계속해서 누적된다.
    // 1 -> 2 -> 3 test 를 가정했을 때, 2번 test 까지 총 4번이 호출되었다면,
    // 3 test 에서는 getOne 에 대한 예상 호출 횟수를 5로 해주어야 한다. ( 예상 호출 횟수가 1이 아니라 )
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserByEmail', () => {
    it('no select', async () => {
      const query = usersRepository.createQueryBuilder();
      query.getOne.mockResolvedValue(mockUser);
      const result = await service.getUserByEmail(mockUser.email);
      expect(query.where).toHaveBeenNthCalledWith(1, 'email = :email', expect.any(Object));
      expect(query.getOne).toHaveBeenCalledTimes(1);
      expect(result).toMatchObject(mockUser);
    });
    it('select', async () => {
      const select = ['email'];
      const query = usersRepository.createQueryBuilder();
      await service.getUserByEmail(mockUser.email, select);
      expect(query.select).toHaveBeenNthCalledWith(
        1,
        select.map(data => `User.${data}`),
      );
    });
  });

  describe('getUserById', () => {
    it('return user', async () => {
      const query = usersRepository.createQueryBuilder();
      query.getOne.mockResolvedValue(mockUser);
      const result = await service.getUserById(mockUser.id);
      expect(query.where).toHaveBeenNthCalledWith(1, 'id = :id', { id: mockUser.id });
      expect(query.getOne).toHaveBeenCalledTimes(1);
      expect(result).toMatchObject(mockUser);
    });
  });

  describe('createUser', () => {
    it('success', async () => {
      const query = usersRepository.createQueryBuilder();
      query.execute.mockResolvedValue(mockUser);
      const result = await service.createUser(mockUser);
      expect(query.insert).toHaveBeenCalledTimes(1);
      expect(query.into).toHaveBeenNthCalledWith(1, User);
      expect(query.values).toHaveBeenNthCalledWith(1, mockUser);
      expect(query.execute).toHaveBeenCalledTimes(1);
      expect(result).toMatchObject(mockUser);
    });
  });

  describe('checkUser', () => {
    it('should not fail without expection', async () => {
      usersRepository.createQueryBuilder().getOne.mockResolvedValue(undefined);
      const result = await service.checkUser(mockUser.email);
      expect(result).toBeUndefined();
    });
    it('should fail on expection', async () => {
      usersRepository.createQueryBuilder().getOne.mockResolvedValue(mockUser);
      expect(service.checkUser(mockUser)).rejects.toEqual(
        'There is a user with that email already',
      );
    });
  });

  describe('createAccount', () => {
    const { id, verified, ...user } = mockUser;
    const verification = { code: 'test-code', user };
    it('should fail if user exists', async () => {
      usersRepository.findOne.mockResolvedValue(user);
      const result = await service.createAccount(user);
      expect(result).toMatchObject({ ok: false, error: 'There is a user with that email already' });
    });
    it('should create a new user', async () => {
      usersRepository.findOne.mockResolvedValue(undefined);
      usersRepository.create.mockReturnValue(user);
      usersRepository.save.mockResolvedValue(user);
      verificationRepository.create.mockReturnValue(verification);
      const result = await service.createAccount(user);
      expect(usersRepository.create).toHaveBeenNthCalledWith(1, user);
      expect(usersRepository.save).toHaveBeenNthCalledWith(1, user);
      expect(verificationRepository.create).toHaveBeenNthCalledWith(1, { user });
      expect(verificationRepository.save).toHaveBeenNthCalledWith(1, verification);
      expect(result).toEqual({ ok: true });
    });
    it('should fail on exception', async () => {
      const error = new Error('error');
      usersRepository.findOne.mockRejectedValue(error);
      const result = await service.createAccount(mockUser);
      expect.assertions(1);
      expect(result).toEqual({ ok: false, error });
    });
  });

  describe('login', () => {
    it('should fail if user does not exist', async () => {
      const user = {
        email: mockUser.email,
        password: mockUser.password,
      };
      usersRepository.createQueryBuilder().getOne.mockResolvedValue(undefined);
      const result = await service.login(user);
      expect(result).toEqual({ ok: false, error: 'User not found' });
    });

    it('should fail if the password is wrong', async () => {
      const user = {
        email: mockUser.email,
        password: mockUser.password,
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };
      usersRepository.createQueryBuilder().getOne.mockResolvedValue(user);
      const result = await service.login(user);
      expect(result).toEqual({ ok: false, error: 'Wrong Password' });
      expect(user.checkPassword).toHaveBeenNthCalledWith(1, user.password);
    });

    it('should return token if password correct', async () => {
      const token = 'token';
      const user = {
        id: mockUser.id,
        email: mockUser.email,
        password: mockUser.password,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };
      usersRepository.createQueryBuilder().getOne.mockResolvedValue(user);
      jwtService.sign.mockReturnValue(token);
      const result = await service.login(user);
      expect(user.checkPassword).toHaveBeenNthCalledWith(1, user.password);
      expect(jwtService.sign).toHaveBeenNthCalledWith(1, expect.any(Number));
      expect(result).toEqual({ ok: true, token });
    });

    it('should fail on exception', async () => {
      const error = new Error('error');
      const user = {
        id: mockUser.id,
        email: mockUser.email,
        password: mockUser.password,
        checkPassword: jest.fn(() => Promise.reject(error)),
      };
      usersRepository.createQueryBuilder().getOne.mockResolvedValue(user);
      const result = await service.login(user);
      expect(result).toEqual({ ok: false, error });
    });
  });

  describe('editProfile', () => {
    const infoToChange = {
      email: 'changed@email.com',
      password: 'changedPassword',
    };
    const updatedUser = {
      ...mockUser,
      ...infoToChange,
      verified: false,
    };
    const updatedVerification = {
      code: 'updated',
      user: mockUser,
    };
    it('should change email & password', async () => {
      usersRepository.createQueryBuilder().getOne.mockResolvedValue(mockUser);
      usersRepository.save.mockResolvedValue(updatedUser);
      verificationRepository.create.mockReturnValue(updatedVerification);
      const result = await service.editProfile(mockUser.id, infoToChange);
      expect(verificationRepository.create).toHaveBeenNthCalledWith(1, { user: updatedUser });
      expect(verificationRepository.save).toHaveBeenNthCalledWith(1, updatedVerification);
      expect(usersRepository.save).toHaveBeenNthCalledWith(1, updatedUser);
      expect(result).toEqual(updatedUser);
    });
  });
  describe('verifyEmail', () => {
    const input = { code: 'code' };
    it('should fail if verification does not exists', async () => {
      verificationRepository.findOne.mockResolvedValue(null);
      const result = await service.verifyEmail(input);
      expect(verificationRepository.findOne).toHaveBeenNthCalledWith(1, input, {
        relations: ['user'],
      });
      expect(result).toEqual({ ok: false, error: 'verification not found' });
    });

    it('should change user verified', async () => {
      const verification = { code: input.code, user: { ...mockUser, verified: false } };
      verificationRepository.findOne.mockResolvedValue(verification);
      const result = await service.verifyEmail(input);
      expect(usersRepository.save).toHaveBeenNthCalledWith(1, {
        ...verification.user,
        verified: true,
      });
      expect(result).toEqual({ ok: true });
    });
  });
});
