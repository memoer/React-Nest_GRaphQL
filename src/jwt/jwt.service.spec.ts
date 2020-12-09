import { Test, TestingModule } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';
import { JwtService } from './jwt.service';
import { JWT_OPTIONS } from './jwt.constants';

const TOKEN = 'TOKEN';
const TEST_KEY = 'test-key';
const USER_ID = 1;
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => TOKEN),
  verify: jest.fn(() => ({ id: USER_ID })),
}));

describe('JwtService', () => {
  let service: JwtService;
  const userId = 1;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: JWT_OPTIONS, useValue: { privateKey: TEST_KEY } }, JwtService],
    }).compile();

    service = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('sign', () => {
    it('should return a signed token', () => {
      const result = service.sign(USER_ID);
      expect(typeof result).toBe('string');
      expect(jwt.sign).toHaveBeenNthCalledWith(1, { id: USER_ID }, TEST_KEY);
      expect(result).toEqual(TOKEN);
    });
  });
  describe('verify', () => {
    it('should return a verfied user', () => {
      const result = service.verify(TOKEN);
      expect(jwt.verify).toHaveBeenNthCalledWith(1, TOKEN, TEST_KEY);
      expect(result).toEqual({ id: USER_ID });
    });
  });
});
