import { UsersService } from "./users.service";
import { User } from "./users.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Test } from "@nestjs/testing";

describe('UsersService', () => {
  let service: UsersService;

  const repo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repo },
      ],
    }).compile();

    service = module.get(UsersService);
  })

  it('should create user', async () => {
    repo.create.mockReturnValue({ username: 'test' });
    repo.save.mockResolvedValue({ id: 1 });

    const user = await service.create('test', 'hash');

    expect(repo.save).toHaveBeenCalled();
    expect(user.id).toBe(1);
  });
})