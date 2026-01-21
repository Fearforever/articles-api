import { IsString, Length, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({
    example: 'NestJS best practices',
    description: 'Article title',
  })
  @IsString()
  @Length(5, 100)
  title: string;

  @ApiProperty({
    example: 'Detailed article description...',
    description: 'Article content',
  })
  @IsString()
  description: string;

  @ApiProperty({
    required: false,
    example: '2026-01-01T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}