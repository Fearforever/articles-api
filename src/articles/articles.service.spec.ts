import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesService } from './articles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Article } from './article.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('ArticlesService', () => {
  let service;
  let mockRepo;
  let mockCache;

  beforeEach(async () => {
    mockRepo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      store: { keys: jest.fn().mockResolvedValue([]) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        { provide: getRepositoryToken(Article), useValue: mockRepo },
        { provide: CACHE_MANAGER, useValue: mockCache },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
  });

  it('should return cached list if exists', async () => {
    const cachedResult = { data: [], total: 0 };
    mockCache.get.mockResolvedValue(cachedResult);

    const result = await service.findAll({});
    expect(result).toBe(cachedResult);
    expect(mockRepo.findAndCount).not.toHaveBeenCalled();
  });

  it('should query DB and cache on miss', async () => {
    mockCache.get.mockResolvedValue(null);
    mockRepo.findAndCount.mockResolvedValue([[], 0]);

    await service.findAll({});
    expect(mockRepo.findAndCount).toHaveBeenCalled();
    expect(mockCache.set).toHaveBeenCalled();
  });

  it('should return article by id', async () => {
    const article = { id: 1 };
    mockRepo.findOne.mockResolvedValue(article);

    const result = await service.findOne(1);
    expect(result).toEqual(article);
  });

  it('should throw if article not found', async () => {
    mockRepo.findOne.mockResolvedValue(null);

    await expect(service.findOne(1)).rejects.toThrow();
  });

  it('should create article and clear cache', async () => {
    const dto = { title: 'test', description: 'desc' };
    const article = { id: 1, ...dto };

    mockRepo.create.mockReturnValue(article);
    mockRepo.save.mockResolvedValue(article);

    await service.create(dto, { id: 1 });

    expect(mockRepo.create).toHaveBeenCalled();
    expect(mockRepo.save).toHaveBeenCalled();
    expect(mockCache.del).toHaveBeenCalled();
  });

  it('should delete article and clear cache', async () => {
    mockRepo.findOne.mockResolvedValue({ id: 1, authorId: 1 });
    mockRepo.delete.mockResolvedValue({ affected: 1 });

    await service.remove(1, { id: 1 });

    expect(mockRepo.delete).toHaveBeenCalledWith(1);
    expect(mockCache.del).toHaveBeenCalledWith('articles:one:1');
    expect(mockCache.del).toHaveBeenCalledWith('articles:list:*');
  });

});