import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse, ApiForbiddenResponse, ApiNotFoundResponse
} from '@nestjs/swagger';
import { FindArticlesQueryDto } from "./dto/find-article.dto";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { AuthUser } from "../auth/interface/auth-user.interface";

@ApiTags('articles')
@ApiBearerAuth()
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of articles' })
  @ApiOkResponse({
    description: 'Paginated list of articles',
    schema: {
      example: {
        data: [
          {
            id: 1,
            title: 'NestJS best practices',
            description: '...',
            publishedAt: '2026-01-01T10:00:00.000Z',
            author: {
              id: 1,
              username: 'admin',
            },
          },
        ],
        total: 1,
        page: 1,
        pages: 1,
      },
    },
  })
  findAll(@Query() query: FindArticlesQueryDto) {
    return this.articlesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get article by id' })
  @ApiOkResponse({
    description: 'Article found',
    schema: {
      example: {
        id: 1,
        title: 'NestJS best practices',
        description: '...',
        publishedAt: '2026-01-01T10:00:00.000Z',
        author: {
          id: 1,
          username: 'admin',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Article not found',
  })
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create new article' })
  @ApiCreatedResponse({
    description: 'Article created successfully',
    schema: {
      example: {
        id: 1,
        title: 'NestJS best practices',
        description: '...',
        publishedAt: '2026-01-01T10:00:00.000Z',
        authorId: 1,
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  create(
    @Body() dto: CreateArticleDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.articlesService.create(dto, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update article' })
  @ApiOkResponse({ description: 'Article updated' })
  @ApiForbiddenResponse({ description: 'Not article author' })
  @ApiNotFoundResponse({ description: 'Article not found' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateArticleDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.articlesService.update(+id, dto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete article' })
  @ApiOkResponse({
    description: 'Article deleted successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiForbiddenResponse({
    description: 'Not article author',
  })
  @ApiNotFoundResponse({
    description: 'Article not found',
  })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.articlesService.remove(+id, user);
  }
}