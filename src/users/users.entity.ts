import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from 'typeorm';
import { Article } from '../articles/article.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('user')
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ unique: true })
  @Index()
  username: string;

  @Column({ select: false })
  password: string;

  @OneToMany(() => Article, (article) => article.author)
  articles: Article[];
}