import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, ILike, FindOptionsWhere } from 'typeorm';
import { Article } from './article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { FindArticlesQueryDto } from "./dto/find-article.dto";
import { AuthUser } from "../auth/interface/auth-user.interface";

@Injectable()
export class ArticlesService {
  private readonly LIST_CACHE_PREFIX = 'articles:list';
  private readonly ONE_CACHE_PREFIX = 'articles:one';

  constructor(
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async findAll(query: FindArticlesQueryDto) {
    const {
      page = 1,
      limit = 10,
      title,
      publishedFrom,
      publishedTo,
      authorId,
    } = query;

    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;

    const cacheKey = this.getListCacheKey({
      page,
      take,
      title,
      publishedFrom,
      publishedTo,
      authorId,
    });

    const cached = await this.cacheManager.get<{
      data: Article[];
      total: number;
      page: number;
      pages: number;
    }>(cacheKey);

    if (cached) return cached;

    const where: FindOptionsWhere<Article> = {};

    if (title) where.title = ILike(`%${title}%`);

    if (publishedFrom || publishedTo) {
      where.publishedAt = Between(
        publishedFrom ? new Date(publishedFrom) : new Date('1970-01-01'),
        publishedTo ? new Date(publishedTo) : new Date(),
      );
    }

    if (authorId) where.authorId = authorId;

    const [data, total] = await this.articlesRepository.findAndCount({
      where,
      relations: { author: true },
      order: { publishedAt: 'DESC' },
      skip,
      take,
    });

    const result = {
      data,
      total,
      page,
      pages: Math.ceil(total / take),
    };

    await this.cacheManager.set(cacheKey, result, 300);
    return result;
  }

  async findOne(id: number): Promise<Article> {
    const cacheKey = `${this.ONE_CACHE_PREFIX}:${id}`;

    const cached = await this.cacheManager.get<Article>(cacheKey);
    if (cached) return cached;

    const article = await this.articlesRepository.findOne({
      where: { id },
      relations: { author: true },
    });

    if (!article) throw new NotFoundException();

    await this.cacheManager.set(cacheKey, article, 600);
    return article;
  }

  async create(dto: CreateArticleDto, user: AuthUser) {
    const article = this.articlesRepository.create({
      title: dto.title,
      description: dto.description,
      publishedAt: dto.publishedAt
                   ? new Date(dto.publishedAt)
                   : new Date(),
      authorId: user.id,
    });

    const saved = await this.articlesRepository.save(article);
    await this.invalidateListCache();

    return saved;
  }

  async update(
    id: number,
    dto: UpdateArticleDto,
    user: AuthUser,
  ) {
    const article = await this.findByIdOrFail(id);

    if (article.authorId !== user.id) {
      throw new ForbiddenException('Not your article');
    }

    if (dto.title !== undefined) article.title = dto.title;
    if (dto.description !== undefined) article.description = dto.description;
    if (dto.publishedAt)
      article.publishedAt = new Date(dto.publishedAt);

    const saved = await this.articlesRepository.save(article);

    await this.cacheManager.del(`${this.ONE_CACHE_PREFIX}:${id}`);
    await this.invalidateListCache();

    return saved;
  }

  async remove(id: number, user: AuthUser) {
    const article = await this.findByIdOrFail(id);

    if (article.authorId !== user.id) {
      throw new ForbiddenException('Not your article');
    }

    await this.articlesRepository.delete(id);
    await this.cacheManager.del(`${this.ONE_CACHE_PREFIX}:${id}`);
    await this.invalidateListCache();
  }

  private async findByIdOrFail(id: number): Promise<Article> {
    const article = await this.articlesRepository.findOne({
      where: { id },
    });

    if (!article) throw new NotFoundException();
    return article;
  }

  private async invalidateListCache() {
    await this.cacheManager.del(`${this.LIST_CACHE_PREFIX}:*`);
  }

  private getListCacheKey(params: {
    page: number;
    take: number;
    title?: string;
    publishedFrom?: string;
    publishedTo?: string;
    authorId?: number;
  }) {
    const { page, take, title, publishedFrom, publishedTo, authorId } = params;

    return `${this.LIST_CACHE_PREFIX}:${page}:${take}:${title ?? ''}:${authorId ?? ''}:${publishedFrom ?? ''}:${publishedTo ?? ''}`;
  }
}
