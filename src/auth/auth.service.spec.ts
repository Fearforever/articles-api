import { AuthService } from "./auth.service";
import { Test } from "@nestjs/testing";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';


describe('AuthService', () => {
  const usersService = {
    findByUsernameWithPassword: jest.fn(),
    findByUsername: jest.fn(),
    create: jest.fn(),
  };

  const jwtService = {
    sign: jest.fn(),
  };

  let service: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should register user and return token', async () => {
    usersService.findByUsernameWithPassword.mockResolvedValue(null);
    usersService.create.mockResolvedValue({ id: 1, username: 'test' });
    jwtService.sign.mockReturnValue('jwt');

    const result = await service.register('test', 'password');

    expect(usersService.create).toHaveBeenCalled();
    expect(result).toEqual({ access_token: 'jwt' });
  });

  it('should throw if username exists', async () => {
    usersService.findByUsername.mockResolvedValue({ id: 1 });

    await expect(
      service.register('test', 'password'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should login user and return token', async () => {
    const user = {
      id: 1,
      username: 'test',
      password: await bcrypt.hash('password', 10),
    };

    usersService.findByUsernameWithPassword.mockResolvedValue(user);
    jwtService.sign.mockReturnValue('jwt');

    const result = await service.login('test', 'password');

    expect(result.access_token).toBe('jwt');
  });

  it('should throw on invalid credentials', async () => {
    usersService.findByUsernameWithPassword.mockResolvedValue(null);

    await expect(
      service.login('test', 'password'),
    ).rejects.toThrow(UnauthorizedException);
  });
})